/**
 * Development-only logging utility
 * In production builds, these are no-ops for better performance and security
 */

export const devLog = (...args: unknown[]): void => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const devWarn = (...args: unknown[]): void => {
  if (__DEV__) {
    console.warn(...args);
  }
};

// console.error should generally still log in production for debugging critical issues
// But wrap it for cases where we want dev-only error logging
export const devError = (...args: unknown[]): void => {
  if (__DEV__) {
    console.error(...args);
  }
};
