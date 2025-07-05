import { Buffer } from 'buffer';
import fetch from 'node-fetch';

const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: price,
            },
          },
        ],
      }),
    });

    return await handleResponse(response);
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const res = await handleResponse(response);
    console.log(res);
    return res;
  },
};

// generate paypal access token
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    'base64'
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencded',
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

async function handleResponse(response: fetch.Response) {
  if (response.ok) {
    return response.json();
  } else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}
export { generateAccessToken };
