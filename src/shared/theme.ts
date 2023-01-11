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
    stripe: {
      50: '#f9f7ff',
      100: '#f2ebff',
      200: '#d1befe',
      300: '#b49cfc',
      400: '#8d7ffa',
      500: '#625afa',
      600: '#513dd9',
      700: '#3f32a1',
      800: '#302476',
      900: '#14134e',
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
