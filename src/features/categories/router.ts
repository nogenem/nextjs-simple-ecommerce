import { publicProcedure, router } from '~/server/trpc/trpc';

export const categoriesRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }),
});
