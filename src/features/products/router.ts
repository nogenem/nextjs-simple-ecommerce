import { publicProcedure, router } from '~/server/trpc/trpc';

export const productsRouter = router({
  home: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
          },
        },
        category: true,
        discount: true,
      },
    });
  }),
});
