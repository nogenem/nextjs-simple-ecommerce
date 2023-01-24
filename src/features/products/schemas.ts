import { z } from 'zod';

export const productsBySlugRouteInputSchema = z.object({
  slug: z.string(),
});

export type TProductsBySlugRouteInputSchema = z.infer<
  typeof productsBySlugRouteInputSchema
>;
