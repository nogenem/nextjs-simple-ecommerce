import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

import { addressSchema } from '~/shared/schemas';

export const placeOrderRouteInputSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export type TPlaceOrderRouteInputSchema = z.infer<
  typeof placeOrderRouteInputSchema
>;

export const orderByIdRouteInputSchema = z.object({
  orderId: z.string().min(1),
});

export type TOrderByIdRouteInputSchema = z.infer<
  typeof orderByIdRouteInputSchema
>;

export const updateOrderShippingAddressRouteInputSchema = z.object({
  shippingAddress: addressSchema,
  orderId: z.string().min(1),
});

export type TUpdateOrderShippingAddressRouteInputSchema = z.infer<
  typeof updateOrderShippingAddressRouteInputSchema
>;

export const updateOrderPaymentMethodRouteInputSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  orderId: z.string().min(1),
});

export type TUpdateOrderPaymentMethodRouteInputSchema = z.infer<
  typeof updateOrderPaymentMethodRouteInputSchema
>;
