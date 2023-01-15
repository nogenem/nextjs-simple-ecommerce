import { MdClose } from 'react-icons/md';

import { useRouter } from 'next/router';

import { Flex, Heading, Icon, IconButton, Tooltip } from '@chakra-ui/react';

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
    <Flex justify="space-between" mb="2">
      <Heading size="sm">{label}</Heading>
      {hasAnyKey && (
        <Tooltip label="Remove filter">
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Remove filter"
            icon={<Icon boxSize="1.25rem" as={MdClose} />}
            onClick={handleOnClick}
          />
        </Tooltip>
      )}
    </Flex>
  );
};

export type { TFilterRowHeaderProps };
export { FilterRowHeader };
