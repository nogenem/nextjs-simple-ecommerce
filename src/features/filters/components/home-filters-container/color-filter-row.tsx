import { MdCircle } from 'react-icons/md';

import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Box, Flex, Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { AttributeType } from '@prisma/client';

import { useAttributes } from '~/features/attributes/hooks';
import { COLOR_ID } from '~/features/filters/constants/url-query-keys';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { FilterRowHeader } from './filter-row-header';

const ColorFilterRow = () => {
  const colors = useAttributes({ type: AttributeType.Color });

  return (
    <Flex w="100%" direction="column">
      <FilterRowHeader label="Colors" queryParamKeys={[COLOR_ID]} />
      {colors.isLoading && <Box>Loading...</Box>}
      {!!colors.data && (
        <Flex direction="row" gap="2">
          {colors.data.map((color) => (
            <ColorFilterItem key={color.id} color={color} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

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
          query: { ...query, [COLOR_ID]: color.id },
        }}
      >
        <Icon
          boxSize="1.25rem"
          as={MdCircle}
          fill={color.value}
          border={query[COLOR_ID] === color.id ? '1px solid' : ''}
          borderColor={activeBorderColor}
          borderRadius="50%"
        />
      </NextLink>
    </Tooltip>
  );
};

export { ColorFilterRow };
