import type { Context } from '~/server/trpc/context';

import { getGuestCart } from './get-guest-cart';

export const sumGuestCartItemsQuantities = (ctx: Context) => {
  const cart = getGuestCart(ctx);

  if (!cart.id) {
    return 0;
  }

  return cart.items.reduce((prev, curr) => prev + curr.quantity, 0);
};
