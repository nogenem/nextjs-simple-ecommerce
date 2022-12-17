import { useRef } from 'react';

import NextImage from 'next/image';

import { Box, useColorModeValue } from '@chakra-ui/react';
import type { VariantImage } from '@prisma/client';

import { useHorizontalScroll } from '~/shared/hooks';

const IMAGE_SIZE = 150;

type TImagesCarouselProps = {
  images: VariantImage[];
  selectedImageIndex: number;
  onImageClick: (img: VariantImage, index: number) => void;
};

const ImagesCarousel = ({
  images,
  selectedImageIndex,
  onImageClick,
}: TImagesCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerBorderColor = useColorModeValue('gray.300', 'gray.600');
  const wrapperBorderColor = useColorModeValue('primary.500', 'primary.300');

  useHorizontalScroll(containerRef);

  return (
    <Box
      ref={containerRef}
      w="100%"
      h={IMAGE_SIZE}
      position="relative"
      display="flex"
      gap="0.5"
      overflowX="auto"
      border="1px solid"
      borderColor={containerBorderColor}
    >
      {images.map((img, idx) => {
        return (
          <Box
            key={img.id}
            display="flex"
            w={IMAGE_SIZE}
            maxW="100%"
            h="auto"
            style={{ aspectRatio: `auto ${IMAGE_SIZE} / ${IMAGE_SIZE}` }}
            cursor="pointer"
            border="2px solid"
            borderColor={
              selectedImageIndex === idx ? wrapperBorderColor : 'transparent'
            }
            transition="border-color 0.5s"
            willChange="border-color"
            _hover={{ borderColor: wrapperBorderColor }}
            onClick={() => onImageClick(img, idx)}
          >
            <NextImage
              src={img.url}
              alt={img.alternative_text}
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export type { TImagesCarouselProps };
export { ImagesCarousel };
