import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '~/env/server.mjs';
import {
  getStripeSessionById,
  unpaidStripeOrderExists,
  updateCanceledStripeOrder,
} from '~/features/stripe/services';
import type { TStripeMetadata } from '~/features/stripe/stripe';
import { getServerAuthSession } from '~/server/common/get-server-auth-session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = req.headers.origin || env.NEXTAUTH_URL;

  const authSession = await getServerAuthSession({ req, res });

  if (!authSession || !authSession.user || !authSession.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let { session_id: sessionId } = req.query;
  sessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  if (!sessionId) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  let session = null;
  try {
    session = await getStripeSessionById(sessionId);
  } catch (err) {
    console.error(
      'Error while retrieving stripe session',
      'checkout_cancel',
      { userId: authSession.user.id },
      err,
    );
    return res.redirect(
      `${baseUrl}?stripe_error={message:'Error while retrieving stripe session.'}`,
    );
  }

  if (!session) {
    console.error(
      'Stripe session is empty',
      'checkout_cancel',
      { userId: authSession.user.id },
      { session },
    );
    return res.redirect(
      `${baseUrl}?stripe_error={message:'Stripe session is empty.'}`,
    );
  }

  const { orderId } = session.metadata as TStripeMetadata;
  const orderExists = await unpaidStripeOrderExists(
    orderId,
    authSession.user.id,
    session.id,
  );

  if (!orderExists || session.payment_status === 'paid') {
    return res.redirect(`${baseUrl}/order/${orderId}`);
  }

  await updateCanceledStripeOrder(orderId, authSession.user.id, session.id);

  return res.redirect(`${baseUrl}/order/${orderId}`);
}
