import NextLink from 'next/link';

import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import { ShimmerImage } from '~/shared/components';
import { formatPrice } from '~/shared/utils/format-price';
import { getRandomArbitrary } from '~/shared/utils/get-random-arbitrary';
import type { RouterOutputs } from '~/shared/utils/trpc';

type TProductCardProps = {
  product: RouterOutputs['products']['home'][number];
};

const ProductCard = ({ product }: TProductCardProps) => {
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBoxShadowColor = useColorModeValue(
    'var(--chakra-colors-primary-600)',
    'white',
  );
  const priceTextColor = useColorModeValue('blue.600', 'blue.200');
  const discountedPriceTextColor = useColorModeValue('gray.600', 'gray.300');
  const soldOutTextColor = useColorModeValue('red.600', 'red.300');

  const variant = product.variants[0];

  if (!variant || !variant.images) return null;

  const image = variant.images[getRandomArbitrary(0, variant.images.length)];

  if (!image) return null;

  const priceWithoutDiscount = formatPrice(
    variant.price,
    variant.currency_code,
  );
  const priceWithDiscount = formatPrice(
    variant.price,
    variant.currency_code,
    product.discount?.percent,
  );

  const query = variant.attributes
    .map((attr) => `${attr.type.toLowerCase()}_id=${attr.id}`)
    .join('&');

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

  return (
    <NextLink href={`/p/${product.slug}?${query}`} passHref legacyBehavior>
      <Link textDecoration="none !important" target="_blank">
        <Card
          maxW="300"
          boxShadow="inset 0px 0px 1px 1px transparent"
          transition="box-shadow 0.5s"
          willChange="box-shadow"
          border="1px solid"
          borderColor={cardBorderColor}
          _hover={{ boxShadow: `inset 0px 0px 1px 1px ${cardBoxShadowColor}` }}
        >
          <CardBody>
            <Box
              overflow="hidden"
              border="1px solid"
              borderColor={cardBorderColor}
              borderRadius="lg"
            >
              <ShimmerImage
                src={image.url}
                alt={image.alternative_text || ''}
                width={300}
                maxW="100%"
                height={300}
                borderRadius="lg"
                transform="scale(1)"
                transition="transform 0.5s"
                willChange="transform"
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Box>
            <Stack mt="6" spacing="3">
              <Heading size="md">{product.name}</Heading>
              <Flex gap="2" align="center">
                {priceText}
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      </Link>
    </NextLink>
  );
};

export type { TProductCardProps };
export { ProductCard };
