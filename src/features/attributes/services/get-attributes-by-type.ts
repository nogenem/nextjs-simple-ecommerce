import type { AttributeType } from '@prisma/client';

import { prisma } from '~/server/db/client';

export const getAttributesByType = (type: AttributeType) =>
  prisma.attribute.findMany({
    select: {
      id: true,
      type: true,
      name: true,
      value: true,
    },
    where: {
      type,
    },
    orderBy: { name: 'asc' },
  });
