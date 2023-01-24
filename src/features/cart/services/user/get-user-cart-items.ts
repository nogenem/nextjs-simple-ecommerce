import { prisma } from '~/server/db/client';

export const getUserCartItems = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
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
