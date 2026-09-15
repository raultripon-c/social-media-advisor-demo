import React from "react";

type OneHealthLogoMarkProps = {
  className?: string;
  title?: string;
};

/** Simple One Health brand mark: solid dark blue circle (demo placeholder). */
export const OneHealthLogoMark: React.FC<OneHealthLogoMarkProps> = ({
  className = "",
  title,
}) => (
  <svg
    className={`one-health-logo-mark ${className}`.trim()}
    viewBox="0 0 24 24"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    <circle
      cx="12"
      cy="12"
      r="12"
      fill="var(--secondary-blue-bb-300, #2927b2)"
    />
  </svg>
);
