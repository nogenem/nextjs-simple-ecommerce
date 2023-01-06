import { Flex, Text, Tooltip } from '@chakra-ui/react';

import { getOutOfStockLabelText } from '~/features/cart/utils/get-out-of-stock-label-text';
import type { RouterOutputs } from '~/shared/utils/trpc';

type TTableItemQuantityCellProps = {
  item: NonNullable<RouterOutputs['orders']['byId']>['items'][number];
};

const TableItemQuantityCell = ({ item }: TTableItemQuantityCellProps) => {
  const variant = item.variant;

  if (!variant) return null;

  const quantityErrorTooltipLabel =
    variant.quantity_in_stock < item.quantity
      ? getOutOfStockLabelText(variant.quantity_in_stock)
      : '';

  return (
    <Flex w="100%" justifyContent="center">
      <Tooltip label={quantityErrorTooltipLabel}>
        <Text>{item.quantity}</Text>
      </Tooltip>
    </Flex>
  );
};

export type { TTableItemQuantityCellProps };
export { TableItemQuantityCell };
