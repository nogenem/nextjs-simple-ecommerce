import { stripe } from '../stripe';

export const getStripeSessionById = (sessionId: string) => {
  return stripe.checkout.sessions.retrieve(sessionId);
};
