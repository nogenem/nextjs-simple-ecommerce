import { prisma } from '~/server/db/client';

export const removeUserCartItem = async (userId: string, itemId: string) => {
  const item = await prisma.cartItem.delete({
    where: {
      id: itemId,
      cart: {
        userId,
      },
    },
  });

  return item;
};
