import type { RefObject } from 'react';
import { useEffect } from 'react';

export const useHorizontalScroll = (ref: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const element = ref.current;

    const handleOnWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!element) return;

      element.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      });
    };

    if (element) {
      element.addEventListener('wheel', handleOnWheel);
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleOnWheel);
      }
    };
  }, [ref]);
};
