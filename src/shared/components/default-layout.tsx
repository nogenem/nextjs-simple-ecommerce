import React from 'react';

import { Box } from '@chakra-ui/react';

import { Navbar } from './navbar';

type TDefaultLayoutProps = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: TDefaultLayoutProps) => {
  return (
    <>
      <Navbar />
      <Box as="main" paddingX={4} paddingY={1}>
        {children}
      </Box>
    </>
  );
};

export type { TDefaultLayoutProps };
export { DefaultLayout };
