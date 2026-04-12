"use client";

import { HTMLAttributes, ReactNode, useRef } from "react";

type InteractiveCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function InteractiveCard({
  children,
  className = "",
  onMouseMove,
  onMouseLeave,
  ...props
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    node.style.setProperty("--pointer-x", `${x}px`);
    node.style.setProperty("--pointer-y", `${y}px`);

    onMouseMove?.(event);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const node = ref.current;
    if (node) {
      node.style.setProperty("--pointer-x", "50%");
      node.style.setProperty("--pointer-y", "50%");
    }

    onMouseLeave?.(event);
  };

  return (
    <div
      ref={ref}
      className={`interactive-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
