import { prisma } from '~/server/db/client';

export const listOrdersForTableDisplay = (userId: string) =>
  prisma.order.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      created_at: true,
      paymentDetail: {
        select: {
          paymentMethod: true,
        },
      },
      totalPrice: true,
      currency_code: true,
      paidAt: true,
      shippedAt: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
