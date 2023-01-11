import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { env } from '~/env/server.mjs';
import { protectedProcedure, router } from '~/server/trpc/trpc';

import { STRIPE_CHECKOUT_STATUS } from './constants';
import { createSession } from './utils/api';

export const stripeRouter = router({
  createSession: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const order = await ctx.prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: user.id,
          paidAt: null,
          paymentDetail: {
            paymentMethodId: null,
            paymentMethodStatus: null,
          },
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      const baseUrl = ctx.req.headers.origin || env.NEXTAUTH_URL;
      const session = await createSession(
        order.id,
        baseUrl,
        order.user.email || '',
        order.totalPrice,
        order.currency_code,
      );

      await ctx.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentDetail: {
            update: {
              paymentMethodId: session.id,
              paymentMethodStatus: STRIPE_CHECKOUT_STATUS.CREATED,
            },
          },
        },
      });

      return session.url;
    }),
});
