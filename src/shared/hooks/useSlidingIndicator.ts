import { useLayoutEffect, useRef, useState } from "react";

export function useSlidingIndicator(activeKey: string, widthRatio = 1, enabled = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      setIndicatorStyle({ opacity: 0 });
      return;
    }

    const updateIndicator = () => {
      const activeItem = Array.from(container.querySelectorAll<HTMLElement>("[data-sliding-item]")).find(
        (item) => item.dataset.slidingItem === activeKey,
      );

      if (!activeItem) {
        setIndicatorStyle((current) => (current.opacity === 0 ? current : { opacity: 0 }));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const nextStyle: React.CSSProperties = {
        width: `${itemRect.width * widthRatio}px`,
        transform: `translateX(${itemRect.left - containerRect.left + container.scrollLeft}px)`,
        opacity: 1,
      };

      setIndicatorStyle((current) =>
        current.width === nextStyle.width &&
        current.transform === nextStyle.transform &&
        current.opacity === nextStyle.opacity
          ? current
          : nextStyle,
      );
    };

    updateIndicator();
    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(container);
    const activeItem = Array.from(container.querySelectorAll<HTMLElement>("[data-sliding-item]")).find(
      (item) => item.dataset.slidingItem === activeKey,
    );
    if (activeItem) resizeObserver.observe(activeItem);
    window.addEventListener("resize", updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeKey, enabled, widthRatio]);

  return { containerRef, indicatorStyle };
}
