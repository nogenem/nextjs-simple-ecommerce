import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Box, Flex, Heading, Link, useColorModeValue } from '@chakra-ui/react';

import { useCategories } from '~/features/categories/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

const CategoryFilterRow = () => {
  const categories = useCategories();

  return (
    <Flex w="100%" direction="column">
      <Heading mb="2" size="sm">
        Categories
      </Heading>
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
        query: { ...query, category_id: category.id },
      }}
      passHref
      legacyBehavior
    >
      <Link
        textDecor={query.category_id === category.id ? 'underline' : 'unset'}
        color={query.category_id === category.id ? activeColor : ''}
      >
        {category.name}
      </Link>
    </NextLink>
  );
};

export { CategoryFilterRow };
