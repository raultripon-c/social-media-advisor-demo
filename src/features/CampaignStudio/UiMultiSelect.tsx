import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export type UiMultiSelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SelectedChipItem = {
  key: string;
  label: string;
  onRemove: () => void;
};

const estimateChipWidth = (label: string) => Math.min(Math.max(label.length * 7.2 + 36, 64), 220);

const getVisibleChipCount = (labels: string[], availableWidth: number) => {
  if (!labels.length || availableWidth <= 0) return labels.length;

  const gap = 8;
  const countChipWidth = 48;
  const chipWidths = labels.map(estimateChipWidth);
  const allChipsWidth = chipWidths.reduce((total, width) => total + width, 0) + gap * Math.max(labels.length - 1, 0);
  if (allChipsWidth <= availableWidth) return labels.length;

  for (let count = labels.length - 1; count > 0; count -= 1) {
    const chipsWidth = chipWidths.slice(0, count).reduce((total, width) => total + width, 0);
    const totalWidth = chipsWidth + gap * count + countChipWidth;
    if (totalWidth <= availableWidth) return count;
  }

  return 0;
};

const SelectedChipList = ({ items, maxVisibleItems }: { items: SelectedChipItem[]; maxVisibleItems?: number }) => {
  const listRef = useRef<HTMLSpanElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) return undefined;

    const updateVisibleCount = () => {
      setVisibleCount(getVisibleChipCount(items.map((item) => item.label), node.getBoundingClientRect().width));
    };

    updateVisibleCount();
    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [items]);

  const cappedVisibleCount = maxVisibleItems ?? visibleCount;
  const safeVisibleCount = Math.min(cappedVisibleCount, items.length);
  const visibleItems = items.slice(0, safeVisibleCount);
  const additionalCount = Math.max(items.length - safeVisibleCount, 0);

  return (
    <span className="cs-role-tags" ref={listRef}>
      {visibleItems.map((item) => (
        <span className="cs-role-tag" key={item.key}>
          <span>{item.label}</span>
          <button
            type="button"
            aria-label={`Remove ${item.label}`}
            onClick={(event) => {
              event.stopPropagation();
              item.onRemove();
            }}
          >
            ×
          </button>
        </span>
      ))}
      {additionalCount > 0 && <span className="cs-role-tag cs-role-tag--count">+{additionalCount}</span>}
    </span>
  );
};

interface UiMultiSelectProps {
  values: string[];
  options: UiMultiSelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
  maxVisibleChips?: number;
  className?: string;
  disabled?: boolean;
}

export const UiMultiSelect: React.FC<UiMultiSelectProps> = ({
  values,
  options,
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search",
  ariaLabel,
  maxVisibleChips,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is UiMultiSelectOption => Boolean(option));

  const filteredOptions = options.filter((option) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      (option.description || "").toLowerCase().includes(query)
    );
  });

  const enabledFilteredValues = filteredOptions
    .filter((option) => !option.disabled)
    .map((option) => option.value);
  const selectedFilteredCount = enabledFilteredValues.filter((value) => values.includes(value)).length;
  const allFilteredSelected =
    enabledFilteredValues.length > 0 && selectedFilteredCount === enabledFilteredValues.length;
  const someFilteredSelected = selectedFilteredCount > 0 && !allFilteredSelected;

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

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

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const toggleValue = (value: string) => {
    const option = options.find((item) => item.value === value);
    if (option?.disabled) return;
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const toggleFilteredSelection = () => {
    if (!enabledFilteredValues.length) return;
    if (allFilteredSelected) {
      onChange(values.filter((value) => !enabledFilteredValues.includes(value)));
      return;
    }
    const next = [...values];
    enabledFilteredValues.forEach((value) => {
      if (!next.includes(value)) next.push(value);
    });
    onChange(next);
  };

  return (
    <div
      className={`cs-role-select${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
      ref={dropdownRef}
    >
      <div
        className={`cs-role-select__control${isOpen ? " is-open" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((current) => !current);
          }
        }}
      >
        {selectedOptions.length ? (
          <SelectedChipList
            maxVisibleItems={maxVisibleChips}
            items={selectedOptions.map((option) => ({
              key: option.value,
              label: option.label,
              onRemove: () => {
                if (disabled) return;
                onChange(values.filter((value) => value !== option.value));
              },
            }))}
          />
        ) : (
          <span className="cs-role-select__placeholder">{placeholder}</span>
        )}
        {!disabled && (
          <button
            type="button"
            className={`cs-role-select__clear${selectedOptions.length ? "" : " is-hidden"}`}
            aria-label="Clear selected options"
            tabIndex={selectedOptions.length ? 0 : -1}
            onClick={(event) => {
              event.stopPropagation();
              if (!selectedOptions.length) return;
              onChange([]);
            }}
          >
            ×
          </button>
        )}
      </div>
      {isOpen && !disabled && (
        <div className="cs-role-select__menu" role="listbox" aria-multiselectable="true">
          <div className="cs-role-select__toolbar">
            <button
              type="button"
              className={`cs-role-select__select-all${allFilteredSelected ? " is-selected" : ""}${
                someFilteredSelected ? " is-partial" : ""
              }`}
              aria-label={allFilteredSelected ? "Deselect all visible options" : "Select all visible options"}
              aria-pressed={allFilteredSelected}
              disabled={!enabledFilteredValues.length}
              onClick={(event) => {
                event.stopPropagation();
                toggleFilteredSelection();
              }}
            >
              <span className="cs-role-select__checkbox" aria-hidden="true" />
            </button>
            <div className="cs-role-select__search">
              <span aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={search}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                onChange={(event) => setSearch(event.target.value)}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>
          <div className="cs-role-select__options">
            {filteredOptions.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`${isSelected ? "is-selected" : ""}${option.disabled ? " is-option-disabled" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  disabled={option.disabled}
                  onClick={() => toggleValue(option.value)}
                >
                  <span className="cs-role-select__checkbox" aria-hidden="true" />
                  <span className="cs-role-select__option-copy">
                    <span>{option.label}</span>
                    {option.description ? <em>{option.description}</em> : null}
                  </span>
                </button>
              );
            })}
            {!filteredOptions.length && <div className="cs-role-select__empty">No options found</div>}
          </div>
        </div>
      )}
    </div>
  );
};
