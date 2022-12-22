export const TEMP_CART_COOKIE_KEY = 'ecommerce-cart';
export const TEMP_CART_COOKIE_DATA = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
