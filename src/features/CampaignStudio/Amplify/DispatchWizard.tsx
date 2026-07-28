import React, { useMemo, useState } from "react";
import atlEngineeringThumb from "../../../assets/campaign-studio/amplify/amp-pack-atl-engineering.jpg";
import banIcon from "../../../assets/svg/ban-16.svg";
import checkWizardIcon from "../../../assets/svg/check-wizard.svg";
import closeIcon from "../../../assets/svg/cross.svg";
import floppyDiskIcon from "../../../assets/svg/floppy-disk-16.svg";
import paperPlaneIcon from "../../../assets/svg/paper-plane-16.svg";
import penIcon from "../../../assets/svg/pen-16.svg";
import { UiDropdown } from "../UiDropdown";
import {
  audienceSegmentOptions,
  channelOptions,
  ctaDestinationOptions,
  dispatchCaptionPool,
  dispatchTemplates,
} from "./amplifyData";
import { AmplifyChannel, ShareCaption, SharePack } from "./amplifyTypes";

interface DispatchWizardProps {
  onCancel: () => void;
  onSend: (pack: SharePack) => void;
  onSaveDraft: (pack: SharePack) => void;
}

const STEPS = ["Template", "Content", "Audience", "Send"] as const;

export const DispatchWizard: React.FC<DispatchWizardProps> = ({ onCancel, onSend, onSaveDraft }) => {
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [templateId, setTemplateId] = useState(dispatchTemplates[0].id);
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>(
    dispatchCaptionPool.slice(0, 5).map((caption) => caption.id),
  );
  const [ctaDestination, setCtaDestination] = useState(ctaDestinationOptions[0].value);
  const [audience, setAudience] = useState(audienceSegmentOptions[0].value);
  const [channels, setChannels] = useState<AmplifyChannel[]>(["email", "slack"]);
  const [note, setNote] = useState("");
  const [customCaptions, setCustomCaptions] = useState<ShareCaption[]>([]);
  const [customCaptionDraft, setCustomCaptionDraft] = useState("");

  const template = dispatchTemplates.find((item) => item.id === templateId) || dispatchTemplates[0];
  const ctaLabel = ctaDestinationOptions.find((item) => item.value === ctaDestination)?.label || "Open roles";
  const audienceOption = audienceSegmentOptions.find((item) => item.value === audience) || audienceSegmentOptions[0];
  const utmPreview = `utm_source=amplify&utm_medium={channel}&utm_campaign=${templateId}&utm_content={empId}`;

  const captionOptions = useMemo(
    () => [...dispatchCaptionPool, ...customCaptions],
    [customCaptions],
  );

  const selectedCaptionTexts = useMemo(
    () => captionOptions.filter((caption) => selectedCaptions.includes(caption.id)),
    [captionOptions, selectedCaptions],
  );

  const toggleCaption = (id: string) => {
    setSelectedCaptions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const addCustomCaption = () => {
    const text = customCaptionDraft.trim();
    if (!text) return;
    const id = `custom-cap-${Date.now()}`;
    setCustomCaptions((current) => [...current, { id, text }]);
    setSelectedCaptions((current) => [...current, id]);
    setCustomCaptionDraft("");
  };

  const toggleChannel = (channel: AmplifyChannel) => {
    setChannels((current) =>
      current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel],
    );
  };

  const canContinue =
    step === 0 ||
    (step === 1 && selectedCaptions.length >= 5 && !!ctaDestination) ||
    (step === 2 && channels.length > 0) ||
    step === 3;

  const buildPack = (status: "sent" | "draft"): SharePack => {
    const now = new Date().toISOString();
    return {
      id: `pack-dispatch-${Date.now()}`,
      title: template.title,
      subtitle: note.trim() || template.description,
      status,
      source: "Pull·template",
      sourceLabel: template.title,
      audienceLabel: audienceOption.label,
      audienceCount: audienceOption.count,
      channels,
      thumbnailUrl: atlEngineeringThumb,
      mediaType: "image",
      ctaLabel,
      ctaDestination,
      utmPreview,
      captions: selectedCaptionTexts.length
        ? selectedCaptionTexts
        : dispatchCaptionPool.slice(0, 5),
      metrics: status === "sent" ? { shares: 0, clicks: 0, applications: 0, emvUsd: 0 } : undefined,
      createdAt: now,
      sentAt: status === "sent" ? now : undefined,
    };
  };

  const handleSend = () => onSend(buildPack("sent"));

  const handleSaveDraft = () => {
    onSaveDraft(buildPack("draft"));
    setConfirmOpen(false);
  };

  const handleDiscard = () => {
    setConfirmOpen(false);
    onCancel();
  };

  return (
    <div className="amp-dispatch">
      <div className="amp-dispatch__steps" role="list" aria-label="Dispatch steps">
        {STEPS.map((label, index) => {
          const isActive = index === step;
          const isDone = index < step;
          return (
            <React.Fragment key={label}>
              <div
                role="listitem"
                className={`amp-dispatch__step${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="amp-dispatch__step-marker" aria-hidden="true">
                  {isDone ? <img src={checkWizardIcon} alt="" width={14} height={10} /> : index + 1}
                </span>
                <span className="amp-dispatch__step-title">{label}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="amp-dispatch__step-sep" aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {step === 0 && (
        <div className="amp-template-grid">
          {dispatchTemplates.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`amp-template-card${templateId === item.id ? " is-selected" : ""}`}
              onClick={() => setTemplateId(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <em>{item.audienceHint}</em>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="amp-dispatch__content">
          <div className="amp-dispatch__media">
            <img src={atlEngineeringThumb} alt="" />
            <div className="amp-share-preview">
              <p className="amp-share-preview__eyebrow">Share card preview</p>
              <strong>Duke Health</strong>
              <p>{selectedCaptionTexts[0]?.text || "Select captions to preview."}</p>
              <a href={ctaDestination} target="_blank" rel="noreferrer">
                {ctaLabel}
              </a>
            </div>
          </div>
          <div className="amp-dispatch__fields">
            <h3>Caption variants</h3>
            <p className="amp-help">Select at least 5 captions employees can choose from.</p>
            <ul className="amp-caption-picker">
              {captionOptions.map((caption) => (
                <li key={caption.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCaptions.includes(caption.id)}
                      onChange={() => toggleCaption(caption.id)}
                    />
                    <span>{caption.text}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="amp-caption-add">
              <label className="amp-field amp-caption-add__field" htmlFor="amp-custom-caption">
                Add a custom caption
                <textarea
                  id="amp-custom-caption"
                  rows={2}
                  value={customCaptionDraft}
                  onChange={(event) => setCustomCaptionDraft(event.target.value)}
                  placeholder="Write a caption employees can share…"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      addCustomCaption();
                    }
                  }}
                />
              </label>
              <button
                type="button"
                className="cs-btn cs-btn--secondary amp-caption-add__btn"
                onClick={addCustomCaption}
                disabled={!customCaptionDraft.trim()}
              >
                Add caption
              </button>
            </div>
            <label className="amp-field">
              Hiring CTA destination
              <UiDropdown
                size="sm"
                value={ctaDestination}
                options={ctaDestinationOptions}
                ariaLabel="Hiring CTA destination"
                onChange={setCtaDestination}
              />
            </label>
            <p className="amp-drawer__utm">
              UTM preview: <code>{utmPreview}</code>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="amp-dispatch__audience">
          <label className="amp-field amp-field--compact">
            Audience segment
            <UiDropdown
              size="sm"
              value={audience}
              options={audienceSegmentOptions.map(({ value, label }) => ({ value, label }))}
              ariaLabel="Audience segment"
              onChange={setAudience}
            />
            <span className="amp-help amp-help--inline">Estimated recipients: {audienceOption.count}</span>
          </label>
          <div className="amp-channel-group">
            <p className="amp-channel-group__title" id="amp-channels-label">
              Channels
            </p>
            <div className="amp-channel-fieldset" role="group" aria-labelledby="amp-channels-label">
              {channelOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    checked={channels.includes(option.value)}
                    onChange={() => toggleChannel(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <label className="amp-field">
            Optional note
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for employees before they share…"
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="amp-dispatch__review">
          <h3>Review & send</h3>
          <dl className="amp-review-list">
            <div>
              <dt>Template</dt>
              <dd>{template.title}</dd>
            </div>
            <div>
              <dt>Captions</dt>
              <dd>{selectedCaptions.length} variants</dd>
            </div>
            <div>
              <dt>CTA</dt>
              <dd>{ctaLabel}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>
                {audienceOption.label} ({audienceOption.count})
              </dd>
            </div>
            <div>
              <dt>Channels</dt>
              <dd>
                {channels.map((channel) => channelOptions.find((item) => item.value === channel)?.label).join(", ")}
              </dd>
            </div>
            {note.trim() && (
              <div>
                <dt>Note</dt>
                <dd>{note}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <footer className="amp-dispatch__footer">
        <button
          type="button"
          className="cs-btn cs-btn--secondary amp-dispatch__cancel"
          onClick={() => (step === 0 ? onCancel() : setConfirmOpen(true))}
        >
          <img src={banIcon} alt="" width={16} height={16} />
          Cancel
        </button>
        <div className="amp-dispatch__footer-actions">
          {step > 0 && (
            <button
              type="button"
              className="cs-btn cs-btn--secondary"
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="cs-btn cs-btn--primary"
              disabled={!canContinue}
              onClick={() => setStep((current) => current + 1)}
            >
              Continue
            </button>
          ) : (
            <button type="button" className="cs-btn cs-btn--primary amp-dispatch__send" onClick={handleSend}>
              Send now
              <img src={paperPlaneIcon} alt="" width={16} height={16} />
            </button>
          )}
        </div>
      </footer>

      {confirmOpen && (
        <div
          className="amp-confirm-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmOpen(false);
          }}
        >
          <div
            className="amp-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amp-cancel-title"
          >
            <header className="amp-confirm__header">
              <h2 id="amp-cancel-title">Leave pack creation?</h2>
              <button
                type="button"
                className="amp-confirm__close"
                onClick={() => setConfirmOpen(false)}
                aria-label="Close"
              >
                <img src={closeIcon} alt="" width={12} height={12} />
              </button>
            </header>
            <div className="amp-confirm__body">
              <p>
                Are you sure you want to cancel? You can save a draft of your progress and finish later, or leave
                without saving.
              </p>
            </div>
            <footer className="amp-confirm__footer">
              <button type="button" className="cs-btn cs-btn--secondary amp-confirm__discard" onClick={handleDiscard}>
                <img src={banIcon} alt="" width={16} height={16} />
                Cancel
              </button>
              <div className="amp-confirm__footer-actions">
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary amp-confirm__keep"
                  onClick={() => setConfirmOpen(false)}
                >
                  <img src={penIcon} alt="" width={16} height={16} />
                  Keep editing
                </button>
                <button type="button" className="cs-btn cs-btn--primary amp-confirm__save" onClick={handleSaveDraft}>
                  <img src={floppyDiskIcon} alt="" width={16} height={16} />
                  Save draft
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
