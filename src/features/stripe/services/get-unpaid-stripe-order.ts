import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { STRIPE_CHECKOUT_STATUS } from '../constants/status';

export const getPaidStripeOrder = (
  orderId: string,
  userId: string,
  sessionId: string,
) =>
  prisma.order.findFirst({
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
    include: {
      items: true,
    },
  });
