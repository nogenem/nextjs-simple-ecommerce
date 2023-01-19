import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

export const getUninitializedStripeOrder = (orderId: string, userId: string) =>
  prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
      paidAt: null,
      paymentDetail: {
        paymentMethod: PaymentMethod.STRIPE,
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
