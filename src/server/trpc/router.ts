import { productsRouter } from '~/features/products/router';
import { router } from '~/server/trpc/trpc';

export const appRouter = router({
  products: productsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;