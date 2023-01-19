import type { Order, OrderItem } from '@prisma/client';
import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { STRIPE_CHECKOUT_STATUS } from '../constants/status';

export const updatePaidStripeOrder = (
  order: Order & { items: OrderItem[] },
  userId: string,
  sessionId: string,
) =>
  prisma.$transaction([
    prisma.order.update({
      where: {
        id: order.id,
        userId,
        paidAt: null,
        paymentDetail: {
          paymentMethod: PaymentMethod.STRIPE,
          paymentMethodId: sessionId,
          paymentMethodStatus: {
            not: STRIPE_CHECKOUT_STATUS.COMPLETED,
          },
        },
      },
      data: {
        paidAt: new Date(),
        paymentDetail: {
          update: {
            paymentMethodStatus: STRIPE_CHECKOUT_STATUS.COMPLETED,
          },
        },
      },
    }),
    ...order.items.map((item) =>
      prisma.variant.update({
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
