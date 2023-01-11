export const STRIPE_CHECKOUT_STATUS = {
  CREATED: 'CREATED',
  COMPLETED: 'COMPLETED',
} as const;

export type TStripeCheckoutStatus = keyof typeof STRIPE_CHECKOUT_STATUS;
