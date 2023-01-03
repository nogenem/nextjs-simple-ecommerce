import { Text, Tooltip, useColorModeValue } from '@chakra-ui/react';

import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { getOutOfStockLabelText } from '../../utils/get-out-of-stock-label-text';

type TTableItemPriceCellProps = {
  item: RouterOutputs['cart']['items'][number];
};

const TableItemPriceCell = ({ item }: TTableItemPriceCellProps) => {
  const discountedPriceTextColor = useColorModeValue('gray.600', 'gray.300');

  const variant = item.variant;

  if (!variant) return null;

  const priceWithoutDiscount = formatPrice(
    variant.price,
    variant.currency_code,
  );
  const priceWithDiscount = formatPrice(
    variant.price,
    variant.currency_code,
    variant.product.discount?.percent,
  );

  let priceText = (
    <>
      <Text>{priceWithDiscount}</Text>
      {priceWithoutDiscount !== priceWithDiscount && (
        <Text
          fontSize="sm"
          textDecor="line-through"
          color={discountedPriceTextColor}
        >
          {priceWithoutDiscount}
        </Text>
      )}
    </>
  );

  if (!variant.available_for_sale) {
    priceText = (
      <Tooltip label="This product is not available to be purchased anymore">
        <Text color="tomato">Not available</Text>
      </Tooltip>
    );
  }

  if (variant.quantity_in_stock < item.quantity) {
    priceText = (
      <Tooltip label={getOutOfStockLabelText(variant.quantity_in_stock)}>
        <Text color="tomato">Out of stock</Text>
      </Tooltip>
    );
  }

  return priceText;
};

export type { TTableItemPriceCellProps };
export { TableItemPriceCell };
