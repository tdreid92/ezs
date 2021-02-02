import { PayloadRequest, PayloadResponse } from '../models/invoker/payload';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Merge } from '../types/match';
import { HttpError } from 'http-errors';

export type APIGatewayPostEvent<Body> = Merge<
  APIGatewayProxyEventV2,
  {
    body: Body;
  }
>;
export type APIGatewayGetEvent<PathParameters> = Merge<
  APIGatewayProxyEventV2,
  {
    pathParameters?: PathParameters;
  }
>;
export type APIGatewayEvent<T = any, U = any> = APIGatewayPostEvent<T> | APIGatewayGetEvent<U>;
export type APIGatewayResult = APIGatewayProxyStructuredResultV2 | HttpError;
export type EventRequest<T = any, U = any> = APIGatewayEvent<T> | PayloadRequest<U>;
export type EventResponse<T = any> = APIGatewayProxyStructuredResultV2 | PayloadResponse<T>;
