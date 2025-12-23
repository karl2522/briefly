import serverless from 'serverless-http';
import { createNestApp } from '../src/main';

// Cache the serverless handler to reduce cold starts
let cachedHandler: any;
let isInitializing = false;
let initError: Error | null = null;
let initializationPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  // Return cached error if initialization failed previously
  if (initError) {
    console.error('Returning cached initialization error:', initError.message);
    return res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
    });
  }

  // If already initializing, wait for it (with timeout)
  if (initializationPromise && !cachedHandler) {
    try {
      console.log('Waiting for ongoing initialization...');
      await Promise.race([
        initializationPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout after 20s')), 20000)
        ),
      ]);
    } catch (error) {
      console.error('Error waiting for initialization:', error);
      initializationPromise = null;
      isInitializing = false;
      if (!initError) {
        initError = error as Error;
      }
      return res.status(500).json({
        error: 'Server initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Initialize handler on first request
  if (!cachedHandler && !isInitializing) {
    isInitializing = true;
    console.log('Starting NestJS app initialization...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    initializationPromise = Promise.race([
      createNestApp().then((app) => {
        console.log('NestJS app created, getting Express instance...');
        const expressApp = app.getHttpAdapter().getInstance();
        cachedHandler = serverless(expressApp);
        isInitializing = false;
        initializationPromise = null;
        console.log('Serverless handler created successfully');
        return cachedHandler;
      }),
      // Timeout after 20 seconds (Vercel free tier has 10s, but we'll try 20s for pro)
      new Promise((_, reject) => 
        setTimeout(() => {
          reject(new Error('Initialization timeout after 20 seconds. Check database connection and environment variables.'));
        }, 20000)
      ),
    ]).catch((error) => {
      isInitializing = false;
      initError = error;
      initializationPromise = null;
      console.error('Initialization error:', error);
      throw error;
    });

    try {
      await initializationPromise;
    } catch (error) {
      return res.status(500).json({
        error: 'Server initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check Vercel logs for more information. Common issues: missing DATABASE_URL, database connection timeout, or missing environment variables.',
      });
    }
  }
  
  if (!cachedHandler) {
    return res.status(503).json({
      error: 'Server is still initializing',
      message: 'Please try again in a moment',
    });
  }
  
  return cachedHandler(req, res);
}
