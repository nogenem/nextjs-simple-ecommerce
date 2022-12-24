import type { CartItem } from '@prisma/client';
import nookies from 'nookies';
import { z } from 'zod';

import type { Context } from '~/server/trpc/context';
import { publicProcedure, router } from '~/server/trpc/trpc';
import {
  TEMP_CART_COOKIE_DATA,
  TEMP_CART_COOKIE_KEY,
} from '~/shared/constants/cookies';
import type {
  CartWithItems,
  TCartItemWithVariant,
} from '~/shared/types/globals';
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
  sumItemsQuantities: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;
    if (user) {
      // logged in user
      const sum = await ctx.prisma.cartItem.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          cart: {
            userId: user.id,
          },
        },
      });
      return sum._sum.quantity;
    } else {
      // guest user
      const cart = getTempCart(ctx);

      if (!cart.id) {
        return 0;
      }

      return cart.items.reduce((prev, curr) => prev + curr.quantity, 0);
    }
  }),
  countItemsByProductId: publicProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        // logged in user
        const count = await ctx.prisma.cartItem.aggregate({
          _count: {
            id: true,
          },
          where: {
            variant: {
              productId: input.productId,
            },
          },
        });

        return count._count.id;
      } else {
        // guest user
        const cart = getTempCart(ctx);

        if (!cart.id) return 0;

        const variantsIds = cart.items.map((item) => item.variantId);

        const count = await ctx.prisma.cartItem.aggregate({
          _count: {
            id: true,
          },
          where: {
            variant: {
              id: {
                in: variantsIds,
              },
              productId: input.productId,
            },
          },
        });

        return count._count.id;
      }
    }),
  items: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;
    if (user) {
      // logged in user
      return await getLoggedInUserCartItems(user.id, ctx);
    } else {
      // guest user
      return await getGuestUserCartItems(ctx);
    }
  }),
});

const getTempCart = (ctx: Context) => {
  const cookies = nookies.get(ctx);

  return JSON.parse(cookies[TEMP_CART_COOKIE_KEY] || '{}') as CartWithItems;
};

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

  let cart = getTempCart(ctx);
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

const getLoggedInUserCartItems = async (userId: string, ctx: Context) => {
  const items = await ctx.prisma.cartItem.findMany({
    where: {
      cart: {
        userId,
      },
    },
    include: {
      variant: {
        include: {
          attributes: true,
          images: true,
          product: {
            include: {
              discount: true,
            },
          },
        },
      },
    },
  });

  const NOW = new Date();
  return items.map((item) => {
    if (
      item.variant?.product.discount &&
      item.variant.product.discount.valid_until <= NOW
    ) {
      item.variant.product.discount = null;
    }
    return item;
  });
};

const getGuestUserCartItems = async (ctx: Context) => {
  const tmpCart = getTempCart(ctx);

  if (!tmpCart.id) return [] as TCartItemWithVariant[];

  const variantIds = tmpCart.items.map((item) => item.variantId);

  const variants = await ctx.prisma.variant.findMany({
    where: {
      id: {
        in: variantIds,
      },
    },
    include: {
      attributes: true,
      images: true,
      product: {
        include: {
          discount: true,
        },
      },
    },
  });

  const variantIdToVariantObj = variants.reduce((prev, curr) => {
    if (!prev[curr.id]) {
      prev[curr.id] = curr;
    }
    return prev;
  }, {} as Record<string, typeof variants[number]>);

  const items = tmpCart.items.map((item) => {
    const newItem: TCartItemWithVariant = {
      ...item,
      variant: variantIdToVariantObj[item.variantId],
    };
    return newItem;
  });

  const NOW = new Date();
  return items.map((item) => {
    if (
      item.variant?.product.discount &&
      item.variant.product.discount.valid_until <= NOW
    ) {
      item.variant.product.discount = null;
    }
    return item;
  });
};
