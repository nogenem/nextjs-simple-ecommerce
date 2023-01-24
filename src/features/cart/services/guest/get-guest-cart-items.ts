import type { Context } from '~/server/trpc/context';
import type { TCartItemWithVariant } from '~/shared/types/globals';

import { getGuestCart } from './get-guest-cart';

export const getGuestCartItems = async (ctx: Context) => {
  const tmpCart = getGuestCart(ctx);

  if (!tmpCart.id) return [] as TCartItemWithVariant[];

  const variantIds = tmpCart.items.map((item) => item.variantId);

  const variants = await ctx.prisma.variant.findMany({
    where: {
      id: {
        in: variantIds,
      },
    },
    include: {
      attributes: true,
      images: true,
      product: {
        include: {
          discount: true,
        },
      },
    },
  });

  const variantIdToVariantObj = variants.reduce((prev, curr) => {
    if (!prev[curr.id]) {
      prev[curr.id] = curr;
    }
    return prev;
  }, {} as Record<string, typeof variants[number]>);

  const items = tmpCart.items.map((item) => {
    const newItem: TCartItemWithVariant = {
      ...item,
      variant: variantIdToVariantObj[item.variantId],
    };
    return newItem;
  });

  const NOW = new Date();
  return items.map((item) => {
    if (
      item.variant?.product.discount &&
      item.variant.product.discount.valid_until <= NOW
    ) {
      item.variant.product.discount = null;
    }
    return item;
  });
};
