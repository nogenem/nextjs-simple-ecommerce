import { prisma } from '~/server/db/client';
import type { Context } from '~/server/trpc/context';

import { getGuestCart } from './get-guest-cart';

export const countGuestCartItemsByProductId = async (
  ctx: Context,
  productId: string,
) => {
  const cart = getGuestCart(ctx);

  if (!cart.id) return 0;

  const variantsIds = cart.items.map((item) => item.variantId);

  const count = await prisma.variant.aggregate({
    _count: {
      id: true,
    },
    where: {
      id: {
        in: variantsIds,
      },
      productId,
    },
  });

  return count._count.id;
};
