import { extendTheme, theme as baseTheme } from '@chakra-ui/react';
import { env } from 'process';

declare global {
  // eslint-disable-next-line no-var
  var theme: ReturnType<typeof extendTheme> | undefined;
}

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: false,
  },
  colors: {
    primary: {
      ...baseTheme.colors.purple,
    },
    secondary: {
      ...baseTheme.colors.teal,
    },
  },
  fonts: {
    heading: '"Roboto", sans-serif',
    body: '"Roboto", sans-serif',
  },
});

if (env.NODE_ENV !== 'production') {
  global.theme = theme;
}

export { theme };
