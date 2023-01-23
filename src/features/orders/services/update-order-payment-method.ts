import type { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

export const updateOrderPaymentMethod = (
  orderId: string,
  userId: string,
  paymentMethod: PaymentMethod,
) =>
  prisma.order.update({
    where: {
      id: orderId,
      userId,
    },
    data: {
      paymentDetail: {
        update: {
          paymentMethod: paymentMethod,
        },
      },
    },
  });
