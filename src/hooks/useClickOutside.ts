import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) {
  const domNode = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const maybeHandler = (event: MouseEvent | TouchEvent) => {
      if (domNode.current && !domNode.current.contains(event.target as Node)) {
        handler();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('mousedown', maybeHandler);
    document.addEventListener('touchstart', maybeHandler, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', maybeHandler);
      document.removeEventListener('touchstart', maybeHandler);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handler, enabled]);

  return domNode;
}
