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

import { env } from '~/env/server.mjs';
import {
  deleteGuestCart,
  saveOrMergeGuestCartIntoUserCart,
} from '~/features/cart/services/guest';
import { saveUserCartIntoGuestCart } from '~/features/cart/services/user';
import { prisma } from '~/server/db/client';

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
      await saveOrMergeGuestCartIntoUserCart({ req, res }, user.id);

      deleteGuestCart({ req, res });
    },
    signOut: async (message) => {
      // PS: I dunno why, but this is the session i'm getting...
      const session = message.session as unknown as AdapterSession;

      await saveUserCartIntoGuestCart({ req, res }, session.userId);
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
