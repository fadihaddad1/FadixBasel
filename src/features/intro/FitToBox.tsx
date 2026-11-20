import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Centers its child and uniformly scales it down (never up) so it always fits the available
 * box — guarantees nothing in a scene is clipped on short or narrow viewports.
 */
export function FitToBox({ children, maxWidth = 1040 }: { children: ReactNode; maxWidth?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const w = i.offsetWidth;
      const h = i.offsetHeight;
      if (!w || !h) return;
      const s = Math.min(1, o.clientWidth / w, o.clientHeight / h);
      setScale((prev) => (Math.abs(prev - s) > 0.005 ? s : prev));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={inner}
        className="w-full shrink-0 transition-transform duration-300 ease-out"
        style={{ maxWidth, transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >
        {children}
      </div>
    </div>
  );
}
