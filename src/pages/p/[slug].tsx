import { useMemo, useState, type ChangeEvent } from 'react';
import { MdOutlineAddShoppingCart } from 'react-icons/md';

import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { Attribute, VariantImage } from '@prisma/client';
import { AttributeType } from '@prisma/client';

import {
  useAddItemToCart,
  useCountCartItemsByProductId,
} from '~/features/cart/hooks';
import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import { useFilters, useFiltersSync } from '~/features/filters/hooks';
import { useProductBySlug } from '~/features/products/hooks';
import { ImagesCarousel } from '~/features/variant-images/components';
import { useProductVariantByFilters } from '~/features/variants/hooks';
import {
  CenteredAlert,
  CenteredLoadingIndicator,
  ColorFilterItem,
  NumberInput,
  ShimmerImage,
} from '~/shared/components';
import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

const SELECTED_IMAGE_SIZE = 350;

const ProductPage: NextPage = () => {
  useFiltersSync();

  const router = useRouter();
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;

  const filters = useFilters();
  const { product, isProductLoading } = useProductBySlug(slug);
  const variant = useProductVariantByFilters(product);
  const { count: countCartItemsByProductId } = useCountCartItemsByProductId(
    product?.id,
  );
  const { addItemToCart, isAddingItemToCart } = useAddItemToCart();
  const [imageIdx, setImageIdx] = useState(0);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const sizes = useMemo(() => {
    return getProductAttributesByType(AttributeType.Size, product);
  }, [product]);
  const colors = useMemo(() => {
    return getProductAttributesByType(AttributeType.Color, product);
  }, [product]);

  const cardBorderColor = useColorModeValue('gray.300', 'gray.600');
  const priceTextColor = useColorModeValue('blue.600', 'blue.200');
  const discountedPriceTextColor = useColorModeValue('gray.600', 'gray.300');
  const soldOutTextColor = useColorModeValue('red.600', 'red.300');

  if (isProductLoading || variant === undefined) {
    return (
      <>
        <PageHead />
        <CenteredLoadingIndicator />
      </>
    );
  }

  if (!product || variant === null) {
    return (
      <>
        <PageHead />
        <CenteredAlert>Product not found</CenteredAlert>
      </>
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
    product.discount?.percent,
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

  const isSoldOut = variant.quantity_in_stock === 0;
  if (isSoldOut) {
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
    if (
      !!valueAsString &&
      !Number.isNaN(valueAsNumber) &&
      !isSoldOut &&
      variant.quantity_in_stock >= valueAsNumber
    ) {
      setQuantityToAdd(valueAsNumber);
    }
  };

  const handleAddToCartClick = () => {
    if (!isSoldOut) {
      addItemToCart({ variantId: variant.id, quantity: quantityToAdd });
      setQuantityToAdd(1);
    }
  };

  const nVariantsInCartMessage =
    countCartItemsByProductId > 0
      ? countCartItemsByProductId === 1
        ? `There is already 1 variant in the cart`
        : `There are already ${countCartItemsByProductId} variants in the cart`
      : '';

  return (
    <>
      <PageHead product={product} />
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Flex
          w="100%"
          maxW="65rem"
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
          <Flex w="100%" maxW="29rem" flexDir="column" gap="3">
            <Heading>{product.name}</Heading>
            <Box
              className="user-content-wrapper"
              dangerouslySetInnerHTML={{ __html: product.description_html }}
            />
            <Flex alignItems="center" gap="2">
              {priceText}
            </Flex>
            <Box>
              <Heading mb="2" size="sm">
                Color
              </Heading>
              <Flex direction="row" wrap="wrap" gap="3">
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
              <FormLabel>
                Quantity ({variant.quantity_in_stock} in stock)
              </FormLabel>
              <NumberInput
                min={1}
                value={quantityToAdd}
                onChange={handleQuantityToAddChange}
                isDisabled={isSoldOut}
              />
            </FormControl>

            <FormControl w="100%">
              <Button
                rightIcon={<MdOutlineAddShoppingCart />}
                colorScheme="primary"
                onClick={handleAddToCartClick}
                isLoading={isAddingItemToCart}
                isDisabled={isSoldOut}
                w="100%"
              >
                Add to cart
              </Button>
              <FormHelperText>{nVariantsInCartMessage}</FormHelperText>
            </FormControl>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const PageHead = ({
  product,
}: {
  product?: RouterOutputs['products']['bySlug'];
}) => {
  const title = product
    ? `${product.name} | ECommerce`
    : 'Product page | ECommerce';
  const description = product
    ? `Buy the ${product.name} on ECommerce.`
    : 'Buy a diverse quantity of products on ECommerce.';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
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

export default ProductPage;
