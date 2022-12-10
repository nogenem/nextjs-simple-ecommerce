import { Divider, Flex } from '@chakra-ui/react';

import { CategoryFilterRow } from './category-filter-row';
import { PriceFilterRow } from './price-filter-row';

const HomeFiltersContainer = () => {
  return (
    <Flex
      direction="column"
      gap="2"
      mr={{ base: 'unset', md: '2' }}
      width={{ base: '100%', md: '19rem' }}
      mb={{ base: '4', md: '0' }}
    >
      <CategoryFilterRow />
      <Divider />
      <PriceFilterRow />
    </Flex>
  );
};

export { HomeFiltersContainer };
