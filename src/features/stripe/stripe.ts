import Stripe from 'stripe';

import { env } from '~/env/server.mjs';

export const stripe = new Stripe(env.STRIPE_SECRET, {
  apiVersion: '2022-11-15',
});

export type TStripeMetadata = {
  orderId: string;
};
