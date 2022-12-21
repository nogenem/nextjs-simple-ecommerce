import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { AdapterSession } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import nookies from 'nookies';

import { env } from '~/env/server.mjs';
import { saveOrMergeTempCart } from '~/features/cart/utils/save-or-merge-temp-cart';
import { prisma } from '~/server/db/client';
import { TEMP_CART_COOKIE_KEY } from '~/shared/constants/cookie-keys';
import type { CartWithItems } from '~/shared/types/globals';

export const authOptions = (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: NextApiResponse | GetServerSidePropsContext['res'],
): NextAuthOptions => ({
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      const cookies = nookies.get({ req });
      const tempCart = JSON.parse(
        cookies[TEMP_CART_COOKIE_KEY] || '{}',
      ) as CartWithItems;

      await saveOrMergeTempCart(tempCart, user.id, prisma);

      nookies.destroy({ res }, TEMP_CART_COOKIE_KEY, {
        path: '/',
      });
    },
    signOut: async (message) => {
      // PS: I dunno why, but this is the session i'm getting...
      const session = message.session as unknown as AdapterSession;

      const cart = await prisma.cart.findFirst({
        where: {
          userId: session.userId,
        },
        include: {
          items: true,
        },
      });

      if (!!cart) {
        nookies.set({ res }, TEMP_CART_COOKIE_KEY, JSON.stringify(cart), {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });
      }
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID as string,
      clientSecret: env.GOOGLE_SECRET as string,
    }),
  ],
});

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions(req, res));

export default handler;
