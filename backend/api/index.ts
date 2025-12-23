// IMMEDIATE LOGGING - At the very top, before any imports
console.log('=== MODULE LOADING START ===');
console.log('Timestamp:', new Date().toISOString());

import serverless from 'serverless-http';
console.log('=== serverless-http imported ===');

// DON'T import createNestApp at top level - import it lazily in handler
// Top-level import triggers NestJS module initialization which hangs
console.log('=== MODULE LOADED COMPLETELY (without NestJS import) ===');

// Cache the serverless handler to reduce cold starts
let cachedHandler: any;
let isInitializing = false;
let initError: Error | null = null;
let initializationPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  // IMMEDIATE LOGGING - This should appear FIRST in logs
  console.log('=== HANDLER CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
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
      (async () => {
        // Lazy import createNestApp to avoid hanging during module load
        console.log('=== LAZY IMPORTING createNestApp ===');
        const { createNestApp } = await import('../src/main');
        console.log('=== createNestApp imported successfully ===');
        return createNestApp();
      })().then((app) => {
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
  
  console.log('About to call cachedHandler');
  const result = await cachedHandler(req, res);
  console.log('Handler execution completed');
  return result;
  } catch (error) {
    console.error('=== FATAL ERROR IN HANDLER ===');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

