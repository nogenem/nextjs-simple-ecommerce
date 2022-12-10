import { attributesRouter } from '~/features/attributes/router';
import { categoriesRouter } from '~/features/categories/router';
import { productsRouter } from '~/features/products/router';
import { router } from '~/server/trpc/trpc';

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
  attributes: attributesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
