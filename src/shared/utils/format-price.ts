import { CurrencyCode } from '@prisma/client';

import { calculatePrice } from './calculate-price';

export function formatPrice(
  price: number,
  currencyCode: CurrencyCode = CurrencyCode.USD,
  discount = 0,
) {
  const value = calculatePrice(price, discount) / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
