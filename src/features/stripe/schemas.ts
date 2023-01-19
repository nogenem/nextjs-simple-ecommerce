import { z } from 'zod';

export const createStripeSessionRouteInputSchema = z.object({
  orderId: z.string().min(1),
});

export type TCreateStripeSessionRouteInputSchema = z.infer<
  typeof createStripeSessionRouteInputSchema
>;
