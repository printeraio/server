export const policyDocument = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Action: ['mobileanalytics:PutEvents', 'cognito-sync:*', 'cognito-identity:*'],
      Resource: ['*'],
    },
  ],
};

export const assumeRolePolicyDocument = ({
  identityPoolId,
  authenticated,
}: {
  identityPoolId: string;
  authenticated: boolean;
}) => ({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        Federated: 'cognito-identity.amazonaws.com',
      },
      Action: 'sts:AssumeRoleWithWebIdentity',
      Condition: {
        StringEquals: {
          ['cognito-identity.amazonaws.com:aud']: identityPoolId,
        },
        ['ForAnyValue:StringLike']: {
          ['cognito-identity.amazonaws.com:amr']: authenticated ? 'authenticated' : 'unauthenticated',
        },
      },
    },
  ],
});
