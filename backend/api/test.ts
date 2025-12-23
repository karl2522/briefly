// Simple test endpoint to verify Vercel functions work
export default async function handler(req: any, res: any) {
  console.log('=== TEST HANDLER CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  
  return res.status(200).json({
    success: true,
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
  });
}

