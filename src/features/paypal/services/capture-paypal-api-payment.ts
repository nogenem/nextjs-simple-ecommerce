import { BASE_API_URL } from '../constants/paypal-api';
import type { TMinimalPaypalOrder } from '../types';
import { handleResponse } from '../utils/handle-response';
import { generatePaypalApiAccessToken } from './generate-paypal-api-access-token';

// SOURCE: https://github.com/paypal-examples/docs-examples/tree/main/advanced-integration
export async function capturePaypalApiPayment(
  paypalApiOrderId: string,
  prefer: 'minimal' | 'representation' = 'minimal',
) {
  const url = `${BASE_API_URL}/v2/checkout/orders/${paypalApiOrderId}/capture`;

  const accessToken = await generatePaypalApiAccessToken();

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: `return=${prefer}`,
    },
  });

  return handleResponse<TMinimalPaypalOrder>(response);
}
