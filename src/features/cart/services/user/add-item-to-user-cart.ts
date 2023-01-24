import { prisma } from '~/server/db/client';

export const addItemToUserCart = async (
  userId: string,
  variantId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.upsert({
    where: {
      userId,
    },
    create: {
      userId,
    },
    update: {},
  });

  const cartItem = await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    create: {
      variantId,
      quantity,
      cartId: cart.id,
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
  });

  return cartItem;
};
