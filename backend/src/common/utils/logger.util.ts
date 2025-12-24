/**
 * Production-safe logger utility
 * Disables verbose console logging in production environment
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Production-safe console.log wrapper
 * Only logs in development, errors always logged
 */
export const safeLog = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    // Warnings in production only for critical issues
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    // Debug only in development
    if (!isProduction) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    // Info only in development
    if (!isProduction) {
      console.info(...args);
    }
  },
};


