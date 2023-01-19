import { CurrencyCode, PaymentMethod } from '@prisma/client';

import { transformPriceToPaymentFormat } from '~/shared/utils/transform-price-to-payment-format';

import { stripe } from '../stripe';

export const createStripeSession = (
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
