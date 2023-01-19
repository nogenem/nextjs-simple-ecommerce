import { unstable_getServerSession } from 'next-auth';

import { authOptions } from '~/pages/api/auth/[...nextauth]';
import type { TContextRequest, TContextResponse } from '~/shared/types/globals';

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */
export const getServerAuthSession = async (ctx: {
  req: TContextRequest;
  res: TContextResponse;
}) => {
  return await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions(ctx.req, ctx.res),
  );
};
