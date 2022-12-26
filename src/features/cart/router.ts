import type { CartItem } from '@prisma/client';
import { TRPCError } from '@trpc/server';
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
  removeItem: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        // logged in user
        return await ctx.prisma.cartItem.delete({
          where: {
            id: input.itemId,
          },
        });
      } else {
        // guest user
        const cart = getTempCart(ctx);

        const cartItem = cart.items.find((item) => item.id === input.itemId);

        if (!cartItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        cart.items = cart.items.filter((item) => item.id !== input.itemId);
        nookies.set(
          ctx,
          TEMP_CART_COOKIE_KEY,
          JSON.stringify(cart),
          TEMP_CART_COOKIE_DATA,
        );

        return cartItem;
      }
    }),
  updateItemQuantity: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        newQuantity: z.number().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        // logged in user
        const item = await ctx.prisma.cartItem.findFirst({
          where: {
            id: input.itemId,
          },
          select: {
            id: true,
            variant: {
              select: {
                quantity_in_stock: true,
              },
            },
          },
        });

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        if (item.variant.quantity_in_stock < input.newQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough products in stock.',
          });
        }

        return await ctx.prisma.cartItem.update({
          where: {
            id: input.itemId,
          },
          data: {
            quantity: input.newQuantity,
          },
        });
      } else {
        // guest user
        const cart = getTempCart(ctx);

        const cartItem = cart.items.find((item) => item.id === input.itemId);

        if (!cartItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        const variant = await ctx.prisma.variant.findFirst({
          where: {
            id: cartItem.variantId,
          },
          select: {
            quantity_in_stock: true,
          },
        });

        if (!variant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product variant not found.',
          });
        }

        if (variant.quantity_in_stock < input.newQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough products in stock.',
          });
        }

        cartItem.quantity = input.newQuantity;
        nookies.set(
          ctx,
          TEMP_CART_COOKIE_KEY,
          JSON.stringify(cart),
          TEMP_CART_COOKIE_DATA,
        );

        return cartItem;
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
