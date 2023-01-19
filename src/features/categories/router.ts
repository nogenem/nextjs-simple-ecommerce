import { publicProcedure, router } from '~/server/trpc/trpc';

import { getAllCategories } from './services';

export const categoriesRouter = router({
  all: publicProcedure.query(() => getAllCategories()),
});
