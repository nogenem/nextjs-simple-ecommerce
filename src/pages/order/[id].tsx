import type { FormEvent } from 'react';
import { useState } from 'react';

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
import { z } from 'zod';

import { useProtectedRoute } from '~/features/auth/hooks';
import { OrderItemsTable } from '~/features/orders/components';
import {
  useOrderById,
  useUpdatePaymentMethod,
  useUpdateShippingAddress,
} from '~/features/orders/hooks';
import { canEditOrderShippingAddressOrPaymentMethod } from '~/features/orders/utils/can-edit-order-shipping-address-or-payment-method';
import { CenteredAlert, CenteredLoadingIndicator } from '~/shared/components';
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

const OrderPage: NextPage = () => {
  const toast = useToast();
  const router = useRouter();

  const orderId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  const { order, isOrderLoading } = useOrderById(orderId);
  const { updateShippingAddressAsync, isUpdatingShippingAddress } =
    useUpdateShippingAddress();
  const { updatePaymentMethodAsync, isUpdatingPaymentMethod } =
    useUpdatePaymentMethod();
  const [step, setStep] = useState(2);

  useProtectedRoute();

  if (isOrderLoading) {
    return (
      <>
        <PageHead />
        <CenteredLoadingIndicator />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageHead />
        <CenteredAlert>Order not found</CenteredAlert>
      </>
    );
  }

  const handleShippingAddressTabSubmit = async (address: TAddressSchema) => {
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
        try {
          await updateShippingAddressAsync({
            orderId: order.id,
            shippingAddress: address,
          });
          setStep(2);
        } catch (err) {
          //
        }
      }
    } else {
      setStep(2);
    }
  };

  const handlePaymentMethodTabSubmit = async (paymentMethod: string) => {
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
        try {
          await updatePaymentMethodAsync({
            orderId: order.id,
            paymentMethod: parsedData.data,
          });
          setStep(2);
        } catch (err) {
          //
        }
      }
    } else {
      setStep(2);
    }
  };

  const handleCancelUpdate = () => {
    setStep(2);
  };

  return (
    <>
      <PageHead order={order} />
      <Tabs align="center" isLazy index={step} onChange={setStep}>
        <TabList>
          <Tab isDisabled={step !== 0}>Shipping Address</Tab>
          <Tab isDisabled={step !== 1}>Payment Method</Tab>
          <Tab isDisabled={step !== 2}>Place Order</Tab>
        </TabList>

        <TabPanels maxW="65rem">
          <ShippingAddressTabPanel
            selectedAddress={order.shippingAddress}
            isUpdatingShippingAddress={isUpdatingShippingAddress}
            handleSubmit={handleShippingAddressTabSubmit}
            handleCancel={handleCancelUpdate}
          />
          <PaymentMethodTabPanel
            selectedPaymentMethod={order.paymentDetail.paymentMethod}
            isUpdatingPaymentMethod={isUpdatingPaymentMethod}
            handleSubmit={handlePaymentMethodTabSubmit}
            handleCancel={handleCancelUpdate}
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

const PageHead = ({ order }: { order?: RouterOutputs['orders']['byId'] }) => {
  const title = order
    ? `Order: ${order.id} | ECommerce`
    : 'Order page | ECommerce';
  const description = 'View all the details of your order on ECommerce.';
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
  isUpdatingShippingAddress,
  handleSubmit,
  handleCancel,
}: {
  selectedAddress?: TAddressSchema;
  isUpdatingShippingAddress: boolean;
  handleSubmit: (address: TAddressSchema) => void;
  handleCancel: () => void;
}) => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdatingShippingAddress) return false;

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

        <Flex flexDirection="row-reverse" gap="3">
          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isUpdatingShippingAddress}
          >
            Update
          </Button>
          <Button onClick={handleCancel} isLoading={isUpdatingShippingAddress}>
            Cancel
          </Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const PaymentMethodTabPanel = ({
  selectedPaymentMethod,
  isUpdatingPaymentMethod,
  handleSubmit,
  handleCancel,
}: {
  selectedPaymentMethod?: TPaymentMethodSchema;
  isUpdatingPaymentMethod: boolean;
  handleSubmit: (paymentMethod: string) => void;
  handleCancel: () => void;
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
          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isUpdatingPaymentMethod}
          >
            Update
          </Button>
          <Button onClick={handleCancel} isLoading={isUpdatingPaymentMethod}>
            Cancel
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

export default OrderPage;
