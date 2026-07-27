import React, { useEffect, useRef, useState } from "react";

export type UiDropdownOption = { value: string; label: string };

interface UiDropdownProps {
  value: string;
  options: UiDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  /** Compact control for dense filter bars */
  size?: "md" | "sm";
}

export const UiDropdown: React.FC<UiDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = "Placeholder",
  ariaLabel,
  className = "",
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || dropdownRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`cs-ds-dropdown${size === "sm" ? " cs-ds-dropdown--sm" : ""}${className ? ` ${className}` : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`cs-ds-dropdown__control${isOpen ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>
          {selectedOption?.label || placeholder}
        </span>
      </button>
      {isOpen && (
        <div className="cs-ds-dropdown__menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={option.value === value ? "is-selected" : ""}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
