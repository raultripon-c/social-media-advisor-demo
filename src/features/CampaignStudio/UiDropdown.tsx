import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type UiDropdownOption = { value: string; label: string };

interface UiDropdownProps {
  value: string;
  options: UiDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
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
  disabled = false,
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  const updateMenuPosition = useCallback(() => {
    const control = dropdownRef.current?.querySelector(".cs-ds-dropdown__control");
    const menu = menuRef.current;
    if (!(control instanceof HTMLElement)) return;

    const rect = control.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 232;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12;
    const top = openAbove ? rect.top - menuHeight - 4 : rect.bottom + 4;

    setMenuPosition({
      top: Math.max(8, top),
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return undefined;
    }

    updateMenuPosition();
    const frame = window.requestAnimationFrame(updateMenuPosition);
    window.addEventListener("resize", updateMenuPosition);
    document.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateMenuPosition);
      document.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, options.length, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (
        dropdownRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
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
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>
          {selectedOption?.label || placeholder}
        </span>
      </button>
      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="cs-ds-dropdown__menu cs-ds-dropdown__menu--portaled"
            role="listbox"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 1100,
            }}
          >
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
          </div>,
          document.body,
        )}
    </div>
  );
};
