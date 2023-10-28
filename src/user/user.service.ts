import { Inject, Injectable } from '@nestjs/common';
import {
  CognitoIdentityClient,
  CreateIdentityPoolCommand,
  SetIdentityPoolRolesCommand,
} from '@aws-sdk/client-cognito-identity';
import { AttachRolePolicyCommand, CreatePolicyCommand, CreateRoleCommand, IAMClient } from '@aws-sdk/client-iam';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

import { awsArn, awsCredentials, awsKeys } from '@app/constants';
import { DB, DbType } from '@app/global/providers/db.provider';
import { type PolicyDocument } from '@app/types';
import { userColumns, users } from '@app/user/user.schema';
import { assumeRolePolicyDocument, policyDocument } from '@app/user/utils';
import { createClientPolicyDocument } from '@app/utils/aws';

type ConfigureIdentityRoleArgType = {
  userId: string;
  clientId: string;
};

@Injectable()
export class UserService {
  constructor(@Inject(DB) private readonly db: DbType) {}

  async findOne(id: string) {
    const response = await this.db.select(userColumns).from(users).where(eq(users.id, id)).limit(1).execute();
    return response[0];
  }

  async findOneByEmail(email: string) {
    const response = await this.db.select().from(users).where(eq(users.email, email)).limit(1).execute();
    return response[0];
  }

  async create(email: string, password: string, firstName: string, lastName: string) {
    const id = createId();
    const apiKey = createId();
    await this.db.insert(users).values({ id, email, password, apiKey, firstName, lastName }).execute();

    const usersResponse = await this.db.select(userColumns).from(users).where(eq(users.id, id)).limit(1).execute();
    await this.createUserIdentity({ id });
    return usersResponse[0];
  }

  // #region Create User Identity
  /* 
    STEPS:
    Step 1: Create Identity Pool
    Step 2: Create IAM Roles for Cognito Identity
    Step 3: Create IAM Policies for Cognito Identity Roles
    Step 4: Attach IAM Policies to IAM Roles
    Step 5: Set Roles To The Cognito Identity Pool
  */
  async createUserIdentity({ id }: { id: string }): Promise<string | undefined> {
    try {
      const cognitoIdentityClient = new CognitoIdentityClient([awsCredentials]);
      const iamClient = new IAMClient(awsCredentials);
      const identityPoolName = id.replace('-', '');

      // Step 1: Create Identity Pool
      const createIdentityPoolCommand = new CreateIdentityPoolCommand({
        AllowUnauthenticatedIdentities: true,
        IdentityPoolName: identityPoolName,
        CognitoIdentityProviders: [
          { ClientId: process.env.AWS_USER_POOL_WEB_CLIENT_ID, ProviderName: awsArn.userPool },
        ],
      });
      const identityPool = await cognitoIdentityClient.send(createIdentityPoolCommand);

      // Step 2: Create IAM Roles for Cognito Identity
      const identityPoolId = identityPool.IdentityPoolId;
      if (!identityPoolId) {
        console.log('[create-user-identity] identityPoolId is not found', { identityPool });
        return undefined;
      }
      const authRoleCommand = new CreateRoleCommand({
        RoleName: awsKeys.user.authenticatedIdentityRole(id),
        AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDocument({ identityPoolId, authenticated: true })),
      });
      const unauthRoleCommand = new CreateRoleCommand({
        RoleName: awsKeys.user.identityRole(id),
        AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDocument({ identityPoolId, authenticated: false })),
      });
      const { Role: authRole } = await iamClient.send(authRoleCommand);
      const { Role: unauthRole } = await iamClient.send(unauthRoleCommand);

      // Step 3: Create IAM Policies for Cognito Identity Roles
      const authPolicyCommand = new CreatePolicyCommand({
        PolicyName: awsKeys.user.authenticatedPolicy(id),
        PolicyDocument: JSON.stringify(policyDocument),
      });
      const unauthPolicyCommand = new CreatePolicyCommand({
        PolicyName: awsKeys.user.identityPolicy(id),
        PolicyDocument: JSON.stringify(policyDocument),
      });

      const { Policy: authPolicy } = await iamClient.send(authPolicyCommand);
      const { Policy: unauthPolicy } = await iamClient.send(unauthPolicyCommand);

      // Step 4: Attach IAM Policies to IAM Roles
      const attachAuthRolePolicyCommand = new AttachRolePolicyCommand({
        PolicyArn: authPolicy?.Arn,
        RoleName: authRole?.RoleName,
      });
      const attachUnauthRolePolicyCommand = new AttachRolePolicyCommand({
        PolicyArn: unauthPolicy?.Arn,
        RoleName: unauthRole?.RoleName,
      });

      await iamClient.send(attachAuthRolePolicyCommand);
      await iamClient.send(attachUnauthRolePolicyCommand);

      // Step 5: Set Roles To The Cognito Identity Pool
      if (!authRole?.Arn || !unauthRole?.Arn) {
        console.log('[create-user-identity] authRole or unauthRole is not found', { authRole, unauthRole });
        return undefined;
      }
      const setIdentityPoolRolesCommand = new SetIdentityPoolRolesCommand({
        IdentityPoolId: identityPoolId,
        Roles: { authenticated: authRole?.Arn, unauthenticated: unauthRole?.Arn },
      });
      await cognitoIdentityClient.send(setIdentityPoolRolesCommand);

      return identityPoolId;
    } catch (error: unknown) {
      console.log('[create-user-identity] could not create a user identity', { error, id });
    }
  }
  // #endregion

  // #region Configure User IAM Policy
  /* 
    STEPS:
    Step 1: Create User IAM Policy for IoT Client
    Step 2: Attach User IAM Policy to User IAM Role
  */
  async configureIdentityRole({ userId, clientId }: ConfigureIdentityRoleArgType) {
    try {
      const iamClient = new IAMClient(awsCredentials);

      // Step 1: Create User IAM Policy for IoT Client
      const policyDocumentStatement: PolicyDocument['Statement'] = createClientPolicyDocument({ clientId, userId });
      const policyDocument: PolicyDocument = {
        Version: '2012-10-17',
        Statement: policyDocumentStatement,
      };
      const createClientPolicyCommand = new CreatePolicyCommand({
        PolicyName: awsKeys.client.identityPolicy(clientId),
        PolicyDocument: JSON.stringify(policyDocument),
      });

      const { Policy } = await iamClient.send(createClientPolicyCommand);

      // Step 2: Attach User IAM Policy to User IAM Role
      const attachRolePolicyCommand = new AttachRolePolicyCommand({
        PolicyArn: Policy?.Arn,
        RoleName: awsKeys.user.identityRole(userId),
      });
      await iamClient.send(attachRolePolicyCommand);
    } catch (error: unknown) {
      console.log('[configure-identity-role] could not update identity role', { error, userId });
    }
  }
  // #endregion
}
