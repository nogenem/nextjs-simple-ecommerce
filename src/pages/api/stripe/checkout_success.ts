import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '~/env/server.mjs';
import { STRIPE_CHECKOUT_STATUS } from '~/features/stripe/constants/status';
import type { TStripeMetadata } from '~/features/stripe/utils/api';
import { getSessionById } from '~/features/stripe/utils/api';
import { getServerAuthSession } from '~/server/common/get-server-auth-session';
import { prisma } from '~/server/db/client';

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
    session = await getSessionById(sessionId);
  } catch (err) {
    console.error(
      'Error while retrieving stripe session',
      'checkout_success',
      { userId: authSession.user.id },
      err,
    );
    return res.redirect(
      `${baseUrl}/api/stripe/checkout_cancel?session_id=${sessionId}`,
    );
  }

  if (!session) {
    console.error(
      'Stripe session is empty',
      'checkout_success',
      { userId: authSession.user.id },
      { session },
    );
    return res.redirect(
      `${baseUrl}/api/stripe/checkout_cancel?session_id=${sessionId}`,
    );
  }

  const { orderId } = session.metadata as TStripeMetadata;
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: authSession.user.id,
      paidAt: null,
      paymentDetail: {
        paymentMethodId: session.id,
        paymentMethodStatus: {
          not: STRIPE_CHECKOUT_STATUS.COMPLETED,
        },
      },
    },
    include: {
      items: true,
    },
  });

  if (!order || session.payment_status !== 'paid') {
    return res.redirect(
      `${baseUrl}/api/stripe/checkout_cancel?session_id=${sessionId}`,
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paidAt: new Date(),
        paymentDetail: {
          update: {
            paymentMethodStatus: STRIPE_CHECKOUT_STATUS.COMPLETED,
          },
        },
      },
    }),
    ...order.items.map((item) =>
      prisma.variant.update({
        where: {
          id: item.variantId,
        },
        data: {
          quantity_in_stock: {
            decrement: item.quantity,
          },
          sold_amount: {
            increment: item.quantity,
          },
        },
      }),
    ),
  ]);

  return res.redirect(`${baseUrl}/order/${order.id}?stripe_success=true`);
}
