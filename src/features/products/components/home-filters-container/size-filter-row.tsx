import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Box, Flex, Heading, Link, useColorModeValue } from '@chakra-ui/react';
import { AttributeType } from '@prisma/client';

import { useAttributes } from '~/features/attributes/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

const SizeFilterRow = () => {
  const sizes = useAttributes({ type: AttributeType.Size });

  return (
    <Flex w="100%" direction="column">
      <Heading mb="2" size="sm">
        Sizes
      </Heading>
      {sizes.isLoading && <Box>Loading...</Box>}
      {!!sizes.data && (
        <Flex direction="column" gap="2" maxH="250" overflowY="auto">
          {sizes.data.map((size) => (
            <SizeFilterItem key={size.id} size={size} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

const SizeFilterItem = ({
  size,
}: {
  size: RouterOutputs['attributes']['all'][number];
}) => {
  const { pathname, query } = useRouter();
  const activeColor = useColorModeValue('primary.600', 'white');

  return (
    <NextLink
      href={{
        pathname,
        query: { ...query, size_id: size.id },
      }}
      passHref
      legacyBehavior
    >
      <Link
        textDecor={query.size_id === size.id ? 'underline' : 'unset'}
        color={query.size_id === size.id ? activeColor : ''}
      >
        {size.name}
      </Link>
    </NextLink>
  );
};

export { SizeFilterRow };
