import { useState } from 'react';

import type { ImageProps } from 'next/image';
import NextImage from 'next/image';

import type { BoxProps } from '@chakra-ui/react';
import { Box, Skeleton } from '@chakra-ui/react';

type TShimmerImageProps = ImageProps &
  BoxProps & {
    alt: string;
    fallbackSrc?: string;
  };

// SOURCE: https://github.com/chakra-ui/chakra-ui/discussions/2475#discussioncomment-4238788
const ShimmerImage = ({
  src,
  alt,
  width,
  height,
  fallbackSrc = 'https://via.placeholder.com/300?text=Product%20Image',
  bgGradient,
  priority,
  quality,
  ...rest
}: TShimmerImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLoad = (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => {
    if (result.naturalWidth === 0) setIsError(true);
    else setIsLoaded(true);
  };

  const handleError = () => setIsError(true);

  return (
    <Box
      width={width}
      height={height}
      position="relative"
      overflow="hidden"
      {...rest}
    >
      <Skeleton
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        isLoaded={isLoaded}
      >
        <NextImage
          src={isError ? fallbackSrc : src}
          alt={alt}
          fill
          style={{ objectFit: 'fill' }}
          onLoadingComplete={handleLoad}
          onError={handleError}
          priority={priority}
          quality={quality}
        />
        {bgGradient && (
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bgGradient={bgGradient}
          />
        )}
      </Skeleton>
    </Box>
  );
};

export type { TShimmerImageProps };
export { ShimmerImage };
