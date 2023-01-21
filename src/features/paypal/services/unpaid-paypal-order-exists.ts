import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { PAYPAL_STATUS } from '../constants/status';

export const unpaidPaypalOrderExists = async (
  orderId: string,
  userId: string,
  paypalApiOrderId?: string,
) =>
  !!(await prisma.order.findFirst({
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
    select: {
      id: true,
    },
  }));
