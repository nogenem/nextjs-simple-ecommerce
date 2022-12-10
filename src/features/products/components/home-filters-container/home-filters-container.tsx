import { Divider, Flex } from '@chakra-ui/react';

import { CategoryFilterRow } from './category-filter-row';
import { ColorFilterRow } from './color-filter-row';
import { PriceFilterRow } from './price-filter-row';
import { SizeFilterRow } from './size-filter-row';

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
      <Divider />
      <ColorFilterRow />
      <Divider />
      <SizeFilterRow />
    </Flex>
  );
};

export { HomeFiltersContainer };
