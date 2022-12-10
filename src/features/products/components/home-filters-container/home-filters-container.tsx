import { Flex } from '@chakra-ui/react';

import { CategoryFilterRow } from './category-filter-row';

const HomeFiltersContainer = () => {
  return (
    <Flex
      mr="2"
      width={{ base: '100%', md: '19rem' }}
      mb={{ base: '2', md: '0' }}
    >
      <CategoryFilterRow />
    </Flex>
  );
};

export { HomeFiltersContainer };
