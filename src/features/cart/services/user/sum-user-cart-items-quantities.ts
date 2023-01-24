import { prisma } from '~/server/db/client';

export const sumUserCartItemsQuantities = async (userId: string) => {
  const sum = await prisma.cartItem.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      cart: {
        userId,
      },
    },
  });

  return sum._sum.quantity;
};
