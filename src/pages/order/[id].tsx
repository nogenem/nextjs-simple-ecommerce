import type { FormEvent } from 'react';
import { useState } from 'react';

import Head from 'next/head';
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

import { useProtectedRoute } from '~/features/auth/hooks';
import { OrderItemsTable } from '~/features/orders/components';
import { useOrderById } from '~/features/orders/hooks';
import type { TAddressSchema } from '~/shared/types/globals';
import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

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

const Order = () => {
  const toast = useToast();
  const router = useRouter();
  const orderId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  const { order, isLoading: isOrderLoading } = useOrderById(orderId);
  const [step, setStep] = useState(2);

  useProtectedRoute();

  if (isOrderLoading) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate color="primary.300" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          Order not found
        </Alert>
      </Flex>
    );
  }

  const handleShippingAddressTabSubmit = (address: TAddressSchema) => {
    if (canEditOrderShippingAddressOrPaymentMethod(order)) {
      const parsedData = AddressSchema.safeParse(address);
      if (!parsedData.success) {
        toast({
          title: 'Some data entered is invalid or missing.',
          status: 'error',
          isClosable: true,
          duration: 5000,
        });
      } else {
        // TODO: Update on the database
        setStep(2);
      }
    } else {
      setStep(2);
    }
  };

  const handlePaymentMethodTabSubmit = (paymentMethod: string) => {
    if (canEditOrderShippingAddressOrPaymentMethod(order)) {
      const parsedData = PaymentMethodSchema.safeParse(paymentMethod);
      if (!parsedData.success) {
        toast({
          title: 'Some data entered is invalid or missing.',
          status: 'error',
          isClosable: true,
          duration: 5000,
        });
      } else {
        // TODO: Update on the database
        setStep(2);
      }
    } else {
      setStep(2);
    }
  };

  return (
    <>
      <Head>
        <title>Simple ECommerce - Order</title>
        <meta
          name="description"
          content="The order page of this simple ecommerce"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Tabs align="center" isLazy index={step} onChange={setStep}>
        <TabList>
          <Tab isDisabled={step !== 0}>Shipping Address</Tab>
          <Tab isDisabled={step !== 1}>Payment Method</Tab>
          <Tab isDisabled={step !== 2}>Place Order</Tab>
        </TabList>

        <TabPanels maxW="65rem">
          <ShippingAddressTabPanel
            selectedAddress={order.shippingAddress}
            handleSubmit={handleShippingAddressTabSubmit}
          />
          <PaymentMethodTabPanel
            selectedPaymentMethod={order.paymentDetail.paymentMethod}
            handleSubmit={handlePaymentMethodTabSubmit}
          />
          <OrderDetailsTabPanel
            order={order}
            handleEditShippingAddress={() => setStep(0)}
            handleEditPaymentMethod={() => setStep(1)}
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
            Update
          </Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const PaymentMethodTabPanel = ({
  selectedPaymentMethod,
  handleSubmit,
}: {
  selectedPaymentMethod?: TPaymentMethodSchema;
  handleSubmit: (paymentMethod: string) => void;
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
            Update
          </Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const OrderDetailsTabPanel = ({
  order,
  handleEditShippingAddress,
  handleEditPaymentMethod,
}: {
  order: NonNullable<RouterOutputs['orders']['byId']>;
  handleEditShippingAddress: () => void;
  handleEditPaymentMethod: () => void;
}) => {
  let addressString = `${order.shippingAddress.street_address}, `;
  if (order.shippingAddress.complement) {
    addressString += `${order.shippingAddress.complement}, `;
  }
  addressString += `${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postal_code}, ${order.shippingAddress.country}`;

  const canEdit = canEditOrderShippingAddressOrPaymentMethod(order);

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
              {canEdit && (
                <Box textAlign="start">
                  <Button mt="3" onClick={() => handleEditShippingAddress()}>
                    Edit
                  </Button>
                </Box>
              )}
              {/* TODO: Show the date that it was shipped */}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb="3">
                Payment Method
              </Heading>
              <Text align="start" textTransform="capitalize">
                {order.paymentDetail.paymentMethod.toLocaleLowerCase()}
              </Text>
              {canEdit && (
                <Box textAlign="start">
                  <Button mt="3" onClick={() => handleEditPaymentMethod()}>
                    Edit
                  </Button>
                </Box>
              )}
              {/* TODO: Show the date that it was paid */}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb="3">
                Order Items
              </Heading>
              <OrderItemsTable items={order.items} />
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
                  <Text>{formatPrice(order.itemsSubtotal)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Shipping</Text>
                  <Text>{formatPrice(order.shippingCost)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Total</Text>
                  <Text>{formatPrice(order.totalPrice)}</Text>
                </HStack>
                {/* TODO: Show the correct payment button */}
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
      <Flex flexDirection="row-reverse"></Flex>
    </TabPanel>
  );
};

const canEditOrderShippingAddressOrPaymentMethod = (
  order: NonNullable<RouterOutputs['orders']['byId']>,
) => !order.paidAt && !order.paymentDetail.paymentMethodId;

export default Order;
