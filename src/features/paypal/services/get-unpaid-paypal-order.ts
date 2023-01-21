import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { PAYPAL_STATUS } from '../constants/status';

export const getUnpaidPaypalOrder = (
  orderId: string,
  userId: string,
  paypalApiOrderId: string,
) =>
  prisma.order.findFirst({
    where: {
      id: orderId,
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
    include: {
      items: true,
    },
  });
