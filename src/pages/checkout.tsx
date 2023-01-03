import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import {
  Button,
  CircularProgress,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from '@chakra-ui/react';
import { z } from 'zod';

import { useCartItems } from '~/features/cart/hooks';
import { hasAnyInvalidItem } from '~/features/cart/utils/has-any-invalid-item';
import { useObjState } from '~/shared/hooks';

const AddressSchema = z.object({
  country: z.string().min(1),
  postal_code: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  street_address: z.string().min(1),
  complement: z.string().optional(),
});

const PaymentMethodSchema = z.enum(['paypal', 'stripe']);

type Address = z.infer<typeof AddressSchema>;
type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

type CheckoutState = {
  address?: Address;
  paymentMethod?: PaymentMethod;
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

  const handleShippingAddressTabSubmit = (address: Address) => {
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
    <Tabs align="center" isLazy index={step} onChange={setStep}>
      <TabList>
        <Tab isDisabled>User Login</Tab>
        <Tab isDisabled={step !== 1}>Shipping Address</Tab>
        <Tab isDisabled={step !== 2}>Payment Method</Tab>
        <Tab isDisabled={step !== 3}>Place Order</Tab>
      </TabList>

      <TabPanels maxW="1000px">
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
        <PlaceOrderTabPanel handleGoBack={handleGoBackOneStep} />
      </TabPanels>
    </Tabs>
  );
};

const ShippingAddressTabPanel = ({
  selectedAddress,
  handleSubmit,
}: {
  selectedAddress?: Address;
  handleSubmit: (address: Address) => void;
}) => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const getInputValueByName = (name: string) =>
      e.currentTarget.querySelector<HTMLInputElement>(`input[name="${name}"]`)
        ?.value || '';

    const address: Address = {
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
          <Button type="submit">Next</Button>
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
  selectedPaymentMethod?: PaymentMethod;
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
              <Radio size="lg" value="paypal">
                Paypal
              </Radio>
              <Radio size="lg" value="stripe">
                Stripe
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <Flex flexDirection="row-reverse" gap="3">
          <Button type="submit">Next</Button>
          <Button onClick={handleGoBack}>Back</Button>
        </Flex>
      </form>
    </TabPanel>
  );
};

const PlaceOrderTabPanel = ({ handleGoBack }: { handleGoBack: () => void }) => {
  return (
    <TabPanel>
      <p>Todo...</p>
      <Flex flexDirection="row-reverse" gap="3">
        <Button onClick={handleGoBack}>Back</Button>
      </Flex>
    </TabPanel>
  );
};

export default Checkout;
