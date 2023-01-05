import { CurrencyCode, PaymentMethod } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import nookies from 'nookies';
import { z } from 'zod';

import { protectedProcedure, router } from '~/server/trpc/trpc';
import {
  TEMP_CART_COOKIE_DATA,
  TEMP_CART_COOKIE_KEY,
} from '~/shared/constants/cookies';
import { calculateShippingCost } from '~/shared/utils/calculate-shipping-cost';

import { calculateCartSubtotal } from '../cart/utils/calculate-cart-subtotal';
import { getLoggedInUserCartItems } from '../cart/utils/get-logged-in-user-cart-items';
import { hasAnyInvalidItem } from '../cart/utils/has-any-invalid-item';

export const ordersRouter = router({
  placeOrder: protectedProcedure
    .input(
      z.object({
        shippingAddress: z.object({
          country: z.string().min(1),
          postal_code: z.string().min(1),
          state: z.string().min(1),
          city: z.string().min(1),
          street_address: z.string().min(1),
          complement: z.string().min(0),
        }),
        paymentMethod: z.nativeEnum(PaymentMethod),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const items = await getLoggedInUserCartItems(user.id, ctx);

      if (hasAnyInvalidItem(items) || items.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your cart is empty or has invalid items.',
        });
      }

      const itemsSubtotal = calculateCartSubtotal(items);
      const shippingCost = calculateShippingCost(
        input.shippingAddress,
        itemsSubtotal,
      );
      const totalPrice = itemsSubtotal + shippingCost;

      const [order] = await ctx.prisma.$transaction([
        ctx.prisma.order.create({
          data: {
            shippingCost,
            itemsSubtotal,
            totalPrice,
            currency_code: CurrencyCode.USD,
            user: {
              connect: {
                id: user.id,
              },
            },
            paymentDetail: {
              create: {
                paymentMethod: input.paymentMethod,
              },
            },
            shippingAddress: {
              create: {
                ...input.shippingAddress,
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
        ctx.prisma.cart.delete({
          where: {
            userId: user.id,
          },
        }),
      ]);

      nookies.destroy(ctx, TEMP_CART_COOKIE_KEY, TEMP_CART_COOKIE_DATA);

      return order;
    }),
});
