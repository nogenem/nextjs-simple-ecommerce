import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
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
import { z } from 'zod';

import { CartItemsTable } from '~/features/cart/components';
import { useCartItems } from '~/features/cart/hooks';
import { calculateCartSubtotal } from '~/features/cart/utils/calculate-cart-subtotal';
import { hasAnyInvalidItem } from '~/features/cart/utils/has-any-invalid-item';
import { useObjState } from '~/shared/hooks';
import type {
  TAddressSchema,
  TCartItemWithVariant,
} from '~/shared/types/globals';
import { calculateShippingCost } from '~/shared/utils/calculate-shipping-cost';
import { formatPrice } from '~/shared/utils/format-price';

const AddressSchema = z.object({
  country: z.string().min(1),
  postal_code: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  street_address: z.string().min(1),
  complement: z.string().min(0),
});

const PaymentMethodSchema = z.nativeEnum(PaymentMethod);

type TPaymentMethodSchema = z.infer<typeof PaymentMethodSchema>;

type CheckoutState = {
  address?: TAddressSchema;
  paymentMethod?: TPaymentMethodSchema;
};

const Checkout: NextPage = () => {
  const { status: sessionStatus } = useSession();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [state, setState] = useObjState<CheckoutState>({});
  const { items, isLoading: isItemsLoading } = useCartItems();

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      signIn('google');
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (!isItemsLoading && (hasAnyInvalidItem(items) || items.length === 0)) {
      router.push('/');
    }
  }, [items, isItemsLoading, router]);

  if (isItemsLoading) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate color="primary.300" />
      </Flex>
    );
  }

  const handleShippingAddressTabSubmit = (address: TAddressSchema) => {
    const parsedData = AddressSchema.safeParse(address);
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
    const parsedData = PaymentMethodSchema.safeParse(paymentMethod);
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

  return (
    <>
      <Head>
        <title>Simple ECommerce - Checkout</title>
        <meta
          name="description"
          content="The checkout page of this simple ecommerce"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
            handleGoBack={handleGoBackOneStep}
          />
        </TabPanels>
      </Tabs>
    </>
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
  handleGoBack,
}: {
  items: TCartItemWithVariant[];
  address?: TAddressSchema;
  paymentMethod?: PaymentMethod;
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
      >
        <Stack>
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

        <Box minW="250" mb={{ base: '3', lg: '0' }}>
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
                <Button colorScheme="primary">Place Order</Button>
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

export default Checkout;
