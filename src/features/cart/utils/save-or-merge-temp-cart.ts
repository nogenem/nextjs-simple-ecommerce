import type { CartItem, Prisma, PrismaClient } from '@prisma/client';

import type { CartWithItems } from '~/shared/types/globals';

export const saveOrMergeTempCart = async (
  tempCart: CartWithItems,
  userId: string,
  prisma: PrismaClient,
) => {
  if (!tempCart.id) return false;

  const dbCart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
    include: {
      items: true,
    },
  });

  if (!dbCart) {
    await prisma.cart.create({
      data: {
        userId,
        items: {
          create: tempCart.items.map((item) => ({
            quantity: item.quantity,
            variantId: item.variantId,
          })),
        },
      },
    });
    return true;
  }

  const dbCartItemsToUpdate: CartItem[] = [];
  const variantIdToCartItemObj: Record<string, CartItem> = {};

  dbCart.items.forEach((item) => {
    dbCartItemsToUpdate.push(item);
    variantIdToCartItemObj[item.variantId] = item;
  });

  const tempCartItemsToSave: Prisma.CartItemUncheckedCreateInput[] = [];
  tempCart.items.forEach((item) => {
    const dbItem = variantIdToCartItemObj[item.variantId];
    if (dbItem) {
      if (dbItem.quantity !== item.quantity) {
        dbItem.quantity = item.quantity;
      }
      delete variantIdToCartItemObj[item.variantId];
    } else {
      tempCartItemsToSave.push({
        quantity: item.quantity,
        variantId: item.variantId,
        cartId: dbCart.id,
      });
    }
  });

  // Delete all that weren't found in the temp cart
  const dbCartItemsToDelete = Object.values(variantIdToCartItemObj);

  const promises = [
    ...dbCartItemsToUpdate.map((item) =>
      prisma.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      }),
    ),
    ...tempCartItemsToSave.map((item) =>
      prisma.cartItem.create({
        data: {
          quantity: item.quantity,
          variantId: item.variantId,
          cartId: dbCart.id,
        },
      }),
    ),
    prisma.cartItem.deleteMany({
      where: {
        id: {
          in: dbCartItemsToDelete.map((item) => item.id),
        },
      },
    }),
  ];

  await Promise.all(promises);

  return true;
};
