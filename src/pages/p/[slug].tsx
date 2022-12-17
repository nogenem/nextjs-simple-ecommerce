import { useState } from 'react';

import { useRouter } from 'next/router';

import {
  Alert,
  AlertIcon,
  Box,
  Card,
  CardBody,
  CircularProgress,
  useColorModeValue,
} from '@chakra-ui/react';
import type { VariantImage } from '@prisma/client';

import { useFiltersSync } from '~/features/filters/hooks';
import { useProductBySlug } from '~/features/products/hooks';
import { ImagesCarousel } from '~/features/variant-images/components';
import { useProductVariantByFilters } from '~/features/variants/hooks';
import { ShimmerImage } from '~/shared/components';

const SELECTED_IMAGE_SIZE = 350;

const Product = () => {
  useFiltersSync();

  const router = useRouter();
  const product = useProductBySlug(router.query.slug as string);
  const variant = useProductVariantByFilters(product.data);
  const [imageIdx, setImageIdx] = useState(0);

  const cardBorderColor = useColorModeValue('gray.300', 'gray.600');

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

  const selectedImage = variant.images[imageIdx];

  const onCarouselImageClick = (img: VariantImage, index: number) => {
    setImageIdx(index);
  };

  return (
    <Box w="100%" display="flex" alignItems="center" justifyContent="center">
      <Box w="100%" maxW="1000">
        <Card maxW={SELECTED_IMAGE_SIZE}>
          <CardBody borderRadius="lg" p={0}>
            <Box
              borderTopRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor={cardBorderColor}
            >
              <ShimmerImage
                src={selectedImage?.url || ''}
                alt={selectedImage?.alternative_text || ''}
                width={SELECTED_IMAGE_SIZE}
                maxW="100%"
                height={SELECTED_IMAGE_SIZE}
                transform="scale(1)"
                transition="transform 0.5s"
                willChange="transform"
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Box>
            <ImagesCarousel
              images={variant.images}
              selectedImageIndex={imageIdx}
              onImageClick={onCarouselImageClick}
            />
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default Product;
