import type { TCartItemWithVariant } from '~/shared/types/globals';
import { calculatePrice } from '~/shared/utils/calculate-price';

export const calculateCartSubtotal = (items: TCartItemWithVariant[]) =>
  items.reduce((curr, prev) => {
    let price = prev.variant?.price || 0;
    if (prev.variant && !prev.variant.available_for_sale) {
      price = 0;
    }

    let quantity = prev.quantity;
    if (prev.variant && prev.variant.quantity_in_stock < quantity) {
      quantity = 0;
    }

    const discount = prev.variant?.product.discount?.percent;

    return curr + quantity * calculatePrice(price, discount);
  }, 0);
