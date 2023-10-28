type CreateClientPolicyDocumentArgType = {
  userId?: string;
  clientId: string;
};

export const createClientPolicyDocument = ({ userId, clientId }: CreateClientPolicyDocumentArgType) => [
  {
    Effect: 'Allow',
    Action: 'iot:Connect',
    Resource: `arn:aws:iot:eu-central-1:284162407179:client/${userId ?? clientId}`,
  },
  {
    Effect: 'Allow',
    Action: 'iot:Subscribe',
    Resource: `arn:aws:iot:eu-central-1:284162407179:topicfilter/${clientId}/*`,
  },
  {
    Effect: 'Allow',
    Action: 'iot:Receive',
    Resource: `arn:aws:iot:eu-central-1:284162407179:topic/${clientId}/*`,
  },
  {
    Effect: 'Allow',
    Action: 'iot:Publish',
    Resource: `arn:aws:iot:eu-central-1:284162407179:topic/${clientId}/*`,
  },
];
