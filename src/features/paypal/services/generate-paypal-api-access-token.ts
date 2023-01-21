import { env } from '~/env/server.mjs';

import { BASE_API_URL } from '../constants/paypal-api';
import { handleResponse } from '../utils/handle-response';

// SOURCE: https://github.com/paypal-examples/docs-examples/tree/main/advanced-integration
export async function generatePaypalApiAccessToken() {
  const auth = Buffer.from(
    env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET,
  ).toString('base64');

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
