import { prisma } from '~/server/db/client';
import type { TAddressSchema } from '~/shared/schemas';

export const updateOrderShippingAddress = (
  orderId: string,
  userId: string,
  shippingAddress: TAddressSchema,
  shippingCost: number,
  totalPrice: number,
) =>
  prisma.order.update({
    where: {
      id: orderId,
      userId,
    },
    data: {
      shippingCost,
      totalPrice,
      shippingAddress: {
        update: {
          ...shippingAddress,
        },
      },
    },
  });
