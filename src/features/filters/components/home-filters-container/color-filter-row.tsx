import { Box, Flex } from '@chakra-ui/react';
import { AttributeType } from '@prisma/client';

import { useAttributesByType } from '~/features/attributes/hooks';
import { URL_QUERY_KEYS } from '~/features/filters/constants/url-query-keys';
import { ColorFilterItem } from '~/shared/components';

import { FilterRowHeader } from './filter-row-header';

const ColorFilterRow = () => {
  const { attributes: colors, areTheAttributesLoading: areTheColorsLoading } =
    useAttributesByType({
      type: AttributeType.Color,
    });

  return (
    <Flex w="100%" direction="column">
      <FilterRowHeader
        label="Colors"
        queryParamKeys={[URL_QUERY_KEYS.COLOR_ID]}
      />
      {areTheColorsLoading && <Box>Loading...</Box>}
      <Flex direction="row" wrap="wrap" gap="3">
        {colors.map((color) => (
          <ColorFilterItem key={color.id} color={color} />
        ))}
      </Flex>
    </Flex>
  );
};

export { ColorFilterRow };
