import type { ReactNode } from 'react';

import type { TextProps, ThemeTypings } from '@chakra-ui/react';
import { Text, Tooltip } from '@chakra-ui/react';

type TTruncatedTextProps = {
  tooltipLabel?: ReactNode;
  truncateAfter?: ThemeTypings['breakpoints'];
} & TextProps;

const TruncatedText = ({
  tooltipLabel,
  truncateAfter = 'base',
  children,
  ...rest
}: TTruncatedTextProps) => {
  return (
    <Tooltip label={tooltipLabel || children}>
      <Text
        whiteSpace={{ base: 'break-spaces', [truncateAfter]: 'nowrap' }}
        overflow="hidden"
        textOverflow="ellipsis"
        {...rest}
      >
        {children}
      </Text>
    </Tooltip>
  );
};

export type { TTruncatedTextProps };
export { TruncatedText };
