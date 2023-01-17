import { AttributeType } from '@prisma/client';
import { z } from 'zod';

export const attributesByTypeRouteInputSchema = z.object({
  type: z.nativeEnum(AttributeType),
});

export type TAttributesByTypeRouteInputSchema = z.infer<
  typeof attributesByTypeRouteInputSchema
>;
