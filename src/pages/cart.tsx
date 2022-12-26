import { useRef } from 'react';

import { type NextPage } from 'next';
import Head from 'next/head';
import NextImage from 'next/image';

import { CloseIcon } from '@chakra-ui/icons';
import {
  Flex,
  Heading,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';

import { useCartItems, useRemoveItemFromCart } from '~/features/cart/hooks';
import { calculateCartSubtotal } from '~/features/cart/utils/calculate-cart-subtotal';
import { useHorizontalScroll } from '~/shared/hooks';
import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

const IMAGE_SIZE = 80;

const Cart: NextPage = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { items, isLoading } = useCartItems();

  const primaryColor = useColorModeValue('primary.500', 'primary.300');

  useHorizontalScroll(tableContainerRef);

  const cartSubtotal = formatPrice(calculateCartSubtotal(items));

  return (
    <>
      <Head>
        <title>Simple ECommerce - Cart</title>
        <meta
          name="description"
          content="The cart page of this simple ecommerce"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        w="100%"
        maxW="1000"
        margin="auto"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading mb="3" color={primaryColor}>
          Your cart
        </Heading>

        <TableContainer ref={tableContainerRef} w="100%" mb="3">
          <Table className="cart-table" variant="striped">
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Product</Th>
                <Th>Quantity</Th>
                <Th>Price</Th>
                <Th>Remove</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && (
                <Tr>
                  <Td colSpan={5}>Loading...</Td>
                </Tr>
              )}
              {items.map((item) => (
                <TableItem key={item.id} item={item} />
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td></Td>
                <Td></Td>
                <Td
                  color={primaryColor}
                  fontSize="xl"
                  textTransform="uppercase"
                >
                  Subtotal:
                </Td>
                <Td color={primaryColor} fontSize="xl">
                  {cartSubtotal}
                </Td>
                <Td></Td>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Flex>
    </>
  );
};

const TableItem = ({
  item,
}: {
  item: RouterOutputs['cart']['items'][number];
}) => {
  const discountedPriceTextColor = useColorModeValue('gray.600', 'gray.300');

  const { mutate: removeItemFromCart, isLoading: isRemovingItemFromCart } =
    useRemoveItemFromCart();

  const variant = item.variant;
  if (!variant) return null;

  const variantDescription = variant.attributes
    .reduce((prev, curr) => {
      prev.push(curr.name);
      return prev;
    }, [] as string[])
    .join(', ');

  const priceWithoutDiscount = formatPrice(
    variant.price,
    variant.currency_code,
  );
  const priceWithDiscount = formatPrice(
    variant.price,
    variant.currency_code,
    variant.product.discount?.percent,
  );

  const handleQuantityChange = () => {
    // TODO: Update quantity with debounce!?
  };

  const handleRemoveItemClick = () => {
    removeItemFromCart({ itemId: item.id });
  };

  return (
    <Tr>
      <Td>
        <Flex w="100%" justifyContent="center">
          <NextImage
            src={variant.images[0]?.url || ''}
            alt={variant.images[0]?.alternative_text || ''}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
          />
        </Flex>
      </Td>
      <Td>
        <Text>{variant.product.name}</Text>
        <Text fontSize="sm">{variantDescription}</Text>
      </Td>
      <Td>
        <Flex w="100%" justifyContent="center">
          <NumberInput
            maxW="100"
            min={1}
            defaultValue={item.quantity}
            onChange={handleQuantityChange}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
      </Td>
      <Td>
        <Text>{priceWithDiscount}</Text>
        {priceWithoutDiscount !== priceWithDiscount && (
          <Text
            fontSize="sm"
            textDecor="line-through"
            color={discountedPriceTextColor}
          >
            {priceWithoutDiscount}
          </Text>
        )}
      </Td>
      <Td>
        <IconButton
          variant="outline"
          colorScheme="red"
          title="Remove item from cart"
          aria-label="Remove item from cart"
          icon={<CloseIcon />}
          onClick={handleRemoveItemClick}
          isLoading={isRemovingItemFromCart}
        />
      </Td>
    </Tr>
  );
};

export default Cart;
