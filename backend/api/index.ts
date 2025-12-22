import serverless from 'serverless-http';
import { createNestApp } from '../src/main';

// Cache the serverless handler to reduce cold starts
let cachedHandler: any;

export default async function handler(req: any, res: any) {
  // Initialize handler on first request (cached for subsequent requests)
  if (!cachedHandler) {
    const app = await createNestApp();
    // Get the underlying Express app from NestJS
    const expressApp = app.getHttpAdapter().getInstance();
    // Convert Express app to serverless handler
    cachedHandler = serverless(expressApp);
  }
  
  return cachedHandler(req, res);
}
