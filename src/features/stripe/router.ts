import { TRPCError } from '@trpc/server';

import { env } from '~/env/server.mjs';
import { protectedProcedure, router } from '~/server/trpc/trpc';

import { createStripeSessionRouteInputSchema } from './schemas';
import {
  createStripeSession,
  getUninitializedStripeOrder,
  updateCreatedStripeOrder,
} from './services';

export const stripeRouter = router({
  createSession: protectedProcedure
    .input(createStripeSessionRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      const order = await getUninitializedStripeOrder(input.orderId, user.id);

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      const baseUrl = ctx.req?.headers.origin || env.NEXTAUTH_URL;
      const session = await createStripeSession(
        order.id,
        baseUrl,
        order.user.email || '',
        order.totalPrice,
        order.currency_code,
      );

      await updateCreatedStripeOrder(input.orderId, user.id, session.id);

      return session.url;
    }),
});
