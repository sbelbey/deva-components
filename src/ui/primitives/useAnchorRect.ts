import { useLayoutEffect, useState } from 'react';

/** Posición fija bajo (o sobre) el campo, para que ninguna tabla ni diálogo con scroll recorte la lista. */
export function useAnchorRect(open: boolean, anchor: { current: HTMLElement | null }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => setRect(anchor.current?.getBoundingClientRect() ?? null);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchor]);
  return rect;
}
