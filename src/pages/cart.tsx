import { useRef } from 'react';

import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Heading,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';

import { CartItemsTable } from '~/features/cart/components';
import { useCartItems } from '~/features/cart/hooks';
import { hasAnyInvalidItem } from '~/features/cart/utils/has-any-invalid-item';
import { useHorizontalScroll } from '~/shared/hooks';

const CartPage: NextPage = () => {
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { items } = useCartItems();

  const primaryColor = useColorModeValue('primary.500', 'primary.300');

  useHorizontalScroll(tableContainerRef);

  const cartHasAnyInvalidItem = hasAnyInvalidItem(items);

  const isCheckoutButtonDisabled = cartHasAnyInvalidItem || items.length === 0;
  const checkoutButtonTooltip = cartHasAnyInvalidItem
    ? 'Please, handle the invalid items in the cart to continue'
    : items.length === 0
    ? 'Please, add some items to your cart to continue'
    : '';

  const handleCheckoutBtnClick = () => {
    router.push('/checkout');
  };

  return (
    <>
      <PageHead />
      <Flex
        w="100%"
        maxW="65rem"
        margin="auto"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading mb="3" color={primaryColor}>
          Your cart
        </Heading>

        <CartItemsTable isEditable mb="3" />

        <Flex w="100%" mt="2" justifyContent="center" alignItems="center">
          <Tooltip label={checkoutButtonTooltip}>
            <Button
              rightIcon={<ArrowForwardIcon />}
              variant="outline"
              colorScheme="primary"
              size="lg"
              isDisabled={isCheckoutButtonDisabled}
              onClick={handleCheckoutBtnClick}
            >
              Checkout
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </>
  );
};

const PageHead = () => {
  const title = 'Cart page | ECommerce';
  const description = 'View all items in your cart on ECommerce.';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default CartPage;
