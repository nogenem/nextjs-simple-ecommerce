import { type Session } from 'next-auth';

import { getServerAuthSession } from '~/server/common/get-server-auth-session';
import { prisma } from '~/server/db/client';
import type { TContextRequest, TContextResponse } from '~/shared/types/globals';

type CreateContextOptions = {
  session: Session | null;
};

// SOURCE: https://trpc.io/docs/context#example-for-inner--outer-context
export type Context = {
  session: Session | null;
  prisma: typeof prisma;
  req?: TContextRequest;
  res?: TContextResponse;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (
  opts: CreateContextOptions,
): Promise<Context> => {
  return {
    session: opts.session,
    prisma,
    req: undefined,
    res: undefined,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: {
  req: TContextRequest;
  res: TContextResponse;
}): Promise<Context> => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return {
    ...(await createContextInner({
      session,
    })),
    req,
    res,
  };
};
