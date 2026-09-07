import React, { useEffect, useState } from "react";
import downloadIcon from "../../../assets/svg/download.svg";
import editIcon from "../../../assets/svg/edit.svg";
import infoIcon from "../../../assets/svg/info.svg";
import trashIcon from "../../../assets/svg/trash-can.svg";
import { UiDropdown } from "../UiDropdown";
import { VideoSubmission } from "./amplifyTypes";

const LOCATION_OPTIONS = [
  { value: "", label: "Enter Location..." },
  { value: "durham-nc", label: "Durham, NC" },
  { value: "raleigh-nc", label: "Raleigh, NC" },
  { value: "chapel-hill-nc", label: "Chapel Hill, NC" },
  { value: "remote", label: "Remote" },
];

interface VideoReviewModalProps {
  submission: VideoSubmission;
  onClose: () => void;
  onSave: (submission: VideoSubmission) => void;
  onApprove: (submission: VideoSubmission) => void;
  onReject: (submission: VideoSubmission) => void;
  onDelete: (submissionId: string) => void;
}

export const VideoReviewModal: React.FC<VideoReviewModalProps> = ({
  submission,
  onClose,
  onSave,
  onApprove,
  onReject,
  onDelete,
}) => {
  const [draft, setDraft] = useState(submission);
  const [tagInput, setTagInput] = useState("");
  const isPending = draft.status === "pending";

  useEffect(() => {
    setDraft(submission);
    setTagInput("");
  }, [submission]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag || draft.tags.includes(nextTag)) return;
    setDraft((current) => {
      const next = { ...current, tags: [...current.tags, nextTag] };
      onSave(next);
      return next;
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setDraft((current) => {
      const next = { ...current, tags: current.tags.filter((item) => item !== tag) };
      onSave(next);
      return next;
    });
  };

  const handleFieldBlur = () => {
    onSave(draft);
  };

  const locationValue =
    LOCATION_OPTIONS.find((option) => option.label === draft.location)?.value ||
    LOCATION_OPTIONS.find((option) => option.value === draft.location)?.value ||
    "";

  return (
    <div className="cs-modal-backdrop amp-video-review-modal__backdrop" role="dialog" aria-modal="true">
      <div className="cs-modal cs-modal--lg amp-video-review-modal">
        <div className="cs-modal__header">
          <h2>Approve or Reject Video</h2>
          <button type="button" className="cs-icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cs-modal__body amp-video-review-modal__body">
          <div className="amp-video-review-modal__layout">
            <div className="amp-video-review-modal__fields">
              <div className="cs-field">
                <label htmlFor="amp-video-review-name">Name</label>
                <input
                  id="amp-video-review-name"
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="cs-field">
                <label htmlFor="amp-video-review-email">Email</label>
                <input
                  id="amp-video-review-email"
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="cs-field">
                <label htmlFor="amp-video-review-title">Job Title</label>
                <input
                  id="amp-video-review-title"
                  type="text"
                  value={draft.jobTitle}
                  onChange={(event) => setDraft((current) => ({ ...current, jobTitle: event.target.value }))}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="cs-field">
                <label htmlFor="amp-video-review-location">Location</label>
                <UiDropdown
                  value={locationValue}
                  options={LOCATION_OPTIONS}
                  placeholder="Enter Location..."
                  ariaLabel="Location"
                  onChange={(value) => {
                    const label = LOCATION_OPTIONS.find((option) => option.value === value)?.label || "";
                    const next = {
                      ...draft,
                      location: value ? label : "",
                    };
                    setDraft(next);
                    onSave(next);
                  }}
                />
              </div>

              <div className="cs-field">
                <label htmlFor="amp-video-review-tags">Tags</label>
                <p className="cs-field-help">Tagging your content can make it easier to sort and search</p>
                <div className="amp-video-request__tag-input">
                  <input
                    id="amp-video-review-tags"
                    type="text"
                    value={tagInput}
                    placeholder="Add tag"
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                    +Add
                  </button>
                </div>
                {draft.tags.length > 0 && (
                  <div className="amp-video-request__tags" aria-label="Added tags">
                    {draft.tags.map((tag) => (
                      <span key={tag}>
                        {tag}
                        <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="amp-video-review-modal__preview">
              <div className="amp-video-review-modal__preview-actions">
                <button type="button" className="cs-icon-button" aria-label="Edit video details">
                  <img src={editIcon} alt="" width={16} height={16} />
                </button>
                <button type="button" className="cs-icon-button" aria-label="Download video">
                  <img src={downloadIcon} alt="" width={16} height={16} />
                </button>
              </div>

              <div className="amp-video-review-modal__player">
                <video src={draft.videoUrl} poster={draft.thumbnailUrl} controls playsInline preload="metadata" />
              </div>

              <div className="amp-video-review-modal__notice" role="note">
                <img src={infoIcon} alt="" width={16} height={16} />
                <p>
                  Verify details before approving. Once approved, videos will be loaded to the asset library and content
                  hub where they can be edited or added to your site.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="cs-modal__footer amp-video-review-modal__footer">
          <button
            type="button"
            className="cs-btn cs-btn--secondary-ghost amp-video-review-modal__delete"
            onClick={() => onDelete(draft.id)}
          >
            <img src={trashIcon} alt="" width={16} height={16} />
            Delete Video
          </button>
          <div className="amp-video-review-modal__footer-actions">
            {isPending ? (
              <>
                <button type="button" className="cs-btn cs-btn--secondary" onClick={() => onReject(draft)}>
                  Reject
                </button>
                <button type="button" className="cs-btn cs-btn--primary" onClick={() => onApprove(draft)}>
                  Approve
                </button>
              </>
            ) : (
              <button type="button" className="cs-btn cs-btn--secondary" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
