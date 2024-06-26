// * To make sure that the requests coming to our private network, indeed comes via the API-GATEWAY

import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from './error-handler';

// List of valid token IDs
// TODO: Later for better security add security keys rather than just using service names 🥹
const tokens: string[] = [
  'auth',
  'seller',
  'gig',
  'search',
  'buyer',
  'message',
  'order',
  'review',
];

// Middleware function to verify requests coming from the API gateway
export function verifyGatewayRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Check if the gatewaytoken exists in the request headers
  if (!req.headers?.gatewaytoken) {
    // gatewaytoken will be attached by the gateway service

    throw new NotAuthorizedError(
      'Invalid request',
      'verifyGatewayRequest() method: Request not coming from api gateway'
    );
  }

  // Get the token from the headers
  const token: string = req.headers?.gatewaytoken as string;

  try {
    // Verify the JWT token - Token will contain the ID of the service that is making the request
    // TODO: Add the jwt secret key to verify method as 2nd argument
    const payload: { id: string; iat: number } = JWT.verify(token, '') as {
      id: string;
      iat: number;
    };

    // Check if the token's ID is in our list of valid tokens defined in the list above 👆👆👆
    if (!tokens.includes(payload.id)) {
      throw new NotAuthorizedError(
        'Invalid request',
        'verifyGatewayRequest() method: Request payload is invalid'
      );
    }
  } catch (error) {
    // If any error occurs during verification, throw a NotAuthorizedError
    throw new NotAuthorizedError(
      'Invalid request',
      'verifyGatewayRequest() method: Request not coming from api gateway'
    );
  }

  // If we've made it this far, the request is valid. Continue to the next middleware or route handler. (Express Next Middleware)
  next();
}
