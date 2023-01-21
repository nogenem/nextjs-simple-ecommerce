import { BASE_API_URL } from '../constants/paypal-api';
import { handleResponse } from '../utils/handle-response';
import { generatePaypalApiAccessToken } from './generate-paypal-api-access-token';

// SOURCE: https://github.com/paypal-examples/docs-examples/tree/main/advanced-integration
export async function generatePaypalApiClientToken() {
  const accessToken = await generatePaypalApiAccessToken();
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
