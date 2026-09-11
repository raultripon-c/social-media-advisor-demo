import React, { useEffect, useState } from "react";
import {
  ADVOCACY_BRIDGE_EVENT,
  approveEmployeeSuggestion,
  getEmployeeSuggestionById,
  listPendingSuggestions,
} from "../AdvocacyDemoShell/advocacyDemoBridge";
import { PostSuggestion } from "../EmployeeAdvocacy/types";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const SuggestionReviewModal = ({
  suggestion,
  onClose,
  onApprove,
}: {
  suggestion: PostSuggestion;
  onClose: () => void;
  onApprove: () => void;
}) => (
  <div className="amp-suggestion-review-overlay" role="presentation" onMouseDown={onClose}>
    <section
      className="amp-suggestion-review-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-suggestion-review-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <header className="amp-suggestion-review-modal__header">
        <h2 id="admin-suggestion-review-title">Post suggestion</h2>
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
          <span className="amp-status amp-status--pending">Pending approval</span>
          <time dateTime={suggestion.submittedAt}>
            Submitted {formatDate(suggestion.submittedAt)}
          </time>
        </div>
        <h3 className="amp-suggestion-review-modal__title">{suggestion.title}</h3>
        <p className="amp-suggestion-review-modal__text">{suggestion.text}</p>
        <dl className="amp-suggestion-review-modal__details">
          <div>
            <dt>Platforms</dt>
            <dd>{suggestion.platforms.join(", ")}</dd>
          </div>
          {suggestion.assetName && (
            <div>
              <dt>Asset</dt>
              <dd>{suggestion.assetName}</dd>
            </div>
          )}
        </dl>
      </div>
      <footer className="amp-suggestion-review-modal__footer">
        <button type="button" className="cs-btn cs-btn--secondary-ghost" onClick={onClose}>
          Close
        </button>
        <button type="button" className="cs-btn cs-btn--primary" onClick={onApprove}>
          Approve
        </button>
      </footer>
    </section>
  </div>
);

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

  const selectedSuggestion = selectedId
    ? getEmployeeSuggestionById(selectedId)
    : undefined;

  const approve = (suggestionId: string) => {
    approveEmployeeSuggestion(suggestionId);
    setSelectedId(null);
    refresh();
  };

  return (
    <section className="amp-canvas amp-employee-suggestions">
      <div className="amp-employee-suggestions__header">
        <div>
          <h2>Employee suggested posts</h2>
          <p>Review ideas submitted by employees before they become shareable content.</p>
        </div>
      </div>

      <div className="cs-table-wrap amp-employee-suggestions__table">
        <table className="cs-table">
          <colgroup>
            <col className="cs-col-name" />
            <col className="cs-col-status" />
            <col className="cs-col-date" />
            <col className="cs-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Post name</th>
              <th>Status</th>
              <th>Submitted</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {!suggestions.length ? (
              <tr className="cs-table-empty-row">
                <td colSpan={4}>
                  <div className="cs-table-empty-state">
                    <h3>No pending suggestions</h3>
                    <p>Employee post ideas awaiting approval will appear here.</p>
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
                    <span className="amp-status amp-status--pending">Pending approval</span>
                  </td>
                  <td>{formatDate(suggestion.submittedAt)}</td>
                  <td>
                    <div className="amp-employee-suggestions__actions">
                      <button
                        type="button"
                        className="cs-btn cs-btn--secondary-ghost amp-employee-suggestions__action"
                        onClick={() => setSelectedId(suggestion.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="cs-btn cs-btn--primary amp-employee-suggestions__action"
                        onClick={() => approve(suggestion.id)}
                      >
                        Approve
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
          onClose={() => setSelectedId(null)}
          onApprove={() => approve(selectedSuggestion.id)}
        />
      )}
    </section>
  );
};
