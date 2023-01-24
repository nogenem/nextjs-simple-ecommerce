import { prisma } from '~/server/db/client';

export const getUserCartItemQuantityInStock = async (
  userId: string,
  itemId: string,
) => {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: {
        userId,
      },
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

  if (!item) return null;

  return item.variant.quantity_in_stock;
};
