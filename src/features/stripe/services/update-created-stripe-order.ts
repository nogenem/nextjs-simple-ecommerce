import { PaymentMethod } from '@prisma/client';

import { prisma } from '~/server/db/client';

import { STRIPE_CHECKOUT_STATUS } from '../constants/status';

export const updateCreatedStripeOrder = (
  orderId: string,
  userId: string,
  sessionId: string,
) =>
  prisma.order.update({
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
    data: {
      paymentDetail: {
        update: {
          paymentMethodId: sessionId,
          paymentMethodStatus: STRIPE_CHECKOUT_STATUS.CREATED,
        },
      },
    },
  });
