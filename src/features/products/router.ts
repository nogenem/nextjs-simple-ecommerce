import { publicProcedure, router } from '~/server/trpc/trpc';

export const productsRouter = router({
  home: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
            attributes: true,
          },
          where: {
            available_for_sale: true,
          },
        },
        category: true,
        discount: true,
      },
      where: {
        variants: {
          some: {
            available_for_sale: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    const now = new Date();
    return products.map((product) => {
      if (product.discount && product.discount.valid_until < now) {
        product.discount = null;
      }
      return product;
    });
  }),
});
