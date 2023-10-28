import { Inject, Injectable } from '@nestjs/common';
import { CreatePolicyCommand } from '@aws-sdk/client-iam';
import { AttachPolicyCommand, CreateKeysAndCertificateCommand, IoTClient } from '@aws-sdk/client-iot';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

import { clients } from '@app/client/client.schema';
import { awsCredentials, awsKeys } from '@app/constants';
import { DB, DbType } from '@app/global/providers/db.provider';
import { type PolicyDocument } from '@app/types';
import { userColumns, users } from '@app/user/user.schema';
import { UserService } from '@app/user/user.service';
import { createClientPolicyDocument } from '@app/utils/aws';

@Injectable()
export class ClientService {
  constructor(@Inject(DB) private readonly db: DbType) {}

  @Inject(UserService)
  private readonly userService: UserService;

  async findAll(userId: string) {
    const response = await this.db.select().from(clients).where(eq(clients.userId, userId)).execute();
    return response;
  }

  async create(userId: string) {
    const userResponse = await this.db.select(userColumns).from(users).where(eq(users.id, userId)).limit(1).execute();
    const user = userResponse[0];

    const iotClient = new IoTClient(awsCredentials);
    const createCertificateCommand = new CreateKeysAndCertificateCommand({ setAsActive: true });
    const { certificateId, certificatePem, keyPair, certificateArn } = await iotClient.send(createCertificateCommand);
    const clientId = createId();
    await this.db.insert(clients).values({
      certificateId,
      privateKey: keyPair?.PrivateKey,
      certificatePem,
      userId: user.id,
      id: clientId,
    });

    const policyDocument: PolicyDocument = {
      Version: '2012-10-17',
      Statement: createClientPolicyDocument({ clientId }),
    };

    const createIotPolicyCommand = new CreatePolicyCommand({
      PolicyName: awsKeys.client.iotPolicy(clientId),
      PolicyDocument: JSON.stringify(policyDocument),
    });
    const policy = await iotClient.send(createIotPolicyCommand);

    await this.userService.configureIdentityRole({ userId: user.id, clientId });
    const attachPolicyToThingCommand = new AttachPolicyCommand({
      policyName: policy.Policy?.PolicyName,
      target: certificateArn,
    });
    await iotClient.send(attachPolicyToThingCommand);

    const clientResponse = await this.db.select().from(clients).where(eq(clients.id, clientId)).limit(1).execute();
    return clientResponse[0];
  }
}
