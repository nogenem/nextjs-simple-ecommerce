import { CurrencyCode, PaymentMethod } from '@prisma/client';

import { transformPriceToPaymentFormat } from '~/shared/utils/transform-price-to-payment-format';

import { BASE_API_URL } from '../constants/paypal-api';
import type { TMinimalPaypalOrder } from '../types';
import { handleResponse } from '../utils/handle-response';
import { generatePaypalApiAccessToken } from './generate-paypal-api-access-token';

// SOURCE: https://github.com/paypal-examples/docs-examples/tree/main/advanced-integration
export async function createPaypalApiOrder(
  totalPrice: number,
  currencyCode = CurrencyCode.USD,
  prefer: 'minimal' | 'representation' = 'minimal',
) {
  const value = transformPriceToPaymentFormat(totalPrice, PaymentMethod.PAYPAL);

  const accessToken = await generatePaypalApiAccessToken();
  const url = `${BASE_API_URL}/v2/checkout/orders`;

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: `return=${prefer}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value,
          },
        },
      ],
    }),
  });

  return handleResponse<TMinimalPaypalOrder>(response);
}
