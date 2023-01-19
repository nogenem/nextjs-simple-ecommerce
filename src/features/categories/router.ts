import { publicProcedure, router } from '~/server/trpc/trpc';

import { getAllCategories } from './service/get-all-categories';

export const categoriesRouter = router({
  all: publicProcedure.query(() => getAllCategories()),
});
