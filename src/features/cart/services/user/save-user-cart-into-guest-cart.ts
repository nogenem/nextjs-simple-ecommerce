import nookies from 'nookies';

import { prisma } from '~/server/db/client';
import {
  GUEST_CART_COOKIE_KEY,
  GUEST_CART_COOKIE_OPTIONS,
} from '~/shared/constants/cookies';
import type { TNookiesContext } from '~/shared/types/globals';

export const saveUserCartIntoGuestCart = async (
  ctx: TNookiesContext,
  userId: string,
) => {
  const userCart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!!userCart) {
    nookies.set(
      ctx,
      GUEST_CART_COOKIE_KEY,
      JSON.stringify(userCart),
      GUEST_CART_COOKIE_OPTIONS,
    );
    return true;
  }

  return false;
};
