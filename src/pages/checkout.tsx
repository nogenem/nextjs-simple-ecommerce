import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

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
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import { PaymentMethod } from '@prisma/client';

import { useProtectedRoute } from '~/features/auth/hooks';
import { CartItemsTable } from '~/features/cart/components';
import { useCartItems } from '~/features/cart/hooks';
import { calculateCartSubtotal } from '~/features/cart/utils/calculate-cart-subtotal';
import { hasAnyInvalidItem } from '~/features/cart/utils/has-any-invalid-item';
import { usePlaceOrder } from '~/features/orders/hooks';
import { CenteredLoadingIndicator } from '~/shared/components';
import { useObjState } from '~/shared/hooks';
import type { TAddressSchema, TPaymentMethodSchema } from '~/shared/schemas';
import { addressSchema, paymentMethodSchema } from '~/shared/schemas';
import type { TCartItemWithVariant } from '~/shared/types/globals';
import { calculateShippingCost } from '~/shared/utils/calculate-shipping-cost';
import { formatPrice } from '~/shared/utils/format-price';

type CheckoutState = {
  address?: TAddressSchema;
  paymentMethod?: TPaymentMethodSchema;
};

const CheckoutPage: NextPage = () => {
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [state, setState] = useObjState<CheckoutState>({});
  const { items, areTheItemsLoading } = useCartItems();
  const { placeOrder, isPlacingTheOrder } = usePlaceOrder();

  useProtectedRoute();

  useEffect(() => {
    if (
      !areTheItemsLoading &&
      (hasAnyInvalidItem(items) || items.length === 0)
    ) {
      router.push('/');
    }
  }, [items, areTheItemsLoading, router]);

  if (areTheItemsLoading) {
    return (
      <>
        <PageHead />
        <CenteredLoadingIndicator />
      </>
    );
  }

  const handleShippingAddressTabSubmit = (address: TAddressSchema) => {
    const parsedData = addressSchema.safeParse(address);
    if (!parsedData.success) {
      toast({
        title: 'Some data entered is invalid or missing.',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    } else {
      setState({
        address: parsedData.data,
      });
      setStep((old) => old + 1);
    }
  };

  const handlePaymentMethodTabSubmit = (paymentMethod: string) => {
    const parsedData = paymentMethodSchema.safeParse(paymentMethod);
    if (!parsedData.success) {
      toast({
        title: 'Some data entered is invalid or missing.',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    } else {
      setState({
        paymentMethod: parsedData.data,
      });
      setStep((old) => old + 1);
    }
  };

  const handleGoBackOneStep = () => {
    setStep((old) => (old - 1 >= 1 ? old - 1 : old));
  };

  const handlePlaceOrder = () => {
    const shippingAddress = state.address;
    const paymentMethod = state.paymentMethod;

    if (!shippingAddress || !paymentMethod) return false;

    placeOrder({
      shippingAddress,
      paymentMethod,
    });
  };

  return (
    <>
      <PageHead />
      <Tabs align="center" isLazy index={step} onChange={setStep}>
        <TabList>
          <Tab isDisabled>User Login</Tab>
          <Tab isDisabled={step !== 1}>Shipping Address</Tab>
          <Tab isDisabled={step !== 2}>Payment Method</Tab>
          <Tab isDisabled={step !== 3}>Place Order</Tab>
        </TabList>

        <TabPanels maxW="65rem">
          <TabPanel>{/* User Login */}</TabPanel>
          <ShippingAddressTabPanel
            selectedAddress={state.address}
            handleSubmit={handleShippingAddressTabSubmit}
          />
          <PaymentMethodTabPanel
            selectedPaymentMethod={state.paymentMethod}
            handleSubmit={handlePaymentMethodTabSubmit}
            handleGoBack={handleGoBackOneStep}
          />
          <PlaceOrderTabPanel
            items={items}
            address={state.address}
            paymentMethod={state.paymentMethod}
            isPlacingTheOrder={isPlacingTheOrder}
            handlePlaceOrder={handlePlaceOrder}
            handleGoBack={handleGoBackOneStep}
          />
        </TabPanels>
      </Tabs>
    </>
  );
};

const PageHead = () => {
  const title = 'Checkout page | ECommerce';
  const description =
    'View all details of your purcharge and make the checkout on ECommerce.';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const ShippingAddressTabPanel = ({
  selectedAddress,
  handleSubmit,
}: {
  selectedAddress?: TAddressSchema;
  handleSubmit: (address: TAddressSchema) => void;
}) => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const getInputValueByName = (name: string) =>
      e.currentTarget.querySelector<HTMLInputElement>(`input[name="${name}"]`)
        ?.value || '';

    const address: TAddressSchema = {
      country: getInputValueByName('country'),
      postal_code: getInputValueByName('postal_code'),
      state: getInputValueByName('state'),
      city: getInputValueByName('city'),
      street_address: getInputValueByName('street_address'),
      complement: getInputValueByName('complement'),
    };

    handleSubmit(address);
  };

  return (
    <TabPanel>
      <form onSubmit={onSubmit}>
        <FormControl mb="3" isRequired>
          <FormLabel>Country</FormLabel>
          <Input name="country" defaultValue={selectedAddress?.country} />
        </FormControl>
        <FormControl mb="3" isRequired>
          <FormLabel>Postal Code</FormLabel>
          <Input
            name="postal_code"
            defaultValue={selectedAddress?.postal_code}
          />
        </FormControl>
        <FormControl mb="3" isRequired>
          <FormLabel>State</FormLabel>
          <Input name="state" defaultValue={selectedAddress?.state} />
        </FormControl>
        <FormControl mb="3" isRequired>
          <FormLabel>City</FormLabel>
          <Input name="city" defaultValue={selectedAddress?.city} />
        </FormControl>
        <FormControl mb="3" isRequired>
          <FormLabel>Street Address</FormLabel>
          <Input
            name="street_address"
            placeholder="House number and street name"
            defaultValue={selectedAddress?.street_address}
          />
        </FormControl>
        <FormControl mb="3">
          <FormLabel>Complement</FormLabel>
          <Input
            name="complement"
            placeholder="Apartment, suite, unit, etc. (Optional)"
            defaultValue={selectedAddress?.complement}
          />
        </FormControl>

        <Flex flexDirection="row-reverse">
          <Button type="submit" colorScheme="primary">
            Next
          </Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const PaymentMethodTabPanel = ({
  selectedPaymentMethod,
  handleSubmit,
  handleGoBack,
}: {
  selectedPaymentMethod?: TPaymentMethodSchema;
  handleSubmit: (paymentMethod: string) => void;
  handleGoBack: () => void;
}) => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const input = e.currentTarget.querySelector<HTMLInputElement>(
      'input[name="payment_method"]:checked',
    );
    handleSubmit(input?.value || '');
  };

  return (
    <TabPanel>
      <form onSubmit={onSubmit}>
        <FormControl as="fieldset" isRequired>
          <FormLabel as="legend" fontSize="2xl">
            Payment Method
          </FormLabel>
          <RadioGroup
            name="payment_method"
            defaultValue={selectedPaymentMethod}
          >
            <Stack>
              <Radio size="lg" value={PaymentMethod.PAYPAL}>
                Paypal
              </Radio>
              <Radio size="lg" value={PaymentMethod.STRIPE}>
                Stripe
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <Flex flexDirection="row-reverse" gap="3">
          <Button type="submit" colorScheme="primary">
            Next
          </Button>
          <Button onClick={handleGoBack}>Back</Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const PlaceOrderTabPanel = ({
  items,
  address,
  paymentMethod,
  isPlacingTheOrder,
  handlePlaceOrder,
  handleGoBack,
}: {
  items: TCartItemWithVariant[];
  address?: TAddressSchema;
  paymentMethod?: PaymentMethod;
  isPlacingTheOrder: boolean;
  handlePlaceOrder: () => void;
  handleGoBack: () => void;
}) => {
  if (!address || !paymentMethod) return null;

  const cartSubtotalPrice = calculateCartSubtotal(items);
  const shippingCost = calculateShippingCost(address, cartSubtotalPrice);
  const cartTotalPrice = cartSubtotalPrice + shippingCost;

  let addressString = `${address.street_address}, `;
  if (address.complement) {
    addressString += `${address.complement}, `;
  }
  addressString += `${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`;

  return (
    <TabPanel>
      <Flex
        flexDir={{ base: 'column-reverse', lg: 'row' }}
        justifyContent="space-between"
        mb="3"
        gap={{ base: '5', lg: '3' }}
      >
        <Stack maxW={{ base: '100%', lg: '75%' }}>
          <Card>
            <CardBody>
              <Heading size="md" mb="3">
                Shipping Address
              </Heading>
              <Text align="start">{addressString}</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb="3">
                Payment Method
              </Heading>
              <Text align="start" textTransform="capitalize">
                {paymentMethod.toLocaleLowerCase()}
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb="3">
                Order Items
              </Heading>
              <CartItemsTable />
            </CardBody>
          </Card>
        </Stack>

        <Box minW="250">
          <Card>
            <CardBody>
              <Stack>
                <Heading size="md" mb="3">
                  Order Summary
                </Heading>
                <HStack justifyContent="space-between">
                  <Text>Items</Text>
                  <Text>{formatPrice(cartSubtotalPrice)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Shipping</Text>
                  <Text>{formatPrice(shippingCost)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Total</Text>
                  <Text>{formatPrice(cartTotalPrice)}</Text>
                </HStack>
                <Button
                  colorScheme="primary"
                  onClick={() => handlePlaceOrder()}
                  isLoading={isPlacingTheOrder}
                  isDisabled={!address || !paymentMethod}
                >
                  Place Order
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
      <Flex flexDirection="row-reverse">
        <Button onClick={handleGoBack}>Back</Button>
      </Flex>
    </TabPanel>
  );
};

export default CheckoutPage;
