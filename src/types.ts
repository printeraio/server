import { type IncomingHttpHeaders } from 'http2';
import { type Request as BaseRequest } from 'express';

export type TokenPayload = {
  id: string;
  email: string;
};

export type RequestHeaders = IncomingHttpHeaders & { user: TokenPayload };

export interface Request extends BaseRequest {
  headers: RequestHeaders;
  body: any;
}

export type PolicyDocument = {
  Version: string;
  Statement: PolicyDocumentStatement[];
};

export type PolicyDocumentStatement = {
  Effect: string;
  Action: string;
  Resource: string;
};
