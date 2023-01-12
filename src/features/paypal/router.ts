import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, router } from '~/server/trpc/trpc';

import {
  capturePaypalPayment,
  createPaypalOrder,
  PAYPAL_STATUS,
} from './utils/api';

export const paypalRouter = router({
  createOrder: protectedProcedure
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
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      const paypalOrder = await createPaypalOrder(
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
              paymentMethodId: paypalOrder.id,
              paymentMethodStatus: paypalOrder.status,
            },
          },
        },
      });

      return paypalOrder.id;
    }),
  cancelOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        paypalOrderId: z.string().min(1),
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
            paymentMethodId: input.paypalOrderId,
            paymentMethodStatus: {
              not: PAYPAL_STATUS.COMPLETED,
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

      return await ctx.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentDetail: {
            update: {
              paymentMethodId: null,
              paymentMethodStatus: null,
            },
          },
        },
      });
    }),
  fulfillOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        paypalOrderId: z.string().min(1),
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
            paymentMethodId: input.paypalOrderId,
            paymentMethodStatus: {
              not: PAYPAL_STATUS.COMPLETED,
            },
          },
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found.',
        });
      }

      let paypalOrder = null;
      let apiError = null;
      try {
        paypalOrder = await capturePaypalPayment(input.paypalOrderId);
      } catch (err) {
        apiError = err;
      }

      if (!paypalOrder || apiError) {
        await ctx.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentDetail: {
              update: {
                paymentMethodId: null,
                paymentMethodStatus: null,
              },
            },
          },
        });

        throw apiError;
      }

      const [updatedOrder] = await ctx.prisma.$transaction([
        ctx.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paidAt: new Date(),
            paymentDetail: {
              update: {
                paymentMethodStatus: paypalOrder.status,
              },
            },
          },
        }),
        ...order.items.map((item) =>
          ctx.prisma.variant.update({
            where: {
              id: item.variantId,
            },
            data: {
              quantity_in_stock: {
                decrement: item.quantity,
              },
              sold_amount: {
                increment: item.quantity,
              },
            },
          }),
        ),
      ]);

      return updatedOrder;
    }),
});
