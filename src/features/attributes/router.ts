import { AttributeType } from '@prisma/client';
import { z } from 'zod';

import { publicProcedure, router } from '~/server/trpc/trpc';

export const attributesRouter = router({
  all: publicProcedure
    .input(
      z
        .object({
          type: z.nativeEnum(AttributeType).optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.attribute.findMany({
        select: {
          id: true,
          type: true,
          name: true,
          value: true,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        where: {
          type: input?.type,
        },
      });
    }),
});
