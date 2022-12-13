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

import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import { useFilterByKey } from '~/features/filters/hooks';

import { FilterRowHeader } from './filter-row-header';

const PriceFilterRow = () => {
  const router = useRouter();

  const minPrice = useFilterByKey(URL_QUERY_KEYS.MIN_PRICE)?.toString() || '';
  const maxPrice = useFilterByKey(URL_QUERY_KEYS.MAX_PRICE)?.toString() || '';

  const updateRouterQuery = (nextMinPrice: string, nextMaxPrice: string) => {
    const query: typeof router.query = {
      ...router.query,
    };

    if (nextMinPrice !== '') {
      query[URL_QUERY_KEYS.MIN_PRICE] = nextMinPrice;
    } else {
      delete query[URL_QUERY_KEYS.MIN_PRICE];
    }

    if (nextMaxPrice !== '') {
      query[URL_QUERY_KEYS.MAX_PRICE] = nextMaxPrice;
    } else {
      delete query[URL_QUERY_KEYS.MAX_PRICE];
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

    if (nextMaxPrice !== '' && +nextMaxPrice < valueAsNumber + 1) {
      nextMaxPrice = `${valueAsNumber + 1}`;
    }

    updateRouterQuery(nextMinPrice, nextMaxPrice);
  };

  const handleMaxPriceChange = (
    valueAsString: string,
    valueAsNumber: number,
  ) => {
    const nextMaxPrice = Number.isNaN(valueAsNumber) ? '' : valueAsString;

    updateRouterQuery(minPrice, nextMaxPrice);
  };

  return (
    <Flex direction="column">
      <FilterRowHeader
        label="Price"
        queryParamKeys={[URL_QUERY_KEYS.MIN_PRICE, URL_QUERY_KEYS.MAX_PRICE]}
      />
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
