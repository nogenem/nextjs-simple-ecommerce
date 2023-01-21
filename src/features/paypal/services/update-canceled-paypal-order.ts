import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { PAYPAL_STATUS } from '../constants/status';

export const updateCanceledPaypalOrder = (
  orderId: string,
  userId: string,
  paypalApiOrderId?: string,
) =>
  prisma.order.update({
    where: {
      id: orderId,
      userId,
      paidAt: null,
      paymentDetail: {
        paymentMethod: PaymentMethod.PAYPAL,
        paymentMethodId: !!paypalApiOrderId
          ? paypalApiOrderId
          : {
              not: null,
            },
        paymentMethodStatus: {
          not: PAYPAL_STATUS.COMPLETED,
        },
      },
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
