import { prisma } from '~/server/db/client';

export const countUserCartItemsByProductId = async (
  userId: string,
  productId: string,
) => {
  const count = await prisma.cartItem.aggregate({
    _count: {
      id: true,
    },
    where: {
      cart: {
        userId,
      },
      variant: {
        productId,
      },
    },
  });

  return count._count.id;
};
