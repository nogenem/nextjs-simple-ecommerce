import { prisma } from '~/server/db/client';

import type { TAttributesByTypeRouteInputSchema } from '../schemas';

export const getAttributesByType = (input: TAttributesByTypeRouteInputSchema) =>
  prisma.attribute.findMany({
    select: {
      id: true,
      type: true,
      name: true,
      value: true,
    },
    where: {
      type: input.type,
    },
    orderBy: { name: 'asc' },
  });
