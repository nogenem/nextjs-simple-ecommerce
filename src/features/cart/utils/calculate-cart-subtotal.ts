import type { TCartItemWithVariant } from '~/shared/types/globals';
import { calculatePrice } from '~/shared/utils/calculate-price';

export const calculateCartSubtotal = (items: TCartItemWithVariant[]) =>
  items.reduce((curr, prev) => {
    return (
      curr +
      prev.quantity *
        calculatePrice(
          prev.variant?.price || 0,
          prev.variant?.product.discount?.percent,
        )
    );
  }, 0);
