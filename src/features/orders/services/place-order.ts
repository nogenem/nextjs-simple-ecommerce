import type { PaymentMethod } from '@prisma/client';
import { CurrencyCode } from '@prisma/client';

import { prisma } from '~/server/db/client';
import type { TAddressSchema } from '~/shared/schemas';
import type { TCartItemWithVariant } from '~/shared/types/globals';

export const placeOrder = ({
  shippingAddress,
  paymentMethod,
  itemsSubtotal,
  shippingCost,
  totalPrice,
  userId,
  items,
}: {
  shippingAddress: TAddressSchema;
  paymentMethod: PaymentMethod;
  itemsSubtotal: number;
  shippingCost: number;
  totalPrice: number;
  userId: string;
  items: TCartItemWithVariant[];
}) =>
  prisma.$transaction([
    prisma.order.create({
      data: {
        itemsSubtotal,
        shippingCost,
        totalPrice,
        currency_code: CurrencyCode.USD,
        user: {
          connect: {
            id: userId,
          },
        },
        paymentDetail: {
          create: {
            paymentMethod,
          },
        },
        shippingAddress: {
          create: {
            ...shippingAddress,
          },
        },
        items: {
          createMany: {
            data: items.map((item) => ({
              quantity: item.quantity,
              variantId: item.variantId,
            })),
          },
        },
      },
    }),
    prisma.cart.delete({
      where: {
        userId: userId,
      },
    }),
  ]);
