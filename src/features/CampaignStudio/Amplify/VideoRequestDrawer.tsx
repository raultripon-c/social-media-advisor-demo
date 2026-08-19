import React, { useEffect, useMemo, useState } from "react";
import paperPlaneIcon from "../../../assets/svg/paper-plane-16.svg";
import marcusThumb from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import { UiMultiSelect } from "../UiMultiSelect";
import { audienceEmployeeOptions, audienceSegmentOptions } from "./amplifyData";
import { getCampaignCreatorName } from "../campaignStudioData";
import { SharePack } from "./amplifyTypes";

interface VideoRequestDrawerProps {
  open: boolean;
  onClose: () => void;
  onSend: (pack: SharePack) => void;
}

const ALL_EMPLOYEES_VALUE = "all";

const TOPIC_SUGGESTIONS = [
  "Why you joined",
  "A day in your role",
  "Team culture",
  "Career growth tip",
];

const audienceEmailOptions = audienceEmployeeOptions.map((person) => ({
  value: person.email,
  label: person.name,
  description: person.email,
}));

const audienceSegmentSelectOptions = audienceSegmentOptions.map(({ value, label }) => ({
  value,
  label,
}));

const formatDeadline = (value: string) => {
  if (!value) return "When you can";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const VideoRequestDrawer: React.FC<VideoRequestDrawerProps> = ({ open, onClose, onSend }) => {
  const [topic, setTopic] = useState("");
  const [deadline, setDeadline] = useState("");
  const [audiences, setAudiences] = useState<string[]>([ALL_EMPLOYEES_VALUE]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setTopic("");
    setDeadline("");
    setAudiences([ALL_EMPLOYEES_VALUE]);
    setSelectedEmails([]);
  }, [open]);

  const isAllEmployeesSelected = audiences.includes(ALL_EMPLOYEES_VALUE);
  const selectedAudienceOptions = audienceSegmentOptions.filter((option) => audiences.includes(option.value));
  const segmentRecipientCount = isAllEmployeesSelected
    ? audienceSegmentOptions.find((option) => option.value === ALL_EMPLOYEES_VALUE)?.count || 0
    : selectedAudienceOptions.reduce((total, option) => total + option.count, 0);
  const audienceCount = segmentRecipientCount + (isAllEmployeesSelected ? 0 : selectedEmails.length);

  const audienceLabel = useMemo(() => {
    const segmentLabel =
      selectedAudienceOptions.map((option) => option.label).join(", ") || "No segment";
    if (isAllEmployeesSelected) return segmentLabel;
    if (selectedEmails.length === 0) return segmentLabel;
    return `${segmentLabel} + ${selectedEmails.length} by email`;
  }, [isAllEmployeesSelected, selectedAudienceOptions, selectedEmails.length]);

  const segmentSelectOptions = audienceSegmentSelectOptions.map((option) => ({
    ...option,
    disabled: isAllEmployeesSelected && option.value !== ALL_EMPLOYEES_VALUE,
  }));

  const trimmedTopic = topic.trim();
  const canSend = trimmedTopic.length > 0 && audiences.length > 0 && audienceCount > 0;

  const handleAudienceChange = (nextValues: string[]) => {
    const wasAllSelected = audiences.includes(ALL_EMPLOYEES_VALUE);
    const selectingAll = nextValues.includes(ALL_EMPLOYEES_VALUE) && !wasAllSelected;

    if (selectingAll || nextValues.includes(ALL_EMPLOYEES_VALUE)) {
      setAudiences([ALL_EMPLOYEES_VALUE]);
      setSelectedEmails([]);
      return;
    }
    setAudiences(nextValues);
  };

  const handleSend = () => {
    if (!canSend) return;
    const now = new Date().toISOString();
    const slug = trimmedTopic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);
    const pack: SharePack = {
      id: `video-req-${Date.now()}`,
      title: `Video request — ${trimmedTopic}`,
      subtitle: deadline
        ? `Due ${formatDeadline(deadline)} · ${audienceCount} recipients`
        : `Open deadline · ${audienceCount} recipients`,
      status: "sent",
      source: "Manual",
      sourceLabel: "Video request",
      audienceLabel,
      audienceCount,
      channels: ["email"],
      thumbnailUrl: marcusThumb,
      mediaType: "video",
      ctaLabel: "Record your video",
      ctaDestination: "https://careers.dukehealth.org/video-request",
      utmPreview: `utm_source=employee_advocacy&utm_medium=email&utm_campaign=video-request-${slug || "custom"}&utm_content={empId}`,
      captions: [
        {
          id: "video-req-cap-1",
          text: `Got 60 seconds? Record a quick video about ${trimmedTopic}.`,
        },
      ],
      createdAt: now,
      createdByName: getCampaignCreatorName(),
      sentAt: now,
    };
    onSend(pack);
  };

  if (!open) return null;

  return (
    <>
      <button type="button" className="amp-drawer-backdrop" aria-label="Close drawer" onClick={onClose} />
      <aside
        className="amp-drawer amp-drawer--video-request"
        role="dialog"
        aria-modal="true"
        aria-labelledby="amp-video-request-title"
      >
        <header className="amp-drawer__header">
          <div>
            <h2 id="amp-video-request-title">Request a video</h2>
            <p className="amp-drawer__subtitle">Ask employees to record a short clip in one step.</p>
          </div>
          <button type="button" className="amp-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="amp-drawer__body">
          <section>
            <label className="amp-field amp-field--compact">
              Topic <span className="cs-required" aria-hidden="true">*</span>
              <textarea
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                rows={3}
                placeholder="e.g. Why you joined Duke Health and what keeps you here"
              />
            </label>
            <div className="amp-video-request__chips" role="group" aria-label="Topic suggestions">
              {TOPIC_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`amp-video-request__chip${topic === suggestion ? " is-selected" : ""}`}
                  onClick={() => setTopic(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="amp-field amp-field--compact">
              Deadline <span className="amp-optional">(optional)</span>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </label>
          </section>

          <section>
            <div className="amp-audience">
              <p className="amp-audience__title" id="amp-video-audience-label">
                Who <span className="cs-required" aria-hidden="true">*</span>
              </p>
              <div className="amp-audience__panel" role="group" aria-labelledby="amp-video-audience-label">
                <label className="amp-field amp-field--compact amp-audience__segment">
                  Audience segment
                  <UiMultiSelect
                    values={audiences}
                    options={segmentSelectOptions}
                    onChange={handleAudienceChange}
                    placeholder="Select segments"
                    searchPlaceholder="Search"
                    ariaLabel="Audience segment"
                    maxVisibleChips={2}
                  />
                </label>
                <div className="amp-audience__emails">
                  <label className="amp-field amp-field--compact amp-audience__email-field">
                    Also include people by email
                    <UiMultiSelect
                      values={selectedEmails}
                      options={audienceEmailOptions}
                      onChange={setSelectedEmails}
                      placeholder="Select people"
                      searchPlaceholder="Search"
                      ariaLabel="Also include people by email"
                      maxVisibleChips={2}
                      disabled={isAllEmployeesSelected}
                    />
                  </label>
                  {isAllEmployeesSelected && (
                    <span className="amp-help amp-help--inline">
                      Individual emails are unavailable while All employees is selected.
                    </span>
                  )}
                </div>
                <span className="amp-help amp-help--inline">Estimated recipients: {audienceCount}</span>
              </div>
            </div>
          </section>
        </div>

        <footer className="amp-drawer__footer">
          <button type="button" className="cs-btn cs-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="cs-btn cs-btn--primary amp-dispatch__send"
            disabled={!canSend}
            onClick={handleSend}
          >
            Send request
            <img src={paperPlaneIcon} alt="" width={16} height={16} />
          </button>
        </footer>
      </aside>
    </>
  );
};
