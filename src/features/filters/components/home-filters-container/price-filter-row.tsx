import { useRouter } from 'next/router';

import { Flex, FormControl, FormLabel } from '@chakra-ui/react';

import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import { useFilterByKey } from '~/features/filters/hooks';
import { NumberInput } from '~/shared/components';
import { useDebouncedCallback } from '~/shared/hooks';

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

  const handleMinPriceChange = useDebouncedCallback(
    (valueAsString: string, valueAsNumber: number) => {
      const nextMinPrice = Number.isNaN(valueAsNumber) ? '' : valueAsString;
      let nextMaxPrice = maxPrice;

      if (nextMaxPrice !== '' && +nextMaxPrice < valueAsNumber + 1) {
        nextMaxPrice = `${valueAsNumber + 1}`;
      }

      updateRouterQuery(nextMinPrice, nextMaxPrice);
    },
    500,
  );

  const handleMaxPriceChange = useDebouncedCallback(
    (valueAsString: string, valueAsNumber: number) => {
      const nextMaxPrice = Number.isNaN(valueAsNumber) ? '' : valueAsString;

      updateRouterQuery(minPrice, nextMaxPrice);
    },
    500,
  );

  return (
    <Flex direction="column">
      <FilterRowHeader
        label="Price"
        queryParamKeys={[URL_QUERY_KEYS.MIN_PRICE, URL_QUERY_KEYS.MAX_PRICE]}
      />
      <FormControl mb="2">
        <FormLabel>Min. price</FormLabel>
        <NumberInput
          key={minPrice}
          min={0}
          defaultValue={minPrice}
          onChange={handleMinPriceChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Max. price</FormLabel>
        <NumberInput
          key={maxPrice}
          min={(+minPrice || 0) + 1}
          defaultValue={maxPrice}
          onChange={handleMaxPriceChange}
        />
      </FormControl>
    </Flex>
  );
};

export { PriceFilterRow };
