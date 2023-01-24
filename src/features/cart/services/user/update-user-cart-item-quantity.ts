import { prisma } from '~/server/db/client';

export const updateUserCartItemQuantity = (
  userId: string,
  itemId: string,
  quantity: number,
) =>
  prisma.cartItem.update({
    where: {
      id: itemId,
      cart: {
        userId,
      },
    },
    data: {
      quantity,
    },
  });
