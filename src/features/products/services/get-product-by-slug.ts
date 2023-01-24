import { prisma } from '~/server/db/client';

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    include: {
      variants: {
        include: {
          attributes: true,
          images: true,
        },
        where: {
          available_for_sale: true,
        },
      },
      category: true,
      discount: true,
    },
    where: {
      slug: slug,
    },
  });

  if (
    product &&
    product.discount &&
    product.discount.valid_until <= new Date()
  ) {
    product.discount = null;
  }

  return product;
};
