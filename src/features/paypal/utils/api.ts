import { CurrencyCode, PaymentMethod } from '@prisma/client';
import type { Response } from 'node-fetch';
import fetch from 'node-fetch';

import { env } from '~/env/server.mjs';
import { transformPriceToPaymentFormat } from '~/shared/utils/transform-price-to-payment-format';

import type { TPaypalStatus } from '../constants/status';

// SOURCE: https://github.com/paypal-examples/docs-examples/tree/main/advanced-integration
const CLIENT_ID = env.PAYPAL_CLIENT_ID;
const APP_SECRET = env.PAYPAL_SECRET;
const BASE_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

export type TMinimalPaypalOrder = {
  id: string;
  status: TPaypalStatus;
};

export async function createPaypalOrder(
  totalPrice: number,
  currencyCode = CurrencyCode.USD,
  prefer: 'minimal' | 'representation' = 'minimal',
) {
  const value = transformPriceToPaymentFormat(totalPrice, PaymentMethod.PAYPAL);

  const accessToken = await generatePaypalAccessToken();
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
      application_context: {
        payment_method: {
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
      },
    }),
  });

  return handleResponse<TMinimalPaypalOrder>(response);
}

export async function capturePaypalPayment(
  paypalOrderId: string,
  prefer: 'minimal' | 'representation' = 'minimal',
) {
  const accessToken = await generatePaypalAccessToken();
  const url = `${BASE_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`;
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

export async function generatePaypalClientToken() {
  const accessToken = await generatePaypalAccessToken();
  const response = await fetch(`${BASE_API_URL}/v1/identity/generate-token`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': 'en_US',
      'Content-Type': 'application/json',
    },
  });
  const jsonData = await handleResponse<Record<string, string>>(response);
  return jsonData.client_token;
}

async function generatePaypalAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString('base64');
  const response = await fetch(`${BASE_API_URL}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const jsonData = await handleResponse<Record<string, string>>(response);
  return jsonData.access_token;
}

async function handleResponse<TJsonResponse = unknown>(
  response: Response,
): Promise<TJsonResponse> {
  if (response.status === 200 || response.status === 201) {
    return response.json() as TJsonResponse;
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}
