import { useRouter } from 'next/router';

import { Alert, AlertIcon, Box, CircularProgress } from '@chakra-ui/react';

import { useFiltersSync } from '~/features/filters/hooks';
import { useProductBySlug } from '~/features/products/hooks';
import { useProductVariantByFilters } from '~/features/variants/hooks';

const Product = () => {
  useFiltersSync();

  const router = useRouter();
  const product = useProductBySlug(router.query.slug as string);
  const variant = useProductVariantByFilters(product.data);

  if (product.isLoading || variant === undefined) {
    return (
      <Box w="100%" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate color="primary.300" />
      </Box>
    );
  }

  if (!product.data || variant === null) {
    return (
      <Box w="100%" display="flex" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          Product not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box w="100%" display="flex" alignItems="center" justifyContent="center">
      {product.data.name}
    </Box>
  );
};

export default Product;
