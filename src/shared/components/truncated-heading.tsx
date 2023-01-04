import type { ReactNode } from 'react';

import type { HeadingProps, ThemeTypings } from '@chakra-ui/react';
import { Heading, Tooltip } from '@chakra-ui/react';

type TTruncatedHeadingProps = {
  tooltipLabel?: ReactNode;
  truncateAfter?: ThemeTypings['breakpoints'];
} & HeadingProps;

const TruncatedHeading = ({
  tooltipLabel,
  truncateAfter = 'base',
  children,
  ...rest
}: TTruncatedHeadingProps) => {
  return (
    <Tooltip label={tooltipLabel || children}>
      <Heading
        whiteSpace={{ base: 'break-spaces', [truncateAfter]: 'nowrap' }}
        overflow="hidden"
        textOverflow="ellipsis"
        {...rest}
      >
        {children}
      </Heading>
    </Tooltip>
  );
};

export type { TTruncatedHeadingProps };
export { TruncatedHeading };
