import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

export const getUninitializedPaypalOrder = (orderId: string, userId: string) =>
  prisma.order.findFirst({
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
  });
