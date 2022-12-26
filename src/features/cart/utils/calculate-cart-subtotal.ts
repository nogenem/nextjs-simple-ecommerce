import type { TCartItemWithVariant } from '~/shared/types/globals';
import { calculatePrice } from '~/shared/utils/calculate-price';

export const calculateCartSubtotal = (items: TCartItemWithVariant[]) =>
  items.reduce((curr, prev) => {
    let price = prev.variant?.price || 0;
    if (prev.variant && !prev.variant.available_for_sale) {
      price = 0;
    }

    return (
      curr +
      prev.quantity *
        calculatePrice(price, prev.variant?.product.discount?.percent)
    );
  }, 0);
