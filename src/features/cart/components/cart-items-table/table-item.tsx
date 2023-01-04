import NextImage from 'next/image';

import { CloseIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Td, Tr } from '@chakra-ui/react';

import { useRemoveItemFromCart } from '~/features/cart/hooks';
import { TruncatedText } from '~/shared/components';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { TableItemPriceCell } from './table-item-price-cell';
import { TableItemQuantityCell } from './table-item-quantity-cell';

const IMAGE_SIZE = 80;

type TTableItemProps = {
  item: RouterOutputs['cart']['items'][number];
  isEditable?: boolean;
};

const TableItem = ({ item, isEditable = false }: TTableItemProps) => {
  if (isEditable) {
    return <EditableTableItem item={item} />;
  } else {
    return <NonEditableTableItem item={item} />;
  }
};

const EditableTableItem = ({ item }: Pick<TTableItemProps, 'item'>) => {
  const { mutate: removeItemFromCart, isLoading: isRemovingItemFromCart } =
    useRemoveItemFromCart();

  const variant = item.variant;

  if (!variant) return null;

  const variantDescription = variant.attributes
    .reduce((prev, curr) => {
      prev.push(curr.name);
      return prev;
    }, [] as string[])
    .join(', ');

  const handleRemoveItemClick = () => {
    removeItemFromCart({ itemId: item.id });
  };

  return (
    <Tr>
      <Td>
        <Flex w="100%" justifyContent="center">
          <NextImage
            src={variant.images[0]?.url || ''}
            alt={variant.images[0]?.alternative_text || ''}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            style={{ maxWidth: 'unset' }}
          />
        </Flex>
      </Td>
      <Td maxW="20rem">
        <TruncatedText truncateAfter="md">{variant.product.name}</TruncatedText>
        <TruncatedText truncateAfter="md" fontSize="sm">
          {variantDescription}
        </TruncatedText>
      </Td>
      <Td>
        <TableItemQuantityCell item={item} isEditable />
      </Td>
      <Td>
        <TableItemPriceCell item={item} />
      </Td>
      <Td>
        <IconButton
          variant="outline"
          colorScheme="red"
          title="Remove item from cart"
          aria-label="Remove item from cart"
          icon={<CloseIcon />}
          onClick={handleRemoveItemClick}
          isLoading={isRemovingItemFromCart}
        />
      </Td>
    </Tr>
  );
};

const NonEditableTableItem = ({ item }: Pick<TTableItemProps, 'item'>) => {
  const variant = item.variant;

  if (!variant) return null;

  const variantDescription = variant.attributes
    .reduce((prev, curr) => {
      prev.push(curr.name);
      return prev;
    }, [] as string[])
    .join(', ');

  return (
    <Tr>
      <Td>
        <Flex w="100%" justifyContent="center">
          <NextImage
            src={variant.images[0]?.url || ''}
            alt={variant.images[0]?.alternative_text || ''}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            style={{ maxWidth: 'unset' }}
          />
        </Flex>
      </Td>
      <Td maxW="20rem">
        <TruncatedText truncateAfter="md">{variant.product.name}</TruncatedText>
        <TruncatedText truncateAfter="md" fontSize="sm">
          {variantDescription}
        </TruncatedText>
      </Td>
      <Td>
        <TableItemQuantityCell item={item} />
      </Td>
      <Td>
        <TableItemPriceCell item={item} />
      </Td>
    </Tr>
  );
};

export type { TTableItemProps };
export { TableItem };
