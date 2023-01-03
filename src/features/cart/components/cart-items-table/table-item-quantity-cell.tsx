import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip,
} from '@chakra-ui/react';

import { useUpdateItemQuantity } from '~/features/cart/hooks';
import { useDebouncedCallback } from '~/shared/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { getOutOfStockLabelText } from '../../utils/get-out-of-stock-label-text';

type TTableItemQuantityCellProps = {
  item: RouterOutputs['cart']['items'][number];
  isEditable?: boolean;
};

const TableItemQuantityCell = ({
  item,
  isEditable = false,
}: TTableItemQuantityCellProps) => {
  if (isEditable) {
    return <EditableTableItemQuantityCell item={item} />;
  } else {
    return <NonEditableTableItemQuantityCell item={item} />;
  }
};

const EditableTableItemQuantityCell = ({
  item,
}: Pick<TTableItemQuantityCellProps, 'item'>) => {
  const {
    mutate: updateItemQuantity,
    isLoading: isUpdatingItemQuantity,
    isError: gotAnErrorWhileUpdatingItemQuantity,
    lastValuesUsed,
  } = useUpdateItemQuantity();

  const handleQuantityChange = useDebouncedCallback(
    (valueAsString: string, valueAsNumber: number) => {
      if (
        !!valueAsString &&
        !Number.isNaN(valueAsNumber) &&
        variant?.available_for_sale
      ) {
        updateItemQuantity({
          itemId: item.id,
          newQuantity: valueAsNumber,
        });
      }
    },
    500,
  );

  const variant = item.variant;

  if (!variant) return null;

  const quantityErrorTooltipLabel =
    variant.quantity_in_stock < item.quantity ||
    (gotAnErrorWhileUpdatingItemQuantity &&
      !!lastValuesUsed &&
      variant.quantity_in_stock < lastValuesUsed.newQuantity)
      ? getOutOfStockLabelText(variant.quantity_in_stock)
      : '';

  return (
    <Flex w="100%" justifyContent="center">
      <Tooltip label={quantityErrorTooltipLabel}>
        <NumberInput
          key={item.quantity}
          maxW="100"
          min={1}
          max={variant.quantity_in_stock}
          defaultValue={item.quantity}
          onChange={handleQuantityChange}
          isDisabled={isUpdatingItemQuantity || !variant.available_for_sale}
          allowMouseWheel
          isValidCharacter={(value: string) => /[0-9]+/.test(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Tooltip>
    </Flex>
  );
};

const NonEditableTableItemQuantityCell = ({
  item,
}: Pick<TTableItemQuantityCellProps, 'item'>) => {
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
