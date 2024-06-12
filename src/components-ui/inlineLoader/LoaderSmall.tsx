import React from "react";
import "./LoaderSmall.scss";

/**
 * LoaderSmall Component
 * @param {string} title - Optional title for the small loader
 * Renders a smaller loader animation with an optional title.
 */
export const LoaderSmall = ({ title = "" }) => {
  // Display text for the small loader, defaults to an empty string if no title provided
  const displayText = title || "";

  // CSS for the smaller loader animation
  const css = `.nc-loop-bars-rotate-24-icon-o{--animation-duration:0.8s;transform-origin:12px 12px;animation:nc-loop-bars-rotate-anim var(--animation-duration) infinite steps(8,start)}@keyframes nc-loop-bars-rotate-anim{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`;

  return (
    <div className="loading-container">
      {/* Display the optional title */}
      <span className="loading-text">{displayText}</span>
      {/* SVG smaller loader animation */}
      <svg
        height="24"
        width="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <g
          fill="#2927B2"
          stroke="#2927B2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="2"
        >
          <g className="nc-loop-bars-rotate-24-icon-o">
            <line
              fill="none"
              stroke="#2927B2"
              x1="23"
              x2="19"
              y1="12"
              y2="12"
            />
            <line
              fill="none"
              opacity="0.4"
              stroke="#2927B2"
              x1="19.778"
              x2="16.95"
              y1="19.778"
              y2="16.95"
            />
            <line
              fill="none"
              opacity="0.4"
              stroke="#2927B2"
              x1="12"
              x2="12"
              y1="23"
              y2="19"
            />
            <line
              fill="none"
              opacity="0.4"
              stroke="#2927B2"
              x1="4.222"
              x2="7.05"
              y1="19.778"
              y2="16.95"
            />
            <line
              fill="none"
              opacity="0.4"
              stroke="#2927B2"
              x1="1"
              x2="5"
              y1="12"
              y2="12"
            />
            <line
              fill="none"
              opacity="0.4"
              stroke="#2927B2"
              x1="4.222"
              x2="7.05"
              y1="4.222"
              y2="7.05"
            />
            <line
              fill="none"
              opacity="0.6"
              stroke="#2927B2"
              x1="12"
              x2="12"
              y1="1"
              y2="5"
            />
            <line
              fill="none"
              opacity="0.8"
              stroke="#2927B2"
              x1="19.778"
              x2="16.95"
              y1="4.222"
              y2="7.05"
            />
          </g>
          <style>{css}</style>
        </g>
      </svg>
    </div>
  );
};
