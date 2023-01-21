import { TRPCError } from '@trpc/server';

import { protectedProcedure, router } from '~/server/trpc/trpc';

import {
  cancelPaypalOrderRouteInputSchema,
  createPaypalOrderRouteInputSchema,
  fulfillPaypalOrderRouteInputSchema,
} from './schemas';
import {
  capturePaypalApiPayment,
  createPaypalApiOrder,
  getUninitializedPaypalOrder,
  getUnpaidPaypalOrder,
  unpaidPaypalOrderExists,
  updateCanceledPaypalOrder,
  updateCreatedPaypalOrder,
  updatePaidPaypalOrder,
} from './services';

export const paypalRouter = router({
  createOrder: protectedProcedure
    .input(createPaypalOrderRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const order = await getUninitializedPaypalOrder(input.orderId, user.id);

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      const paypalApiOrder = await createPaypalApiOrder(
        order.totalPrice,
        order.currency_code,
      );

      await updateCreatedPaypalOrder(input.orderId, user.id, paypalApiOrder);

      return paypalApiOrder.id;
    }),
  cancelOrder: protectedProcedure
    .input(cancelPaypalOrderRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const orderExists = await unpaidPaypalOrderExists(
        input.orderId,
        user.id,
        input.paypalApiOrderId,
      );

      if (!orderExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      return updateCanceledPaypalOrder(
        input.orderId,
        user.id,
        input.paypalApiOrderId,
      );
    }),
  fulfillOrder: protectedProcedure
    .input(fulfillPaypalOrderRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const order = await getUnpaidPaypalOrder(
        input.orderId,
        user.id,
        input.paypalApiOrderId,
      );

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      let paypalApiOrder = null;
      let paypalApiError = null;
      try {
        paypalApiOrder = await capturePaypalApiPayment(input.paypalApiOrderId);
      } catch (err) {
        paypalApiError = err;
      }

      if (!paypalApiOrder || !!paypalApiError) {
        await updateCanceledPaypalOrder(
          input.orderId,
          user.id,
          input.paypalApiOrderId,
        );

        console.error(paypalApiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Paypal API returned an error.',
        });
      }

      const [updatedOrder] = await updatePaidPaypalOrder(
        order,
        user.id,
        input.paypalApiOrderId,
      );

      return updatedOrder;
    }),
});
