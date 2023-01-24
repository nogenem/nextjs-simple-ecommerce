import type { CartItem, Prisma } from '@prisma/client';

import { prisma } from '~/server/db/client';
import type { TNookiesContext } from '~/shared/types/globals';

import { getGuestCart } from './get-guest-cart';

export const saveOrMergeGuestCartIntoUserCart = async (
  ctx: TNookiesContext,
  userId: string,
) => {
  const guestCart = getGuestCart(ctx);

  if (!guestCart.id) return false;

  const userCart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!userCart) {
    await prisma.cart.create({
      data: {
        userId,
        items: {
          create: guestCart.items.map((item) => ({
            quantity: item.quantity,
            variantId: item.variantId,
          })),
        },
      },
    });
    return true;
  }

  const userCartItemsToUpdate: CartItem[] = [];
  const variantIdToCartItemObj: Record<string, CartItem> = {};

  userCart.items.forEach((item) => {
    userCartItemsToUpdate.push(item);
    variantIdToCartItemObj[item.variantId] = item;
  });

  const guestCartItemsToSave: Prisma.CartItemUncheckedCreateInput[] = [];
  guestCart.items.forEach((item) => {
    const userItem = variantIdToCartItemObj[item.variantId];
    if (userItem) {
      if (userItem.quantity !== item.quantity) {
        userItem.quantity = item.quantity;
      }
      delete variantIdToCartItemObj[item.variantId];
    } else {
      guestCartItemsToSave.push({
        quantity: item.quantity,
        variantId: item.variantId,
        cartId: userCart.id,
      });
    }
  });

  // Delete all that weren't found in the guest cart
  const userCartItemsToDelete = Object.values(variantIdToCartItemObj);

  await prisma.$transaction([
    ...userCartItemsToUpdate.map((item) =>
      prisma.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      }),
    ),
    ...guestCartItemsToSave.map((item) =>
      prisma.cartItem.create({
        data: {
          quantity: item.quantity,
          variantId: item.variantId,
          cartId: userCart.id,
        },
      }),
    ),
    prisma.cartItem.deleteMany({
      where: {
        id: {
          in: userCartItemsToDelete.map((item) => item.id),
        },
      },
    }),
  ]);

  return true;
};
