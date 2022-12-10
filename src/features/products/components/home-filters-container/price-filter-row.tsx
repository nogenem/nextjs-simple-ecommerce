import { useState } from 'react';

import { useRouter } from 'next/router';

import {
  Flex,
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';

const PriceFilterRow = () => {
  const router = useRouter();

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const updateRouterQuery = (nextMinPrice: string, nextMaxPrice: string) => {
    const query: typeof router.query = {
      ...router.query,
    };

    if (nextMinPrice !== '') {
      query.min_price = nextMinPrice;
    } else {
      delete query.min_price;
    }

    if (nextMaxPrice !== '') {
      query.max_price = nextMaxPrice;
    } else {
      delete query.max_price;
    }

    const url = {
      pathname: router.pathname,
      query,
    };
    router.push(url, undefined, { shallow: true });
  };

  const handleMinPriceChange = (
    valueAsString: string,
    valueAsNumber: number,
  ) => {
    const nextMinPrice = Number.isNaN(valueAsNumber) ? '' : valueAsString;
    let nextMaxPrice = maxPrice;

    setMinPrice(nextMinPrice);

    if ((+nextMaxPrice || 0) < valueAsNumber + 1) {
      nextMaxPrice = `${valueAsNumber + 1}`;

      setMaxPrice(nextMaxPrice);
    }

    updateRouterQuery(nextMinPrice, nextMaxPrice);
  };

  const handleMaxPriceChange = (
    valueAsString: string,
    valueAsNumber: number,
  ) => {
    const nextMaxPrice = Number.isNaN(valueAsNumber) ? '' : valueAsString;

    setMaxPrice(nextMaxPrice);

    updateRouterQuery(minPrice, nextMaxPrice);
  };

  return (
    <Flex direction="column">
      <FormControl mb="2">
        <FormLabel>Min. price</FormLabel>
        <NumberInput min={0} value={minPrice} onChange={handleMinPriceChange}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>Max. price</FormLabel>
        <NumberInput
          min={(+minPrice || 0) + 1}
          value={maxPrice}
          onChange={handleMaxPriceChange}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </Flex>
  );
};

export { PriceFilterRow };
