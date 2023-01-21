import type { Order, OrderItem } from '@prisma/client';
import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { PAYPAL_STATUS } from '../constants/status';

export const updatePaidPaypalOrder = (
  order: Order & { items: OrderItem[] },
  userId: string,
  paypalApiOrderId: string,
) =>
  prisma.$transaction([
    prisma.order.update({
      where: {
        id: order.id,
        userId,
        paidAt: null,
        paymentDetail: {
          paymentMethod: PaymentMethod.PAYPAL,
          paymentMethodId: paypalApiOrderId,
          paymentMethodStatus: {
            not: PAYPAL_STATUS.COMPLETED,
          },
        },
      },
      data: {
        paidAt: new Date(),
        paymentDetail: {
          update: {
            paymentMethodStatus: PAYPAL_STATUS.COMPLETED,
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
