import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Box, Flex, Link, useColorModeValue } from '@chakra-ui/react';
import { AttributeType } from '@prisma/client';

import { useAttributes } from '~/features/attributes/hooks';
import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { FilterRowHeader } from './filter-row-header';

const SizeFilterRow = () => {
  const sizes = useAttributes({ type: AttributeType.Size });

  return (
    <Flex w="100%" direction="column">
      <FilterRowHeader
        label="Sizes"
        queryParamKeys={[URL_QUERY_KEYS.SIZE_ID]}
      />
      {sizes.isLoading && <Box>Loading...</Box>}
      {!!sizes.data && (
        <Flex direction="column" gap="2" maxH="250" overflowY="auto">
          {sizes.data.map((size) => (
            <SizeFilterItem key={size.id} size={size} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

const SizeFilterItem = ({
  size,
}: {
  size: RouterOutputs['attributes']['all'][number];
}) => {
  const { pathname, query } = useRouter();
  const activeColor = useColorModeValue('primary.600', 'white');

  return (
    <NextLink
      href={{
        pathname,
        query: { ...query, [URL_QUERY_KEYS.SIZE_ID]: size.id },
      }}
      passHref
      legacyBehavior
    >
      <Link
        textDecor={
          query[URL_QUERY_KEYS.SIZE_ID] === size.id ? 'underline' : 'unset'
        }
        color={query[URL_QUERY_KEYS.SIZE_ID] === size.id ? activeColor : ''}
      >
        {size.name}
      </Link>
    </NextLink>
  );
};

export { SizeFilterRow };
