import { PaymentMethod } from '@prisma/client';

export const transformPriceToPaymentFormat = (
  price: number,
  paymentMethod: PaymentMethod,
) => {
  if (paymentMethod === PaymentMethod.PAYPAL) {
    return `${price / 100}`;
  } else if (paymentMethod === PaymentMethod.STRIPE) {
    return price;
  }
  return price;
};
