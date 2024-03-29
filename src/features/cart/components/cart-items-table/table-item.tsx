import NextImage from 'next/image';
import Link from 'next/link';

import { CloseIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Td, Tr } from '@chakra-ui/react';

import { useRemoveItemFromCart } from '~/features/cart/hooks';
import { getProductUrl } from '~/features/products/utils/get-product-url';
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
  const { removeItemFromCart, isRemovingItemFromCart } =
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

  let VariantImage = (
    <NextImage
      src={variant.images[0]?.url || ''}
      alt={variant.images[0]?.alternative_text || ''}
      width={IMAGE_SIZE}
      height={IMAGE_SIZE}
      style={{ maxWidth: 'unset' }}
      sizes={`${IMAGE_SIZE}px`}
    />
  );
  if (variant.available_for_sale) {
    VariantImage = (
      <Link
        href={getProductUrl(variant.product.slug, variant.attributes)}
        target="_blank"
      >
        {VariantImage}
      </Link>
    );
  }

  return (
    <Tr>
      <Td>
        <Flex w="100%" justifyContent="center">
          {VariantImage}
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
            sizes={`${IMAGE_SIZE}px`}
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
