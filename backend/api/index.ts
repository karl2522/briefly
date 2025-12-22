import type { INestApplication } from '@nestjs/common';
import serverless from 'serverless-http';
import { createNestApp } from '../src/main';

// Cache the NestJS app instance to reduce cold starts
let cachedApp: INestApplication;

export default async function handler(req: any, res: any) {
  // Initialize app on first request (cached for subsequent requests)
  if (!cachedApp) {
    cachedApp = await createNestApp();
  }
  
  // Convert NestJS app to serverless handler
  return serverless(cachedApp)(req, res);
}
