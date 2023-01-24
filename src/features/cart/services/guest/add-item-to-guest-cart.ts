import type { CartItem } from '@prisma/client';
import nookies from 'nookies';

import type { Context } from '~/server/trpc/context';
import {
  GUEST_CART_COOKIE_KEY,
  GUEST_CART_COOKIE_OPTIONS,
} from '~/shared/constants/cookies';

import { getGuestCart } from './get-guest-cart';

export const addItemToGuestCart = (
  ctx: Context,
  variantId: string,
  quantity: number,
) => {
  const NOW = new Date();
  let BASE_ID = NOW.getTime();

  let cart = getGuestCart(ctx);
  if (!cart.id) {
    cart = {
      id: `${BASE_ID++}`,
      userId: '',
      created_at: NOW,
      updated_at: NOW,
      items: [] as CartItem[],
    };
  } else {
    cart.updated_at = NOW;
  }

  let cartItem = cart.items.filter((item) => item.variantId === variantId)[0];
  if (cartItem) {
    cartItem.quantity += quantity;
    cartItem.updated_at = NOW;
  } else {
    cartItem = {
      id: `${BASE_ID++}`,
      quantity,
      variantId,
      cartId: cart.id,
      created_at: NOW,
      updated_at: NOW,
    };
    cart.items.push(cartItem);
  }

  nookies.set(
    ctx,
    GUEST_CART_COOKIE_KEY,
    JSON.stringify(cart),
    GUEST_CART_COOKIE_OPTIONS,
  );

  return cartItem;
};
