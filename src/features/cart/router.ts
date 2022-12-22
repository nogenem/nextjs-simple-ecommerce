import type { CartItem } from '@prisma/client';
import nookies from 'nookies';
import { z } from 'zod';

import type { Context } from '~/server/trpc/context';
import { publicProcedure, router } from '~/server/trpc/trpc';
import {
  TEMP_CART_COOKIE_DATA,
  TEMP_CART_COOKIE_KEY,
} from '~/shared/constants/cookies';
import type { CartWithItems } from '~/shared/types/globals';
import type { RouterInputs } from '~/shared/utils/trpc';

export const cartRouter = router({
  addItem: publicProcedure
    .input(
      z.object({
        variantId: z.string(),
        quantity: z.number().min(1),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<CartItem> => {
      const user = ctx.session?.user;
      if (user) {
        // logged in user
        return await addItemToLoggedInUserCart(user.id, input, ctx);
      } else {
        // guest user
        return addItemToGuestUserCart(input, ctx);
      }
    }),
});

const addItemToLoggedInUserCart = async (
  userId: string,
  input: RouterInputs['cart']['addItem'],
  ctx: Context,
) => {
  const cart = await ctx.prisma.cart.upsert({
    where: {
      userId,
    },
    create: {
      userId,
    },
    update: {},
  });

  const cartItem = await ctx.prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: input.variantId,
      },
    },
    create: {
      variantId: input.variantId,
      quantity: input.quantity,
      cartId: cart.id,
    },
    update: {
      quantity: {
        increment: input.quantity,
      },
    },
  });

  return cartItem;
};

const addItemToGuestUserCart = (
  input: RouterInputs['cart']['addItem'],
  ctx: Context,
) => {
  const NOW = new Date();
  let BASE_ID = NOW.getTime();

  const cookies = nookies.get(ctx);

  let cart = JSON.parse(cookies[TEMP_CART_COOKIE_KEY] || '{}') as CartWithItems;
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

  let cartItem = cart.items.filter(
    (item) => item.variantId === input.variantId,
  )[0];
  if (cartItem) {
    cartItem.quantity += input.quantity;
    cartItem.updated_at = NOW;
  } else {
    cartItem = {
      id: `${BASE_ID++}`,
      quantity: input.quantity,
      variantId: input.variantId,
      cartId: cart.id,
      created_at: NOW,
      updated_at: NOW,
    };
    cart.items.push(cartItem);
  }

  nookies.set(
    ctx,
    TEMP_CART_COOKIE_KEY,
    JSON.stringify(cart),
    TEMP_CART_COOKIE_DATA,
  );

  return cartItem;
};
