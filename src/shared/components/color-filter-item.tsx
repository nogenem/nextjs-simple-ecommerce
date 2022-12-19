import { MdCircle } from 'react-icons/md';

import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';

import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';

import type { RouterOutputs } from '../utils/trpc';

const ColorFilterItem = ({
  color,
}: {
  color: RouterOutputs['attributes']['all'][number];
}) => {
  const { pathname, query } = useRouter();
  const activeBorderColor = useColorModeValue('primary.600', 'white');

  return (
    <Tooltip label={color.name}>
      <NextLink
        href={{
          pathname,
          query: { ...query, [URL_QUERY_KEYS.COLOR_ID]: color.id },
        }}
      >
        <Icon
          boxSize="1.25rem"
          as={MdCircle}
          fill={color.value}
          border={
            query[URL_QUERY_KEYS.COLOR_ID] === color.id ? '1px solid' : ''
          }
          borderColor={activeBorderColor}
          borderRadius="50%"
        />
      </NextLink>
    </Tooltip>
  );
};

export { ColorFilterItem };
