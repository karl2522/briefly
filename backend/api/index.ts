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
  
  // Handle root path and /api path with helpful message
  // Note: req.url will be '/api' when accessing /api, or '/' when accessing root
  if (req.url === '/' || req.url === '' || req.url === '/api') {
    return res.status(200).json({
      message: 'Briefly API Server',
      status: 'running',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        test: '/test',
        api: '/api/*',
      },
      timestamp: new Date().toISOString(),
    });
  }
  
  // Strip /api prefix before passing to NestJS
  // NestJS has global prefix 'api', so routes are registered as /health internally
  // When request comes as /api/health, we strip /api and pass /health to NestJS
  // NestJS will then match it against the /health route (which is exposed as /api/health externally)
  const originalUrl = req.url || req.path || '/';
  console.log('[Handler] Original request URL:', originalUrl);
  
  let modifiedUrl = originalUrl;
  if (originalUrl.startsWith('/api/')) {
    modifiedUrl = originalUrl.replace('/api', '') || '/';
    console.log('[Handler] Stripped /api prefix:', { original: originalUrl, modified: modifiedUrl });
  } else if (originalUrl === '/api') {
    modifiedUrl = '/';
    console.log('[Handler] Converted /api to /');
  }
  
  // Update request URL for NestJS
  req.url = modifiedUrl;
  req.path = modifiedUrl;
  console.log('[Handler] Passing to NestJS with URL:', modifiedUrl);
  
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
    const initStartTime = Date.now();
    console.log('[Handler] Starting NestJS app initialization...');
    console.log('[Handler] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[Handler] NODE_ENV:', process.env.NODE_ENV);
    
    initializationPromise = Promise.race([
      (async () => {
        try {
          // Lazy import createNestApp to avoid hanging during module load
          console.log('[Handler] Step 1: Importing createNestApp...');
          const importStartTime = Date.now();
          const { createNestApp } = await import('../src/main.js');
          console.log(`[Handler] Step 1 complete: createNestApp imported in ${Date.now() - importStartTime}ms`);
          
          console.log('[Handler] Step 2: Calling createNestApp()...');
          const createStartTime = Date.now();
          const app = await createNestApp();
          console.log(`[Handler] Step 2 complete: NestJS app created in ${Date.now() - createStartTime}ms`);
          
          console.log('[Handler] Step 3: Getting Express instance...');
          const expressApp = app.getHttpAdapter().getInstance();
          console.log('[Handler] Step 3 complete: Express instance obtained');
          
          console.log('[Handler] Step 4: Creating serverless handler...');
          cachedHandler = serverless(expressApp);
          console.log(`[Handler] Step 4 complete: Serverless handler created. Total init time: ${Date.now() - initStartTime}ms`);
          
          isInitializing = false;
          initializationPromise = null;
          return cachedHandler;
        } catch (stepError) {
          console.error('[Handler] Error during initialization steps:', stepError);
          throw stepError;
        }
      })(),
      // Timeout after 15 seconds (Vercel free tier has 10s timeout)
      new Promise((_, reject) => 
        setTimeout(() => {
          const duration = Date.now() - initStartTime;
          reject(new Error(`Initialization timeout after ${duration}ms. Check database connection and environment variables.`));
        }, 15000) // Reduced to 15 seconds
      ),
    ]).catch((error) => {
      isInitializing = false;
      initError = error;
      initializationPromise = null;
      console.error('[Handler] Initialization error caught:', error);
      console.error('[Handler] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[Handler] Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    });

    try {
      console.log('[Handler] Waiting for initialization promise...');
      await initializationPromise;
      console.log('[Handler] Initialization promise resolved successfully');
    } catch (error) {
      console.error('[Handler] Initialization promise rejected:', error);
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
  
  console.log('[Handler] About to call cachedHandler');
  console.log('[Handler] Final req.url:', req.url);
  console.log('[Handler] Final req.path:', req.path);
  console.log('[Handler] Final req.originalUrl:', req.originalUrl);
  
  try {
    // serverless-http handles the response asynchronously
    // It modifies res directly, so we need to await it
    const result = await cachedHandler(req, res);
    console.log('[Handler] Handler execution completed, result:', result);
    
    // Check if response was already sent
    if (res.headersSent) {
      console.log('[Handler] Response already sent by NestJS');
      return;
    }
    
    // If result is defined, return it (though serverless-http usually modifies res directly)
    return result;
  } catch (handlerError) {
    console.error('[Handler] Error in cachedHandler:', handlerError);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: handlerError instanceof Error ? handlerError.message : 'Unknown error',
      });
    }
  }
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

