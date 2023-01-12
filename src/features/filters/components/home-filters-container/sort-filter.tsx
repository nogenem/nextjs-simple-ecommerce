import type { ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { Box, chakra, Select } from '@chakra-ui/react';

import { SORT_OPTIONS, URL_QUERY_KEYS } from '../../constants/url-query-keys';
import { useFilterByKey } from '../../hooks';

const Option = chakra('option');

const SortFilter = () => {
  const router = useRouter();

  const sort = useFilterByKey(URL_QUERY_KEYS.SORT) || '';

  const handleOnChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;

    const query: typeof router.query = {
      ...router.query,
    };

    if (newValue) {
      query[URL_QUERY_KEYS.SORT] = newValue;
    } else {
      delete query[URL_QUERY_KEYS.SORT];
    }

    const url = {
      pathname: router.pathname,
      query,
    };
    router.push(url, undefined, { shallow: true });
  };

  return (
    <Box minW="7rem">
      <Select placeholder="Sort..." value={sort} onChange={handleOnChange}>
        {SORT_OPTIONS.map((opt) => (
          <Option
            key={opt}
            value={opt}
            title={convertSortOptionToOptionTitle(opt)}
            textTransform="capitalize"
          >
            {convertSortOptionToOptionText(opt)}
          </Option>
        ))}
      </Select>
    </Box>
  );
};

const convertSortOptionToOptionText = (option: typeof SORT_OPTIONS[number]) =>
  option.replace('-asc', ' △').replace('-desc', ' ▽');

const convertSortOptionToOptionTitle = (option: typeof SORT_OPTIONS[number]) =>
  option.replace('-asc', ' (ascendant)').replace('-desc', ' (descending)');

export { SortFilter };
