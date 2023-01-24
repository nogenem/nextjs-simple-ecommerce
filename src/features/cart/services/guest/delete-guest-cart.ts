import nookies from 'nookies';

import {
  GUEST_CART_COOKIE_KEY,
  GUEST_CART_COOKIE_OPTIONS,
} from '~/shared/constants/cookies';
import type { TNookiesContext } from '~/shared/types/globals';

export const deleteGuestCart = (ctx: TNookiesContext) => {
  nookies.destroy(ctx, GUEST_CART_COOKIE_KEY, GUEST_CART_COOKIE_OPTIONS);
  return true;
};
