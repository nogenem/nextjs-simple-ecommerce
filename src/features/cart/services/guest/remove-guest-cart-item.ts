import nookies from 'nookies';

import type { Context } from '~/server/trpc/context';
import {
  GUEST_CART_COOKIE_KEY,
  GUEST_CART_COOKIE_OPTIONS,
} from '~/shared/constants/cookies';

import { getGuestCart } from './get-guest-cart';

export const removeGuestCartItem = async (ctx: Context, itemId: string) => {
  const cart = getGuestCart(ctx);

  const cartItem = cart.items.find((item) => item.id === itemId);

  if (!cartItem) return null;

  cart.items = cart.items.filter((item) => item.id !== itemId);
  nookies.set(
    ctx,
    GUEST_CART_COOKIE_KEY,
    JSON.stringify(cart),
    GUEST_CART_COOKIE_OPTIONS,
  );

  return cartItem;
};
