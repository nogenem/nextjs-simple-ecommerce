import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Box, Flex, Link, useColorModeValue } from '@chakra-ui/react';

import { useCategories } from '~/features/categories/hooks';
import { CATEGORY_ID } from '~/features/filters/constants/url-query-keys';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { FilterRowHeader } from './filter-row-header';

const CategoryFilterRow = () => {
  const categories = useCategories();

  return (
    <Flex w="100%" direction="column">
      <FilterRowHeader label="Categories" queryParamKeys={[CATEGORY_ID]} />
      {categories.isLoading && <Box>Loading...</Box>}
      {!!categories.data && (
        <Flex direction="column" gap="2" maxH="250" overflowY="auto">
          {categories.data.map((category) => (
            <CategoryFilterItem key={category.id} category={category} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

const CategoryFilterItem = ({
  category,
}: {
  category: RouterOutputs['categories']['all'][number];
}) => {
  const { pathname, query } = useRouter();
  const activeColor = useColorModeValue('primary.600', 'white');

  return (
    <NextLink
      href={{
        pathname,
        query: { ...query, [CATEGORY_ID]: category.id },
      }}
      passHref
      legacyBehavior
    >
      <Link
        textDecor={query[CATEGORY_ID] === category.id ? 'underline' : 'unset'}
        color={query[CATEGORY_ID] === category.id ? activeColor : ''}
      >
        {category.name}
      </Link>
    </NextLink>
  );
};

export { CategoryFilterRow };
