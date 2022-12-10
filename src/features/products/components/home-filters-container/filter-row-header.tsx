import { MdClose } from 'react-icons/md';

import { useRouter } from 'next/router';

import { Box, Flex, Heading, Icon, Tooltip } from '@chakra-ui/react';

type TFilterRowHeaderProps = {
  label: string;
  queryParamKeys: string[];
};

const FilterRowHeader = ({ label, queryParamKeys }: TFilterRowHeaderProps) => {
  const router = useRouter();

  const hasAnyKey = queryParamKeys.some((key) => !!router.query[key]);

  const handleOnClick = () => {
    const query = { ...router.query };

    queryParamKeys.forEach((key) => {
      delete query[key];
    });

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <Flex justify="space-between">
      <Heading mb="2" size="sm">
        {label}
      </Heading>
      {hasAnyKey && (
        <Tooltip label="Remove filter">
          <Box as="button" onClick={handleOnClick}>
            <Icon boxSize="1.25rem" as={MdClose} />
          </Box>
        </Tooltip>
      )}
    </Flex>
  );
};

export type { TFilterRowHeaderProps };
export { FilterRowHeader };
