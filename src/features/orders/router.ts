import { TRPCError } from '@trpc/server';

import { protectedProcedure, router } from '~/server/trpc/trpc';
import { calculateShippingCost } from '~/shared/utils/calculate-shipping-cost';

import { getUserCartItems } from '../cart/services/user';
import { calculateCartSubtotal } from '../cart/utils/calculate-cart-subtotal';
import { hasAnyInvalidItem } from '../cart/utils/has-any-invalid-item';
import {
  orderByIdRouteInputSchema,
  placeOrderRouteInputSchema,
  updateOrderPaymentMethodRouteInputSchema,
  updateOrderShippingAddressRouteInputSchema,
} from './schemas';
import {
  getOrderById,
  listOrdersForTableDisplay,
  placeOrder,
  updateOrderPaymentMethod,
  updateOrderShippingAddress,
} from './services';
import { canEditOrderShippingAddressOrPaymentMethod } from './utils/can-edit-order-shipping-address-or-payment-method';

export const ordersRouter = router({
  placeOrder: protectedProcedure
    .input(placeOrderRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const items = await getUserCartItems(user.id);

      if (items.length === 0 || hasAnyInvalidItem(items)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your cart is empty or has invalid items.',
        });
      }

      const itemsSubtotal = calculateCartSubtotal(items);
      const shippingCost = calculateShippingCost(
        input.shippingAddress,
        itemsSubtotal,
      );
      const totalPrice = itemsSubtotal + shippingCost;

      const [order] = await placeOrder({
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        itemsSubtotal,
        shippingCost,
        totalPrice,
        userId: user.id,
        items,
      });

      return order;
    }),
  byId: protectedProcedure
    .input(orderByIdRouteInputSchema)
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      return getOrderById(input.orderId, user.id);
    }),
  updateShippingAddress: protectedProcedure
    .input(updateOrderShippingAddressRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const order = await getOrderById(input.orderId, user.id);

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      if (!canEditOrderShippingAddressOrPaymentMethod(order)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Order shipping address can't be edited.",
        });
      }

      const newShippingCost = calculateShippingCost(
        input.shippingAddress,
        order.itemsSubtotal,
      );
      const newTotalPrice = order.itemsSubtotal + newShippingCost;

      return updateOrderShippingAddress(
        input.orderId,
        user.id,
        input.shippingAddress,
        newShippingCost,
        newTotalPrice,
      );
    }),
  updatePaymentMethod: protectedProcedure
    .input(updateOrderPaymentMethodRouteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const order = await getOrderById(input.orderId, user.id);

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      if (!canEditOrderShippingAddressOrPaymentMethod(order)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Order payment method can't be edited.",
        });
      }

      return updateOrderPaymentMethod(
        input.orderId,
        user.id,
        input.paymentMethod,
      );
    }),
  listForTable: protectedProcedure.query(({ ctx }) => {
    const user = ctx.session.user;
    return listOrdersForTableDisplay(user.id);
  }),
});
