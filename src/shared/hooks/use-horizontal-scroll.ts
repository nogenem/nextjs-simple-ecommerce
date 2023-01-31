import { useCallback, useRef } from 'react';

export const useHorizontalScroll = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);

  const handleOnWheel = (event: WheelEvent) => {
    if (!ref.current || !isOverflown(ref.current)) return;

    event.preventDefault();

    ref.current.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  };

  // IDEA SOURCE: https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
  const setRef = useCallback((node: T) => {
    if (ref.current) {
      ref.current.removeEventListener('wheel', handleOnWheel);
    }

    if (node) {
      node.addEventListener('wheel', handleOnWheel);
    }

    ref.current = node;
  }, []);

  return [setRef];
};

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
