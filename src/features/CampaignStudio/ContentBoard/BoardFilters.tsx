import React from "react";
import { UiDropdown, UiDropdownOption } from "../UiDropdown";
import { BoardFilters, CardStatus } from "./contentBoardTypes";

interface FilterOptions {
  contentTypes: string[];
  departments: string[];
  regions: string[];
  corporateValues: string[];
}

interface BoardFiltersBarProps {
  filters: BoardFilters;
  options: FilterOptions;
  resultCount: number;
  onChange: (next: BoardFilters) => void;
  onReset: () => void;
}

const statusOptions: UiDropdownOption[] = [
  { value: "all", label: "All statuses" },
  { value: "to_be_reviewed", label: "Draft" },
  { value: "awaiting_uploads", label: "Awaiting videos" },
  { value: "ready_for_campaign", label: "Ready for campaign" },
  { value: "reviewed", label: "Campaign Created" },
];

const withAllOption = (allLabel: string, options: string[]): UiDropdownOption[] => [
  { value: "all", label: allLabel },
  ...options.map((option) => ({ value: option, label: option })),
];

const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: UiDropdownOption[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="cb-filter">
    <span className="cb-filter__label">{label}</span>
    <UiDropdown
      size="sm"
      value={value}
      options={options}
      ariaLabel={label}
      onChange={onChange}
    />
  </div>
);

export const BoardFiltersBar: React.FC<BoardFiltersBarProps> = ({
  filters,
  options,
  resultCount,
  onChange,
  onReset,
}) => {
  const isFiltered =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.contentType !== "all" ||
    filters.department !== "all" ||
    filters.region !== "all" ||
    filters.corporateValue !== "all";

  return (
    <div className="cb-filters">
      <div className="cb-filters__search">
        <input
          type="search"
          className="cb-filter__search-input"
          placeholder="Search titles, copy, source, value…"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          aria-label="Search board"
        />
      </div>
      <div className="cb-filters__group">
        <FilterDropdown
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => onChange({ ...filters, status: value as CardStatus | "all" })}
        />
        <FilterDropdown
          label="Content type"
          value={filters.contentType}
          options={withAllOption("All types", options.contentTypes)}
          onChange={(value) => onChange({ ...filters, contentType: value })}
        />
        <FilterDropdown
          label="Department"
          value={filters.department}
          options={withAllOption("All departments", options.departments)}
          onChange={(value) => onChange({ ...filters, department: value })}
        />
        <FilterDropdown
          label="Region"
          value={filters.region}
          options={withAllOption("All regions", options.regions)}
          onChange={(value) => onChange({ ...filters, region: value })}
        />
        <FilterDropdown
          label="Corporate value"
          value={filters.corporateValue}
          options={withAllOption("All values", options.corporateValues)}
          onChange={(value) => onChange({ ...filters, corporateValue: value })}
        />
        {isFiltered && (
          <button type="button" className="cb-filters__reset" onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
      <div className="cb-filters__meta">
        <span className="cb-filters__count">{resultCount} cards</span>
      </div>
    </div>
  );
};
