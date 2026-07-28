import React, { useMemo, useState } from "react";
import { UiDropdown } from "../UiDropdown";
import { channelLabel, statusLabel } from "./amplifyData";
import { PackStatusFilter, SharePack } from "./amplifyTypes";

interface SharePacksViewProps {
  packs: SharePack[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onOpen: (pack: SharePack) => void;
  onApprove: (ids: string[]) => void;
  onSend: (ids: string[]) => void;
  onCreate: () => void;
}

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "needs_approval", label: "Needs approval" },
  { value: "ready", label: "Ready" },
  { value: "sent", label: "Sent" },
  { value: "archived", label: "Archived" },
];

export const SharePacksView: React.FC<SharePacksViewProps> = ({
  packs,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onOpen,
  onApprove,
  onSend,
  onCreate,
}) => {
  const [statusFilter, setStatusFilter] = useState<PackStatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return packs.filter((pack) => {
      if (statusFilter !== "all" && pack.status !== statusFilter) return false;
      if (!query) return true;
      return (
        pack.title.toLowerCase().includes(query) ||
        pack.subtitle.toLowerCase().includes(query) ||
        pack.audienceLabel.toLowerCase().includes(query) ||
        pack.sourceLabel.toLowerCase().includes(query)
      );
    });
  }, [packs, search, statusFilter]);

  const primaryAction = (pack: SharePack) => {
    if (pack.status === "needs_approval") return "Review";
    if (pack.status === "ready") return "Send";
    return "View";
  };

  return (
    <div className="amp-packs">
      <div className="amp-packs__filters">
        <input
          type="search"
          className="amp-search"
          placeholder="Search packs…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search share packs"
        />
        <UiDropdown
          size="sm"
          value={statusFilter}
          options={statusFilterOptions}
          ariaLabel="Filter by status"
          onChange={(value) => setStatusFilter(value as PackStatusFilter)}
        />
        <span className="amp-packs__count">{filtered.length} packs</span>
        <button type="button" className="cs-btn cs-btn--primary amp-packs__create" onClick={onCreate}>
          Create New Pack
        </button>
      </div>

      <div className="amp-pack-grid">
        {filtered.map((pack) => {
          const selected = selectedIds.includes(pack.id);
          return (
            <article key={pack.id} className={`amp-pack-card${selected ? " is-selected" : ""}`}>
              <label className="amp-pack-card__check">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleSelect(pack.id)}
                  aria-label={`Select ${pack.title}`}
                />
              </label>
              <button type="button" className="amp-pack-card__body" onClick={() => onOpen(pack)}>
                <div className="amp-pack-card__thumb">
                  <img src={pack.thumbnailUrl} alt="" />
                  {pack.mediaType === "video" && (
                    <span className="amp-pack-card__media-type" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4.5v7l6-3.5-6-3.5z" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                  <span className={`amp-pack-badge amp-pack-badge--${pack.status}`}>
                    {statusLabel[pack.status]}
                  </span>
                </div>
                <div className="amp-pack-card__content">
                  <h3>{pack.title}</h3>
                  <p>{pack.subtitle}</p>
                  <p className="amp-pack-card__meta">
                    {pack.audienceCount} · {pack.channels.map((channel) => channelLabel[channel]).join(" · ")}
                  </p>
                  <p className="amp-pack-card__cta">{pack.ctaLabel}</p>
                  {pack.metrics && (
                    <p className="amp-pack-card__metrics">
                      {pack.metrics.shares} shares · {pack.metrics.clicks} clicks · {pack.metrics.applications} apps
                    </p>
                  )}
                </div>
              </button>
              <div className="amp-pack-card__actions">
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary"
                  onClick={() => {
                    if (pack.status === "ready") onSend([pack.id]);
                    else onOpen(pack);
                  }}
                >
                  {primaryAction(pack)}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="amp-empty">No share packs match these filters.</p>}

      {selectedIds.length > 0 && (
        <div className="amp-bulk-bar" role="region" aria-label="Bulk actions">
          <span>{selectedIds.length} selected</span>
          <button type="button" className="cs-btn cs-btn--secondary" onClick={() => onApprove(selectedIds)}>
            Approve
          </button>
          <button type="button" className="cs-btn cs-btn--primary" onClick={() => onSend(selectedIds)}>
            Send via Email
          </button>
          <button type="button" className="cs-btn cs-btn--secondary" onClick={onClearSelection}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
