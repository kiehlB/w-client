export const isDevelopment = process.env.NODE_ENV === 'development';

export const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';
export const heimdallUrl = isDevelopment
  ? process.env.NEXT_PUBLIC_HEIMDALL_URL || 'http://127.0.0.1:3000'
  : authUrl;

export const isProduction = process.env.NODE_ENV === 'production';

export const isTesting =
  process.env.NODE_ENV === 'test' || (!isDevelopment && !isProduction);
export const isGBDevMode = process.env.NEXT_PUBLIC_GB_DEV_MODE === 'true';
