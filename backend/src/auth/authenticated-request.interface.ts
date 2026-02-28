import { Request } from 'express';

export interface AuthenticatedUser {
  sub: number;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
