import type { ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { SearchIcon } from '@chakra-ui/icons';
import {
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';

import { useDebouncedCallback } from '~/shared/hooks';

import { URL_QUERY_KEYS } from '../../constants/url-query-keys';
import { useFilterByKey } from '../../hooks';

const SearchFilter = () => {
  const router = useRouter();

  const search = useFilterByKey(URL_QUERY_KEYS.SEARCH);

  const handleOnChange = useDebouncedCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      const query: typeof router.query = {
        ...router.query,
      };

      if (newValue) {
        query[URL_QUERY_KEYS.SEARCH] = newValue;
      } else {
        delete query[URL_QUERY_KEYS.SEARCH];
      }

      const url = {
        pathname: router.pathname,
        query,
      };
      router.push(url, undefined, { shallow: true });
    },
    500,
  );

  return (
    <FormControl maxW="45rem">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          type="search"
          placeholder="Search..."
          onChange={handleOnChange}
          defaultValue={search}
        />
      </InputGroup>
    </FormControl>
  );
};

export { SearchFilter };
