import { prisma } from '~/server/db/client';

export const getOrderById = (orderId: string, userId: string) =>
  prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      paymentDetail: true,
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              attributes: true,
              images: true,
              product: {
                include: {
                  discount: true,
                },
              },
            },
          },
        },
      },
    },
  });
