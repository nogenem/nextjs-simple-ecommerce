import NextImage from 'next/image';
import Link from 'next/link';

import { Flex, Td, Tr } from '@chakra-ui/react';

import { getProductUrl } from '~/features/products/utils/get-product-url';
import { TruncatedText } from '~/shared/components';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { TableItemPriceCell } from './table-item-price-cell';
import { TableItemQuantityCell } from './table-item-quantity-cell';

const IMAGE_SIZE = 80;

type TTableItemProps = {
  item: NonNullable<RouterOutputs['orders']['byId']>['items'][number];
};

const TableItem = ({ item }: TTableItemProps) => {
  const variant = item.variant;

  if (!variant) return null;

  const variantDescription = variant.attributes
    .reduce((prev, curr) => {
      prev.push(curr.name);
      return prev;
    }, [] as string[])
    .join(', ');

  let VariantImage = (
    <NextImage
      src={variant.images[0]?.url || ''}
      alt={variant.images[0]?.alternative_text || ''}
      width={IMAGE_SIZE}
      height={IMAGE_SIZE}
      style={{ maxWidth: 'unset' }}
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
