import { CurrencyCode, PaymentMethod } from '@prisma/client';
import Stripe from 'stripe';

import { env } from '~/env/server.mjs';
import { transformPriceToPaymentFormat } from '~/shared/utils/transform-price-to-payment-format';

const APP_SECRET = env.STRIPE_SECRET;

const stripe = new Stripe(APP_SECRET, {
  apiVersion: '2022-11-15',
});

export type TStripeMetadata = {
  orderId: string;
};

export const createSession = (
  orderId: string,
  baseUrl: string,
  userEmail: string,
  totalPrice: number,
  currencyCode = CurrencyCode.USD,
) => {
  const value = transformPriceToPaymentFormat(
    totalPrice,
    PaymentMethod.STRIPE,
  ) as number;
  return stripe.checkout.sessions.create({
    success_url: `${baseUrl}/api/stripe/checkout_success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/api/stripe/checkout_cancel?session_id={CHECKOUT_SESSION_ID}`,
    currency: currencyCode,
    line_items: [
      {
        price_data: {
          product_data: {
            name: 'Checkout',
          },
          currency: currencyCode,
          unit_amount: value,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
    },
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
  });
};

export const getSessionById = (sessionId: string) => {
  return stripe.checkout.sessions.retrieve(sessionId);
};
