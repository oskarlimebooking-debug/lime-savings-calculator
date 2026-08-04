"use client";

import React, { useLayoutEffect, useRef } from "react";

export interface AutoFitAmountProps {
  text: string;
  id?: string;
  className: string;
  /** Smallest allowed scale relative to the base font size (0-1). */
  minScale?: number;
}

/**
 * Renders `text` at the font size implied by `className`, shrinking it just enough
 * to fit its container's width when the value is unexpectedly large (e.g. a very
 * high custom price combined with many no-shows). Avoids the number spilling out
 * of its card on narrow viewports.
 */
export const AutoFitAmount: React.FC<AutoFitAmountProps> = ({
  text,
  id,
  className,
  minScale = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    const fit = () => {
      span.style.fontSize = "";
      const containerWidth = container.clientWidth;
      const naturalWidth = span.scrollWidth;
      if (containerWidth === 0 || naturalWidth <= containerWidth) return;

      const baseSize = parseFloat(getComputedStyle(span).fontSize);
      const ratio = containerWidth / naturalWidth;
      const nextSize = Math.max(baseSize * ratio, baseSize * minScale);
      span.style.fontSize = `${nextSize}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text, minScale, className]);

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <span ref={textRef} id={id} className={className} style={{ display: "inline-block", maxWidth: "100%" }}>
        {text}
      </span>
    </div>
  );
};
