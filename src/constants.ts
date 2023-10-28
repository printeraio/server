export const isProduction = process.env.NODE_ENV === 'production';

export const awsCredentials = {
  region: process.env.AWS_ACCOUNT_REGION,
  accountId: process.env.AWS_ACCOUNT_ID,
  credentials: {
    accessKeyId: process.env.AWS_ACCOUNT_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCOUNT_SECRET_KEY,
  },
};

export const awsKeys = {
  client: {
    iotPolicy: (clientId: string) => `${clientId}_Client_Iot_Policy`,
    identityPolicy: (clientId: string) => `${clientId}_Client_Identity_Policy`,
  },
  user: {
    identityRole: (id: string) => `Cognito_${id}_Unauth_Role`,
    identityPolicy: (id: string) => `Cognito_${id}_Unauth_Policy`,
    authenticatedIdentityRole: (id: string) => `Cognito_${id}_Auth_Role`,
    authenticatedPolicy: (id: string) => `Cognito_${id}_Auth_Policy`,
  },
};

export const awsArn = {
  userPool: `cognito-idp.${process.env.AWS_ACCOUNT_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}`,
  iotCertificate: (certificateId: string) =>
    `arn:aws:iot:${awsCredentials.region}:${awsCredentials.accountId}:cert/${certificateId}`,
};
