import { useMemo, useState, type ChangeEvent } from 'react';
import { MdOutlineAddShoppingCart } from 'react-icons/md';

import { useRouter } from 'next/router';

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { Attribute, VariantImage } from '@prisma/client';
import { AttributeType } from '@prisma/client';

import { useAddItemToCart } from '~/features/cart/hooks';
import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import { useFilters, useFiltersSync } from '~/features/filters/hooks';
import { useProductBySlug } from '~/features/products/hooks';
import { ImagesCarousel } from '~/features/variant-images/components';
import { useProductVariantByFilters } from '~/features/variants/hooks';
import { ColorFilterItem, ShimmerImage } from '~/shared/components';
import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

const SELECTED_IMAGE_SIZE = 350;

const Product = () => {
  useFiltersSync();

  const router = useRouter();
  const filters = useFilters();
  const product = useProductBySlug(router.query.slug as string);
  const variant = useProductVariantByFilters(product.data);
  const addItemToCart = useAddItemToCart();
  const [imageIdx, setImageIdx] = useState(0);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const sizes = useMemo(() => {
    return getProductAttributesByType(AttributeType.Size, product.data);
  }, [product.data]);
  const colors = useMemo(() => {
    return getProductAttributesByType(AttributeType.Color, product.data);
  }, [product.data]);

  const cardBorderColor = useColorModeValue('gray.300', 'gray.600');
  const priceTextColor = useColorModeValue('blue.600', 'blue.200');
  const discountedPriceTextColor = useColorModeValue('gray.600', 'gray.300');
  const soldOutTextColor = useColorModeValue('red.600', 'red.300');

  if (product.isLoading || variant === undefined) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate color="primary.300" />
      </Flex>
    );
  }

  if (!product.data || variant === null) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          Product not found
        </Alert>
      </Flex>
    );
  }

  const selectedImage = variant.images[imageIdx];

  const onCarouselImageClick = (img: VariantImage, index: number) => {
    setImageIdx(index);
  };

  const priceWithoutDiscount = formatPrice(
    variant.price,
    variant.currency_code,
  );
  const priceWithDiscount = formatPrice(
    variant.price,
    variant.currency_code,
    product.data.discount?.percent,
  );

  let priceText = (
    <>
      <Text color={priceTextColor} fontSize="2xl">
        {priceWithDiscount}
      </Text>
      {priceWithoutDiscount !== priceWithDiscount && (
        <Text
          color={discountedPriceTextColor}
          fontSize="m"
          textDecor="line-through"
        >
          {priceWithoutDiscount}
        </Text>
      )}
    </>
  );
  if (variant.quantity_in_stock === 0) {
    priceText = (
      <Text color={soldOutTextColor} fontSize="2xl">
        Sold out
      </Text>
    );
  }

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        [URL_QUERY_KEYS.SIZE_ID]: e.currentTarget.value,
      },
    };
    router.push(url, undefined, { shallow: true });
  };

  const handleQuantityToAddChange = (
    valueAsString: string,
    valueAsNumber: number,
  ) => {
    if (!!valueAsString && !Number.isNaN(valueAsNumber)) {
      setQuantityToAdd(valueAsNumber);
    }
  };

  const handleAddToCartClick = () => {
    addItemToCart.mutate({ variantId: variant.id, quantity: quantityToAdd });
    setQuantityToAdd(1);
  };

  return (
    <Flex w="100%" alignItems="center" justifyContent="center">
      <Flex
        w="100%"
        maxW="1000"
        flexDir={{ base: 'column', md: 'row' }}
        justifyContent="center"
        alignItems={{ base: 'center', md: 'start' }}
        gap="5"
      >
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
        <Flex w="100%" maxW="450" flexDir="column" gap="3">
          <Heading>{product.data.name}</Heading>
          <Box
            className="user-content-wrapper"
            dangerouslySetInnerHTML={{ __html: product.data.description_html }}
          />
          <Flex alignItems="center" gap="2">
            {priceText}
          </Flex>
          <Box>
            <Heading mb="2" size="sm">
              Color
            </Heading>
            <Flex direction="row" gap="2">
              {colors.map((color) => (
                <ColorFilterItem key={color.id} color={color} />
              ))}
            </Flex>
          </Box>
          <Box>
            <Heading mb="2" size="sm">
              Size
            </Heading>
            <Select
              onChange={handleSizeChange}
              value={filters[URL_QUERY_KEYS.SIZE_ID]}
            >
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </Select>
          </Box>

          <FormControl>
            <FormLabel>Quantity</FormLabel>
            <NumberInput
              min={1}
              value={quantityToAdd}
              onChange={handleQuantityToAddChange}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Button
            rightIcon={<MdOutlineAddShoppingCart />}
            colorScheme="primary"
            onClick={handleAddToCartClick}
            isLoading={addItemToCart.isLoading}
          >
            Add to cart
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

const getProductAttributesByType = (
  type: string,
  product?: RouterOutputs['products']['bySlug'],
) => {
  if (!product) return [];

  const idToAttrObj: Record<string, Attribute> = {};

  product.variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      if (attr.type === type && !idToAttrObj[attr.id]) {
        idToAttrObj[attr.id] = attr;
      }
    });
  });

  const attrs = Object.keys(idToAttrObj).reduce((prev, curr) => {
    prev.push(idToAttrObj[curr] as Attribute);
    return prev;
  }, [] as Attribute[]);

  return attrs;
};

export default Product;
