import { env } from '~/env/server.mjs';

export const BASE_API_URL =
  env.NODE_ENV === 'production'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';
