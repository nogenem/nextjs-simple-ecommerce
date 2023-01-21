import { z } from 'zod';

export const createPaypalOrderRouteInputSchema = z.object({
  orderId: z.string().min(1),
});

export type TCreatePaypalOrderRouteInputSchema = z.infer<
  typeof createPaypalOrderRouteInputSchema
>;

export const cancelPaypalOrderRouteInputSchema = z.object({
  orderId: z.string().min(1),
  paypalApiOrderId: z.string().min(1).optional(),
});

export type TCancelPaypalOrderRouteInputSchema = z.infer<
  typeof cancelPaypalOrderRouteInputSchema
>;

export const fulfillPaypalOrderRouteInputSchema = z.object({
  orderId: z.string().min(1),
  paypalApiOrderId: z.string().min(1),
});

export type TFulfillPaypalOrderRouteInputSchema = z.infer<
  typeof fulfillPaypalOrderRouteInputSchema
>;
