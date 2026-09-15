import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ADVOCACY_BRIDGE_EVENT,
  approveEmployeeSuggestion,
  dismissEmployeeSuggestion,
  getEmployeeSuggestionById,
  listPendingSuggestions,
  returnEmployeeSuggestionWithEdits,
} from "../AdvocacyDemoShell/advocacyDemoBridge";
import { suggestionLibraryAssets } from "../EmployeeAdvocacy/employeeAdvocacyData";
import {
  AdvocacyPlatform,
  PostSuggestion,
} from "../EmployeeAdvocacy/types";
import { UiMultiSelect } from "../UiMultiSelect";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const PLATFORM_LABELS: Record<AdvocacyPlatform, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

const PLATFORM_OPTIONS = (Object.keys(PLATFORM_LABELS) as AdvocacyPlatform[]).map(
  (platform) => ({
    label: PLATFORM_LABELS[platform],
    value: platform,
  }),
);

const formatPlatforms = (platforms: AdvocacyPlatform[]) =>
  platforms.map((platform) => PLATFORM_LABELS[platform] || platform).join(", ");

const getAssetForSuggestion = (suggestion: {
  assetId?: string;
  assetName?: string;
  assetImageSrc?: string;
}) => {
  if (suggestion.assetImageSrc) {
    return {
      id: suggestion.assetId || "uploaded",
      label: suggestion.assetName || "Uploaded asset",
      src: suggestion.assetImageSrc,
      meta: "Uploaded · Asset",
      assetName: suggestion.assetName || "uploaded-asset",
    };
  }
  return (
    suggestionLibraryAssets.find((asset) => asset.id === suggestion.assetId) ||
    suggestionLibraryAssets.find(
      (asset) => asset.assetName === suggestion.assetName,
    )
  );
};

type SuggestionEditDraft = {
  title: string;
  text: string;
  platforms: AdvocacyPlatform[];
  assetId: string;
};

const toEditDraft = (suggestion: PostSuggestion): SuggestionEditDraft => ({
  title: suggestion.title,
  text: suggestion.text,
  platforms: [...suggestion.platforms],
  assetId: suggestion.assetId || "",
});

const ReplaceIcon = () => (
  <svg
    className="cs-drawer__regen-icon"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M13.2 8.2a5.2 5.2 0 0 1-8.9 3.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path
      d="M2.8 7.8a5.2 5.2 0 0 1 8.9-3.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path
      d="M11.8 1.9v2.5H9.3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path
      d="M4.2 14.1v-2.5h2.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const AssetSelectionModal = ({
  selectedAssetId,
  onClose,
  onSelect,
}: {
  selectedAssetId: string;
  onClose: () => void;
  onSelect: (assetId: string) => void;
}) => {
  const [pendingAssetId, setPendingAssetId] = useState(
    selectedAssetId || suggestionLibraryAssets[0]?.id || "",
  );

  return createPortal(
    <div
      className="cs-modal-backdrop cs-replace-image-modal__backdrop amp-suggestion-asset-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-suggestion-asset-title"
    >
      <div className="cs-modal cs-modal--lg cs-replace-image-modal">
        <div className="cs-modal__header">
          <h2 id="admin-suggestion-asset-title">Asset Selection</h2>
          <button
            type="button"
            className="cs-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="cs-modal__body cs-replace-image-modal__body">
          <aside
            className="cs-replace-image-modal__filters"
            aria-label="Image asset filters"
          >
            <div className="cs-replace-image-modal__filter-group">
              <strong>Upload date</strong>
              {["Today", "Current week", "Current month", "Custom ranges"].map(
                (filter, index) => (
                  <label key={`upload-${filter}`}>
                    <span
                      className={index === 0 ? "is-selected" : ""}
                      aria-hidden="true"
                    />
                    {filter}
                  </label>
                ),
              )}
            </div>
            <div className="cs-replace-image-modal__filter-group">
              <strong>Last Modified</strong>
              {["Today", "Current week", "Current month", "Custom ranges"].map(
                (filter, index) => (
                  <label key={`modified-${filter}`}>
                    <span
                      className={index === 0 ? "is-selected" : ""}
                      aria-hidden="true"
                    />
                    {filter}
                  </label>
                ),
              )}
            </div>
          </aside>
          <section className="cs-replace-image-modal__content">
            <div className="cs-replace-image-modal__toolbar">
              <div className="cs-replace-image-modal__search">
                <span aria-hidden="true" />
                <input placeholder="Search image" aria-label="Search image" />
              </div>
            </div>
            <div className="cs-replace-image-modal__content-header">
              <h3>Images ({suggestionLibraryAssets.length})</h3>
            </div>
            <div className="cs-image-options">
              {suggestionLibraryAssets.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={pendingAssetId === option.id ? "is-selected" : ""}
                  onClick={() => setPendingAssetId(option.id)}
                >
                  <span className="cs-image-options__preview">
                    <img src={option.src} alt="" />
                    {pendingAssetId === option.id && (
                      <span className="cs-image-options__check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="cs-image-options__meta">
                    <strong>{option.label}</strong>
                    <small>{option.meta}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
        <div className="cs-modal__footer cs-replace-image-modal__footer">
          <button type="button" className="cs-btn cs-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="cs-btn cs-btn--primary"
            onClick={() => onSelect(pendingAssetId)}
            disabled={!pendingAssetId}
          >
            Select Asset
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const SuggestionReviewModal = ({
  suggestion,
  onClose,
  onApprove,
  onDismiss,
  onSendBack,
}: {
  suggestion: PostSuggestion;
  onClose: () => void;
  onApprove: () => void;
  onDismiss: () => void;
  onSendBack: (draft: SuggestionEditDraft) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SuggestionEditDraft>(() =>
    toEditDraft(suggestion),
  );
  const [showAssetModal, setShowAssetModal] = useState(false);

  useEffect(() => {
    setEditing(false);
    setDraft(toEditDraft(suggestion));
    setShowAssetModal(false);
  }, [suggestion.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showAssetModal) {
        setShowAssetModal(false);
        return;
      }
      if (editing) {
        setEditing(false);
        setDraft(toEditDraft(suggestion));
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editing, onClose, showAssetModal, suggestion]);

  const viewAsset = getAssetForSuggestion(suggestion);
  const editAsset =
    suggestionLibraryAssets.find((asset) => asset.id === draft.assetId) ||
    viewAsset;

  const canSendBack =
    draft.title.trim().length > 0 &&
    draft.text.trim().length > 0 &&
    draft.platforms.length > 0 &&
    Boolean(draft.assetId);

  return (
    <>
      <div
        className="amp-suggestion-review-overlay"
        role="presentation"
        onMouseDown={() => {
          if (!showAssetModal) onClose();
        }}
      >
        <section
          className="amp-suggestion-review-modal amp-suggestion-review-modal--detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-suggestion-review-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="amp-suggestion-review-modal__header">
            <div>
              <p className="amp-suggestion-review-modal__eyebrow">
                {editing ? "Edit suggestion" : "Review suggestion"}
              </p>
              <h2 id="admin-suggestion-review-title">
                {editing ? "Make edits" : suggestion.title}
              </h2>
            </div>
            <button
              type="button"
              className="amp-suggestion-review-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="amp-suggestion-review-modal__body">
            <div className="amp-suggestion-review-modal__meta">
              <span className="amp-status amp-status--pending">
                Pending approval
              </span>
              <span>
                Created by {suggestion.createdByName || "Unknown"}
              </span>
              <time dateTime={suggestion.submittedAt}>
                Submitted {formatDate(suggestion.submittedAt)}
              </time>
            </div>

            {editing ? (
              <div className="amp-suggestion-review-form">
                <div className="amp-suggestion-review-field">
                  <label htmlFor="admin-suggestion-title">Title</label>
                  <input
                    id="admin-suggestion-title"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="amp-suggestion-review-field">
                  <label htmlFor="admin-suggestion-text">Post text</label>
                  <textarea
                    id="admin-suggestion-text"
                    rows={6}
                    value={draft.text}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="amp-suggestion-review-field">
                  <label htmlFor="admin-suggestion-platforms">Platforms</label>
                  <UiMultiSelect
                    className="amp-suggestion-review-field__control"
                    values={draft.platforms}
                    options={PLATFORM_OPTIONS}
                    onChange={(values) =>
                      setDraft((current) => ({
                        ...current,
                        platforms: values.filter(
                          (platform): platform is AdvocacyPlatform =>
                            Boolean(PLATFORM_LABELS[platform as AdvocacyPlatform]),
                        ),
                      }))
                    }
                    placeholder="Select platforms"
                    ariaLabel="Platforms"
                  />
                </div>
                <div className="amp-suggestion-review-field">
                  <span className="amp-suggestion-review-field__label">
                    Image asset
                  </span>
                  {editAsset ? (
                    <div className="cs-drawer__image-wrap">
                      <img
                        className="cs-drawer__image"
                        src={editAsset.src}
                        alt={editAsset.label}
                      />
                      <button
                        type="button"
                        className="cs-btn cs-btn--secondary cs-drawer__regen"
                        onClick={() => setShowAssetModal(true)}
                      >
                        <ReplaceIcon />
                        Replace image
                      </button>
                    </div>
                  ) : (
                    <div className="cs-drawer__image-wrap cs-drawer__image-wrap--empty">
                      <button
                        type="button"
                        className="cs-btn cs-btn--secondary cs-drawer__regen"
                        onClick={() => setShowAssetModal(true)}
                      >
                        Select Asset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="amp-suggestion-review-form">
                <div className="amp-suggestion-review-field">
                  <span className="amp-suggestion-review-field__label">Title</span>
                  <p className="amp-suggestion-review-modal__title amp-suggestion-review-modal__title--inline">
                    {suggestion.title}
                  </p>
                </div>
                <div className="amp-suggestion-review-field">
                  <span className="amp-suggestion-review-field__label">
                    Post text
                  </span>
                  <p className="amp-suggestion-review-modal__text">
                    {suggestion.text}
                  </p>
                </div>
                <div className="amp-suggestion-review-field">
                  <span className="amp-suggestion-review-field__label">
                    Platforms
                  </span>
                  <p className="amp-suggestion-review-modal__value">
                    {formatPlatforms(suggestion.platforms)}
                  </p>
                </div>
                <div className="amp-suggestion-review-field">
                  <span className="amp-suggestion-review-field__label">
                    Image asset
                  </span>
                  {viewAsset ? (
                    <div className="cs-drawer__image-wrap amp-suggestion-review-image">
                      <img
                        className="cs-drawer__image"
                        src={viewAsset.src}
                        alt={viewAsset.label}
                      />
                    </div>
                  ) : (
                    <p className="amp-suggestion-review-modal__value">
                      {suggestion.assetName || "No image selected"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <footer
            className={`amp-suggestion-review-modal__footer ${
              editing
                ? "amp-suggestion-review-modal__footer--edit"
                : "amp-suggestion-review-modal__footer--review"
            }`}
          >
            {editing ? (
              <>
                <button
                  type="button"
                  className="cs-btn cs-btn--ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft(toEditDraft(suggestion));
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cs-btn cs-btn--primary"
                  disabled={!canSendBack}
                  onClick={() => onSendBack(draft)}
                >
                  Send back to user
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="cs-btn cs-btn--ghost amp-suggestion-review-modal__dismiss"
                  onClick={onDismiss}
                >
                  Dismiss
                </button>
                <div className="amp-suggestion-review-modal__footer-actions">
                  <button
                    type="button"
                    className="cs-btn cs-btn--secondary"
                    onClick={() => setEditing(true)}
                  >
                    Make edits
                  </button>
                  <button
                    type="button"
                    className="cs-btn cs-btn--primary"
                    onClick={onApprove}
                  >
                    Approve
                  </button>
                </div>
              </>
            )}
          </footer>
        </section>
      </div>

      {showAssetModal && (
        <AssetSelectionModal
          selectedAssetId={draft.assetId}
          onClose={() => setShowAssetModal(false)}
          onSelect={(assetId) => {
            setDraft((current) => ({ ...current, assetId }));
            setShowAssetModal(false);
          }}
        />
      )}
    </>
  );
};

export const EmployeeSuggestedPostsView: React.FC = () => {
  const [suggestions, setSuggestions] = useState<PostSuggestion[]>(() =>
    listPendingSuggestions(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = () => setSuggestions(listPendingSuggestions());

  useEffect(() => {
    refresh();
    const onBridgeUpdate = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("employee-advocacy")) refresh();
    };
    window.addEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const selectedSuggestion = useMemo(
    () => (selectedId ? getEmployeeSuggestionById(selectedId) : undefined),
    [selectedId, suggestions],
  );

  const closeModal = () => setSelectedId(null);

  const approve = (suggestionId: string) => {
    approveEmployeeSuggestion(suggestionId);
    closeModal();
    refresh();
  };

  const dismiss = (suggestionId: string) => {
    dismissEmployeeSuggestion(suggestionId);
    closeModal();
    refresh();
  };

  const sendBack = (suggestionId: string, draft: SuggestionEditDraft) => {
    const asset = suggestionLibraryAssets.find(
      (item) => item.id === draft.assetId,
    );
    returnEmployeeSuggestionWithEdits(suggestionId, {
      title: draft.title.trim(),
      text: draft.text.trim(),
      platforms: draft.platforms,
      assetId: draft.assetId,
      assetName: asset?.assetName,
    });
    closeModal();
    refresh();
  };

  return (
    <section className="amp-canvas amp-employee-suggestions">
      <div className="amp-employee-suggestions__header">
        <div>
          <h2>Employee suggested posts</h2>
          <p>
            Review ideas submitted by employees before they become shareable
            content.
          </p>
        </div>
      </div>

      <div className="cs-table-wrap amp-employee-suggestions__table">
        <table className="cs-table">
          <colgroup>
            <col className="cs-col-name" />
            <col className="cs-col-status" />
            <col className="amp-col-created-by" />
            <col className="cs-col-date" />
            <col className="cs-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Post name</th>
              <th>Status</th>
              <th>Created by</th>
              <th>Submitted</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {!suggestions.length ? (
              <tr className="cs-table-empty-row">
                <td colSpan={5}>
                  <div className="cs-table-empty-state">
                    <h3>No pending suggestions</h3>
                    <p>
                      Employee post ideas awaiting approval will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              suggestions.map((suggestion) => (
                <tr key={suggestion.id}>
                  <td>
                    <button
                      type="button"
                      className="cs-link-button cs-campaign-name"
                      title={suggestion.title}
                      onClick={() => setSelectedId(suggestion.id)}
                    >
                      {suggestion.title}
                    </button>
                  </td>
                  <td>
                    <span className="amp-status amp-status--pending">
                      Pending approval
                    </span>
                  </td>
                  <td>
                    <span
                      className="cs-table-text"
                      title={suggestion.createdByName || "Unknown"}
                    >
                      {suggestion.createdByName || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="cs-table-text"
                      title={formatDate(suggestion.submittedAt)}
                    >
                      {formatDate(suggestion.submittedAt)}
                    </span>
                  </td>
                  <td className="cs-actions-cell">
                    <div className="amp-employee-suggestions__actions">
                      <button
                        type="button"
                        className="cs-btn cs-btn--secondary amp-employee-suggestions__action"
                        onClick={() => setSelectedId(suggestion.id)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedSuggestion && (
        <SuggestionReviewModal
          suggestion={selectedSuggestion}
          onClose={closeModal}
          onApprove={() => approve(selectedSuggestion.id)}
          onDismiss={() => dismiss(selectedSuggestion.id)}
          onSendBack={(draft) => sendBack(selectedSuggestion.id, draft)}
        />
      )}
    </section>
  );
};
