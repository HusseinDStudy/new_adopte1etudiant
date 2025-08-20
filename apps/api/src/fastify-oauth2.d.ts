import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    google: {
      getAccessTokenFromAuthorizationCodeFlow(request: FastifyRequest): Promise<{ token: { access_token: string, refresh_token: string, expires_in: number } }>;
    };
    googleDelete: {
      getAccessTokenFromAuthorizationCodeFlow(request: FastifyRequest): Promise<{ token: { access_token: string, refresh_token: string, expires_in: number } }>;
    };
  }
}

interface FastifyRequest {
  user?: { id: string; email: string; role: string };
}

declare module 'fastify-oauth2'; 