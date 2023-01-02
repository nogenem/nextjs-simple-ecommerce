import type { TCartItemWithVariant } from '~/shared/types/globals';

export const hasAnyInvalidItem = (items: TCartItemWithVariant[]) =>
  items.filter(
    (item) =>
      !item.variant ||
      !item.variant.available_for_sale ||
      item.variant.quantity_in_stock < item.quantity,
  ).length > 0;
