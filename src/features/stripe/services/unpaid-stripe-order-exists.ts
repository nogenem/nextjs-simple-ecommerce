import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { STRIPE_CHECKOUT_STATUS } from '../constants/status';

export const unpaidStripeOrderExists = async (
  orderId: string,
  userId: string,
  sessionId: string,
) =>
  !!(await prisma.order.findFirst({
    where: {
      id: orderId,
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
    select: {
      id: true,
    },
  }));
