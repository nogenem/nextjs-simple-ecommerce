import { publicProcedure, router } from '~/server/trpc/trpc';

import { attributesByTypeRouteInputSchema } from './schemas';
import { getAttributesByType } from './service/get-attributes-by-type';

export const attributesRouter = router({
  byType: publicProcedure
    .input(attributesByTypeRouteInputSchema)
    .query(async ({ input }) => getAttributesByType(input)),
});
