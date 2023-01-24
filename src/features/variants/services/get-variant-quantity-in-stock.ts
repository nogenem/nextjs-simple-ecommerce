import { prisma } from '~/server/db/client';

export const getVariantQuantityInStock = async (variantId: string) => {
  const variant = await prisma.variant.findFirst({
    where: {
      id: variantId,
    },
    select: {
      quantity_in_stock: true,
    },
  });

  if (!variant) return null;

  return variant.quantity_in_stock;
};
