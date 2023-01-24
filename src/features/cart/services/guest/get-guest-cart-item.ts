import type { Context } from '~/server/trpc/context';

import { getGuestCart } from './get-guest-cart';

export const getGuestCartItem = (ctx: Context, itemId: string) => {
  const cart = getGuestCart(ctx);

  return cart.items.find((item) => item.id === itemId);
};
