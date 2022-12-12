import { Box } from '@chakra-ui/react';

import { useFiltersSync } from '~/features/filters/hooks';

const Product = () => {
  useFiltersSync();

  return <Box w="100%">Product page</Box>;
};

export default Product;
