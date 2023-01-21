import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import type { TMinimalPaypalOrder } from '../types';

export const updateCreatedPaypalOrder = (
  orderId: string,
  userId: string,
  paypalApiOrder: TMinimalPaypalOrder,
) =>
  prisma.order.update({
    where: {
      id: orderId,
      userId,
      paidAt: null,
      paymentDetail: {
        paymentMethod: PaymentMethod.PAYPAL,
        paymentMethodId: null,
        paymentMethodStatus: null,
      },
    },
    data: {
      paymentDetail: {
        update: {
          paymentMethodId: paypalApiOrder.id,
          paymentMethodStatus: paypalApiOrder.status,
        },
      },
    },
  });
