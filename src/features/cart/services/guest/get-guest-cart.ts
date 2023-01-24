import nookies from 'nookies';

import { GUEST_CART_COOKIE_KEY } from '~/shared/constants/cookies';
import type { TCartWithItems, TNookiesContext } from '~/shared/types/globals';

export const getGuestCart = (ctx: TNookiesContext) => {
  const cookies = nookies.get(ctx);
  return JSON.parse(cookies[GUEST_CART_COOKIE_KEY] || '{}') as TCartWithItems;
};
