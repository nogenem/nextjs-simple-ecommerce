import { CurrencyCode, PaymentMethod } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import nookies from 'nookies';
import { z } from 'zod';

import { protectedProcedure, router } from '~/server/trpc/trpc';
import {
  TEMP_CART_COOKIE_DATA,
  TEMP_CART_COOKIE_KEY,
} from '~/shared/constants/cookies';
import { calculateShippingCost } from '~/shared/utils/calculate-shipping-cost';

import { calculateCartSubtotal } from '../cart/utils/calculate-cart-subtotal';
import { getLoggedInUserCartItems } from '../cart/utils/get-logged-in-user-cart-items';
import { hasAnyInvalidItem } from '../cart/utils/has-any-invalid-item';
import { canEditOrderShippingAddressOrPaymentMethod } from './utils/can-edit-order-shipping-address-or-payment-method';

export const ordersRouter = router({
  placeOrder: protectedProcedure
    .input(
      z.object({
        shippingAddress: z.object({
          country: z.string().min(1),
          postal_code: z.string().min(1),
          state: z.string().min(1),
          city: z.string().min(1),
          street_address: z.string().min(1),
          complement: z.string().min(0),
        }),
        paymentMethod: z.nativeEnum(PaymentMethod),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const items = await getLoggedInUserCartItems(user.id, ctx);

      if (hasAnyInvalidItem(items) || items.length === 0) {
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

      const [order] = await ctx.prisma.$transaction([
        ctx.prisma.order.create({
          data: {
            shippingCost,
            itemsSubtotal,
            totalPrice,
            currency_code: CurrencyCode.USD,
            user: {
              connect: {
                id: user.id,
              },
            },
            paymentDetail: {
              create: {
                paymentMethod: input.paymentMethod,
              },
            },
            shippingAddress: {
              create: {
                ...input.shippingAddress,
              },
            },
            items: {
              createMany: {
                data: items.map((item) => ({
                  quantity: item.quantity,
                  variantId: item.variantId,
                })),
              },
            },
          },
        }),
        ctx.prisma.cart.delete({
          where: {
            userId: user.id,
          },
        }),
      ]);

      nookies.destroy(ctx, TEMP_CART_COOKIE_KEY, TEMP_CART_COOKIE_DATA);

      return order;
    }),
  byId: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findFirst({
        where: {
          id: input.orderId,
        },
        include: {
          paymentDetail: true,
          shippingAddress: true,
          items: {
            include: {
              variant: {
                include: {
                  attributes: true,
                  images: true,
                  product: {
                    include: {
                      discount: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
  updateShippingAddress: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        shippingAddress: z.object({
          country: z.string().min(1),
          postal_code: z.string().min(1),
          state: z.string().min(1),
          city: z.string().min(1),
          street_address: z.string().min(1),
          complement: z.string().min(0),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const order = await ctx.prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: user.id,
        },
        include: {
          paymentDetail: true,
        },
      });

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

      return ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          shippingCost: newShippingCost,
          totalPrice: newTotalPrice,
          shippingAddress: {
            update: {
              ...input.shippingAddress,
            },
          },
        },
      });
    }),
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        paymentMethod: z.nativeEnum(PaymentMethod),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const order = await ctx.prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: user.id,
        },
        include: {
          paymentDetail: true,
        },
      });

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

      return ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          paymentDetail: {
            update: {
              paymentMethod: input.paymentMethod,
            },
          },
        },
      });
    }),
  listForTable: protectedProcedure
    .input(
      z.object({
        loggedInUserOnly: z.boolean().default(false),
      }),
    )
    .query(({ ctx, input }) => {
      const user = ctx.session.user;

      return ctx.prisma.order.findMany({
        where: input.loggedInUserOnly
          ? {
              userId: user.id,
            }
          : undefined,
        select: {
          id: true,
          created_at: true,
          paymentDetail: {
            select: {
              paymentMethod: true,
            },
          },
          totalPrice: true,
          currency_code: true,
          paidAt: true,
          shippedAt: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    }),
});
