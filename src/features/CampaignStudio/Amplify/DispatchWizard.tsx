import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import enhanceIcon from "../../../assets/svg/enhanceIcon.svg";
import generateIcon from "../../../assets/svg/arrow-up-plain.svg";
import checkWizardIcon from "../../../assets/svg/check-wizard.svg";
import closeIcon from "../../../assets/svg/cross.svg";
import paperPlaneIcon from "../../../assets/svg/paper-plane-16.svg";
import { UiDropdown } from "../UiDropdown";
import { UiMultiSelect } from "../UiMultiSelect";
import {
  audienceEmployeeOptions,
  audienceSegmentOptions,
  cmsDestinationPages,
  createSharePackDraftFromBrief,
  ctaEventOptions,
  ctaJobOptions,
  ctaLocaleOptions,
  ctaPersonaOptions,
  dispatchCaptionPool,
  dispatchTemplates,
  packAssetOptions,
  resolveCtaDestinationMatch,
} from "./amplifyData";
import { AmplifyCampaignSeed, DispatchTemplate, ShareCaption, SharePack } from "./amplifyTypes";

const templatePrompt = (item: DispatchTemplate) =>
  `Create an employee share pack for ${item.title}. ${item.description} Focus on ${item.audienceHint.toLowerCase()}.`;

interface DispatchWizardProps {
  onCancel: () => void;
  onSend: (pack: SharePack) => void;
  onSaveDraft: (pack: SharePack) => void;
  campaignSeed?: AmplifyCampaignSeed | null;
}

type PackAssetOption = (typeof packAssetOptions)[number] | {
  id: string;
  label: string;
  src: string;
  kind: "image" | "video";
  meta: string;
};

const STEPS = ["Template", "Content", "Preview & Save"] as const;
const CTA_TYPE_OPTIONS = [
  { value: "page", label: "Page" },
  { value: "job", label: "Job" },
  { value: "event", label: "Event" },
] as const;

type CtaDestinationType = (typeof CTA_TYPE_OPTIONS)[number]["value"];

const ALL_EMPLOYEES_VALUE = "all";

const audienceEmailOptions = audienceEmployeeOptions.map((person) => ({
  value: person.email,
  label: person.name,
  description: person.email,
}));

const audienceSegmentSelectOptions = audienceSegmentOptions.map(({ value, label }) => ({
  value,
  label,
}));

const resolveInitialCtaType = (destination: string): CtaDestinationType => {
  if (ctaJobOptions.some((option) => option.value === destination)) return "job";
  if (ctaEventOptions.some((option) => option.value === destination)) return "event";
  return "page";
};

export const DispatchWizard: React.FC<DispatchWizardProps> = ({
  onCancel,
  onSend,
  onSaveDraft,
  campaignSeed = null,
}) => {
  const seedCaptionId = campaignSeed?.copy ? `campaign-cap-${campaignSeed.campaignId}` : null;
  const uploadAssetInputRef = useRef<HTMLInputElement>(null);
  const resolvedInitialCtaDestination = campaignSeed?.ctaDestination || cmsDestinationPages[1].value;
  const initialCtaMatch = resolveCtaDestinationMatch(resolvedInitialCtaDestination);
  const initialCtaDestinationType = resolveInitialCtaType(resolvedInitialCtaDestination);
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetLibrary, setAssetLibrary] = useState<PackAssetOption[]>(() => [...packAssetOptions]);
  const [selectedAssetId, setSelectedAssetId] = useState(packAssetOptions[0].id);
  const [assetSearch, setAssetSearch] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(() =>
    campaignSeed ? `Create an employee share pack from the campaign "${campaignSeed.name}".` : "",
  );
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [packTitle, setPackTitle] = useState("");
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>(() => {
    const base = dispatchCaptionPool.slice(0, 5).map((caption) => caption.id);
    return seedCaptionId ? [...base.slice(0, 4), seedCaptionId] : base;
  });
  const [ctaDestinationType, setCtaDestinationType] = useState<CtaDestinationType>(initialCtaDestinationType);
  const [selectedCtaLocale, setSelectedCtaLocale] = useState(ctaLocaleOptions[0].value);
  const [selectedCtaPersona, setSelectedCtaPersona] = useState(ctaPersonaOptions[0].value);
  const [selectedCtaPageValue, setSelectedCtaPageValue] = useState(initialCtaMatch.value);
  const [selectedCtaJob, setSelectedCtaJob] = useState(
    ctaJobOptions.some((option) => option.value === resolvedInitialCtaDestination)
      ? resolvedInitialCtaDestination
      : ctaJobOptions[0].value,
  );
  const [selectedCtaEvent, setSelectedCtaEvent] = useState(
    ctaEventOptions.some((option) => option.value === resolvedInitialCtaDestination)
      ? resolvedInitialCtaDestination
      : ctaEventOptions[0].value,
  );
  const [audiences, setAudiences] = useState<string[]>([ALL_EMPLOYEES_VALUE]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [note, setNote] = useState(() =>
    campaignSeed ? `Share pack for campaign: ${campaignSeed.name}` : "",
  );
  const [customCaptions, setCustomCaptions] = useState<ShareCaption[]>(() =>
    campaignSeed?.copy && seedCaptionId
      ? [{ id: seedCaptionId, text: campaignSeed.copy }]
      : [],
  );
  const [customCaptionDraft, setCustomCaptionDraft] = useState("");
  const [mediaUrl, setMediaUrl] = useState(packAssetOptions[0].src);
  const [mediaType, setMediaType] = useState<"image" | "video">(packAssetOptions[0].kind);
  const [mediaName, setMediaName] = useState(packAssetOptions[0].label);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const objectUrlsRef = useRef<string[]>([]);
  objectUrlsRef.current = objectUrls;

  const filteredAssets = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();
    if (!query) return assetLibrary;
    return assetLibrary.filter(
      (asset) =>
        asset.label.toLowerCase().includes(query) ||
        asset.meta.toLowerCase().includes(query) ||
        asset.kind.toLowerCase().includes(query),
    );
  }, [assetLibrary, assetSearch]);

  const selectedModalAsset =
    assetLibrary.find((asset) => asset.id === selectedAssetId) || assetLibrary[0] || packAssetOptions[0];

  const selectedTemplate = dispatchTemplates.find((item) => item.id === templateId) || null;
  const template = selectedTemplate || dispatchTemplates[0];
  const promptTitle = packTitle || prompt.trim().split(/\n/)[0]?.slice(0, 80) || "Custom share pack";
  const isAllEmployeesSelected = audiences.includes(ALL_EMPLOYEES_VALUE);
  const selectedAudienceOptions = audienceSegmentOptions.filter((option) => audiences.includes(option.value));
  const segmentRecipientCount = isAllEmployeesSelected
    ? audienceSegmentOptions.find((option) => option.value === ALL_EMPLOYEES_VALUE)?.count || 0
    : selectedAudienceOptions.reduce((total, option) => total + option.count, 0);
  const audienceLabel = (() => {
    const segmentLabel =
      selectedAudienceOptions.length === 0
        ? "No segment"
        : selectedAudienceOptions.length === 1
          ? selectedAudienceOptions[0].label
          : `${selectedAudienceOptions.length} segments`;
    if (isAllEmployeesSelected || !selectedEmails.length) return segmentLabel;
    return `${segmentLabel} + ${selectedEmails.length} by email`;
  })();
  const audienceCount = segmentRecipientCount + (isAllEmployeesSelected ? 0 : selectedEmails.length);
  const segmentSelectOptions = audienceSegmentSelectOptions.map((option) => ({
    ...option,
    disabled: isAllEmployeesSelected && option.value !== ALL_EMPLOYEES_VALUE,
  }));
  const utmPreview = `utm_source=amplify&utm_medium={channel}&utm_campaign=${templateId || "custom"}&utm_content={empId}`;
  const selectedCtaPage =
    cmsDestinationPages.find((page) => page.value === selectedCtaPageValue) || cmsDestinationPages[1];
  const selectedCtaJobOption =
    ctaJobOptions.find((option) => option.value === selectedCtaJob) || ctaJobOptions[0];
  const selectedCtaEventOption =
    ctaEventOptions.find((option) => option.value === selectedCtaEvent) || ctaEventOptions[0];
  const resolvedCtaDestination =
    ctaDestinationType === "job"
      ? selectedCtaJob
      : ctaDestinationType === "event"
        ? selectedCtaEvent
        : selectedCtaPage.value;
  const resolvedCtaLabel =
    ctaDestinationType === "job"
      ? selectedCtaJobOption.label
      : ctaDestinationType === "event"
        ? selectedCtaEventOption.label
        : selectedCtaPage.label;

  const captionOptions = useMemo(() => {
    const customIds = new Set(customCaptions.map((caption) => caption.id));
    const pool = dispatchCaptionPool.filter((caption) => !customIds.has(caption.id));
    return [...customCaptions, ...pool];
  }, [customCaptions]);

  const selectedCaptionTexts = useMemo(
    () => captionOptions.filter((caption) => selectedCaptions.includes(caption.id)),
    [captionOptions, selectedCaptions],
  );

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const toggleCaption = (id: string) => {
    setSelectedCaptions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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

  const addCustomCaption = () => {
    const text = customCaptionDraft.trim();
    if (!text) return;
    const id = `custom-cap-${Date.now()}`;
    setCustomCaptions((current) => [...current, { id, text }]);
    setSelectedCaptions((current) => [...current, id]);
    setCustomCaptionDraft("");
  };

  const openAssetModal = () => {
    const current = assetLibrary.find((asset) => asset.src === mediaUrl);
    setSelectedAssetId(current?.id || assetLibrary[0]?.id || packAssetOptions[0].id);
    setAssetSearch("");
    setShowAssetModal(true);
  };

  const confirmAssetReplacement = () => {
    if (!selectedModalAsset) return;
    setMediaUrl(selectedModalAsset.src);
    setMediaType(selectedModalAsset.kind);
    setMediaName(selectedModalAsset.label);
    setShowAssetModal(false);
  };

  const handleAssetLibraryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      event.target.value = "";
      return;
    }
    const nextType = file.type.startsWith("video/") ? "video" : "image";
    const nextUrl = URL.createObjectURL(file);
    const nextAsset: PackAssetOption = {
      id: `asset-upload-${Date.now()}`,
      label: file.name.replace(/\.[^.]+$/, "") || file.name,
      src: nextUrl,
      kind: nextType,
      meta: nextType === "video" ? "Uploaded · Video hub" : "Uploaded · Asset manager",
    };
    setObjectUrls((current) => [...current, nextUrl]);
    setAssetLibrary((current) => [nextAsset, ...current]);
    setSelectedAssetId(nextAsset.id);
    event.target.value = "";
  };

  const canContinueStep0 = Boolean(prompt.trim()) || templateId !== null || Boolean(campaignSeed);
  const canContinue =
    (step === 0 && canContinueStep0) ||
    (step === 1 && selectedCaptions.length >= 5 && !!resolvedCtaDestination && audiences.length > 0) ||
    step === 2;

  const advanceFromTemplateStep = () => {
    if (!canContinueStep0) return;

    const brief = prompt.trim();
    if (brief) {
      const draft = createSharePackDraftFromBrief(brief, templateId);
      const asset =
        assetLibrary.find((item) => item.id === draft.assetId) ||
        packAssetOptions.find((item) => item.id === draft.assetId) ||
        packAssetOptions[0];

      setTemplateId(draft.templateId);
      setPackTitle(draft.title);
      setNote(draft.note);
      setAudiences(draft.audiences);
      setSelectedEmails([]);
      setCustomCaptions(draft.captions);
      setSelectedCaptions(draft.selectedCaptionIds);
      setCtaDestinationType(draft.ctaDestinationType);
      setSelectedCtaPageValue(draft.ctaPageValue);
      setSelectedCtaJob(draft.ctaJobValue);
      setSelectedCtaEvent(draft.ctaEventValue);
      setSelectedCtaPersona(draft.ctaPersona);
      setSelectedAssetId(asset.id);
      setMediaUrl(asset.src);
      setMediaType(asset.kind);
      setMediaName(asset.label);
    } else if (campaignSeed?.copy && seedCaptionId) {
      setNote((current) => current || `Share pack for campaign: ${campaignSeed.name}`);
    }

    setStep(1);
  };

  const selectTemplate = (item: DispatchTemplate) => {
    setTemplateId(item.id);
    setPrompt(templatePrompt(item));
  };

  const buildPack = (status: "sent" | "draft"): SharePack => {
    const now = new Date().toISOString();
    return {
      id: `pack-dispatch-${Date.now()}`,
      title: campaignSeed?.name || packTitle || (selectedTemplate ? template.title : promptTitle),
      subtitle: note.trim() || selectedTemplate?.description || prompt.trim() || template.description,
      status,
      source: campaignSeed ? "Campaign" : selectedTemplate ? "Pull·template" : "Manual",
      sourceLabel: campaignSeed?.name || selectedTemplate?.title || promptTitle,
      audienceLabel,
      audienceCount,
      channels: ["email"],
      thumbnailUrl: mediaUrl,
      mediaType,
      ctaLabel: resolvedCtaLabel,
      ctaDestination: resolvedCtaDestination,
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

      {campaignSeed && (
        <p className="amp-dispatch__seed" role="status">
          Creating a share pack from <strong>{campaignSeed.name}</strong>
        </p>
      )}

      {step === 0 && (
        <section className="amp-prompt-step">
          <h2 className="amp-prompt-step__title">Generate share pack</h2>
          <div className="cs-prompt-box">
            {!prompt.trim() && !isPromptFocused && (
              <p className="cs-prompt-tip">
                Tip: Describe who should share, the story or roles to amplify, the destination link, and the tone you want
                employees to use.
              </p>
            )}
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onFocus={() => setIsPromptFocused(true)}
              onBlur={() => setIsPromptFocused(false)}
              placeholder=""
              aria-label="Describe the share pack you need"
            />
            <div className="cs-prompt-actions">
              <button type="button" className="cs-enhance" disabled={!prompt.trim()}>
                <img src={enhanceIcon} alt="" /> Enhance with X+
              </button>
              <button
                type="button"
                className="cs-generate-icon"
                disabled={!prompt.trim()}
                aria-label="Continue with this brief"
                onClick={advanceFromTemplateStep}
              >
                <img src={generateIcon} alt="" />
              </button>
            </div>
          </div>
          <h3 className="amp-prompt-step__subtitle">Or start with a template</h3>
          <div className="amp-template-grid">
            {dispatchTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`amp-template-card${templateId === item.id ? " is-selected" : ""}`}
                onClick={() => selectTemplate(item)}
              >
                <strong>{item.title}</strong>
                <span>{item.description}</span>
                <em>{item.audienceHint}</em>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <div className="amp-dispatch__content">
          <div className="amp-dispatch__media">
            <div className="amp-post-preview">
              <div className="amp-post-preview__media">
                {mediaType === "video" ? (
                  <video src={mediaUrl} playsInline preload="metadata" muted />
                ) : (
                  <img src={mediaUrl} alt="" />
                )}
                {mediaType === "video" && <span className="amp-post-preview__badge">Video</span>}
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary amp-post-preview__replace"
                  onClick={openAssetModal}
                >
                  <svg className="amp-post-preview__replace-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
                  Replace asset
                </button>
              </div>
              <div className="amp-post-preview__body">
                <strong>Duke Health</strong>
                <p>{selectedCaptionTexts[0]?.text || "Select captions to preview."}</p>
                <a href={resolvedCtaDestination || "#"} target="_blank" rel="noreferrer">
                  {resolvedCtaLabel}
                </a>
              </div>
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
              </label>
              <div className="amp-caption-add__row">
                <input
                  id="amp-custom-caption"
                  type="text"
                  value={customCaptionDraft}
                  onChange={(event) => setCustomCaptionDraft(event.target.value)}
                  placeholder="Write a caption employees can share…"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomCaption();
                    }
                  }}
                />
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary amp-caption-add__btn"
                  onClick={addCustomCaption}
                  disabled={!customCaptionDraft.trim()}
                >
                  Add caption
                </button>
              </div>
            </div>
            <div className="amp-cta-destination">
              <p className="amp-cta-destination__title" id="amp-cta-destination-label">
                CTA destination <span className="cs-required" aria-hidden="true">*</span>
              </p>
              <div
                className="amp-cta-destination__panel"
                role="group"
                aria-labelledby="amp-cta-destination-label"
              >
                <div className="amp-cta-type-selector" role="tablist" aria-label="CTA destination type">
                  {CTA_TYPE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={ctaDestinationType === option.value ? "is-active" : ""}
                      role="tab"
                      aria-selected={ctaDestinationType === option.value}
                      onClick={() => setCtaDestinationType(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {ctaDestinationType === "page" && (
                  <div className="amp-cta-destination__grid">
                    <label className="amp-field amp-field--compact">
                      Locale
                      <UiDropdown
                        size="sm"
                        value={selectedCtaLocale}
                        options={ctaLocaleOptions}
                        onChange={setSelectedCtaLocale}
                        placeholder="Select locale"
                        ariaLabel="Locale"
                      />
                    </label>
                    <label className="amp-field amp-field--compact">
                      Persona
                      <UiDropdown
                        size="sm"
                        value={selectedCtaPersona}
                        options={ctaPersonaOptions}
                        onChange={setSelectedCtaPersona}
                        placeholder="Select persona"
                        ariaLabel="Persona"
                      />
                    </label>
                    <label className="amp-field amp-field--compact">
                      Page
                      <UiDropdown
                        size="sm"
                        value={selectedCtaPageValue}
                        options={cmsDestinationPages.map((page) => ({
                          value: page.value,
                          label: page.label,
                        }))}
                        onChange={setSelectedCtaPageValue}
                        placeholder="Select page"
                        ariaLabel="Page"
                      />
                    </label>
                  </div>
                )}
                {ctaDestinationType === "job" && (
                  <label className="amp-field amp-field--compact amp-cta-destination__single">
                    Jobs
                    <UiDropdown
                      size="sm"
                      value={selectedCtaJob}
                      options={ctaJobOptions}
                      onChange={setSelectedCtaJob}
                      placeholder="Select job"
                      ariaLabel="Jobs"
                    />
                  </label>
                )}
                {ctaDestinationType === "event" && (
                  <label className="amp-field amp-field--compact amp-cta-destination__single">
                    Event
                    <UiDropdown
                      size="sm"
                      value={selectedCtaEvent}
                      options={ctaEventOptions}
                      onChange={setSelectedCtaEvent}
                      placeholder="Select event"
                      ariaLabel="Event"
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="amp-audience">
              <p className="amp-audience__title" id="amp-audience-label">
                Audience <span className="cs-required" aria-hidden="true">*</span>
              </p>
              <div className="amp-audience__panel" role="group" aria-labelledby="amp-audience-label">
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
                <span className="amp-help amp-help--inline">
                  Estimated recipients: {audienceCount}
                  {!isAllEmployeesSelected && selectedEmails.length > 0
                    ? ` (${segmentRecipientCount} in segment${selectedAudienceOptions.length === 1 ? "" : "s"} + ${selectedEmails.length} by email)`
                    : ""}
                </span>
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
        </div>
      )}

      {step === 2 && (
        <div className="amp-dispatch__review">
          <h3>Preview & Save</h3>
          <dl className="amp-review-list">
            <div>
              <dt>{selectedTemplate ? "Template" : "Brief"}</dt>
              <dd>{packTitle || (selectedTemplate ? template.title : promptTitle)}</dd>
            </div>
            <div>
              <dt>Media</dt>
              <dd>
                {mediaType === "video" ? "Video" : "Image"} · {mediaName}
              </dd>
            </div>
            <div>
              <dt>Captions</dt>
              <dd>{selectedCaptions.length} variants</dd>
            </div>
            <div>
              <dt>CTA</dt>
              <dd>
                {resolvedCtaLabel}
                <br />
                <a href={resolvedCtaDestination} target="_blank" rel="noreferrer">
                  {resolvedCtaDestination}
                </a>
              </dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>
                {selectedAudienceOptions.map((option) => option.label).join(", ") || "None"}
                {" "}
                ({segmentRecipientCount})
                {!isAllEmployeesSelected && selectedEmails.length > 0 && (
                  <>
                    <br />
                    <span className="amp-review-list__muted">
                      + {selectedEmails.length} by email: {selectedEmails.join(", ")}
                    </span>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Channel</dt>
              <dd>Email</dd>
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
          className="cs-btn cs-btn--secondary-ghost amp-dispatch__cancel"
          onClick={() => (step === 0 ? onCancel() : setConfirmOpen(true))}
        >
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
              onClick={() => {
                if (step === 0) {
                  advanceFromTemplateStep();
                  return;
                }
                setStep((current) => current + 1);
              }}
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
              <button type="button" className="cs-btn cs-btn--secondary-ghost amp-confirm__discard" onClick={handleDiscard}>
                Cancel
              </button>
              <div className="amp-confirm__footer-actions">
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary amp-confirm__keep"
                  onClick={() => setConfirmOpen(false)}
                >
                  Keep editing
                </button>
                <button type="button" className="cs-btn cs-btn--primary amp-confirm__save" onClick={handleSaveDraft}>
                  Save draft
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {showAssetModal &&
        createPortal(
          <div
            className="cs-modal-backdrop cs-replace-image-modal__backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amp-replace-asset-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) setShowAssetModal(false);
            }}
          >
            <div className="cs-modal cs-modal--lg cs-replace-image-modal">
              <div className="cs-modal__header">
                <h2 id="amp-replace-asset-title">Replace asset</h2>
                <button
                  type="button"
                  className="cs-icon-button"
                  onClick={() => setShowAssetModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="cs-modal__body cs-replace-image-modal__body">
                <aside className="cs-replace-image-modal__filters" aria-label="Asset filters">
                  <div className="cs-replace-image-modal__filter-group">
                    <strong>Upload date</strong>
                    {["Today", "Current week", "Current month", "Custom ranges"].map((filter, index) => (
                      <label key={`upload-${filter}`}>
                        <span className={index === 0 ? "is-selected" : ""} aria-hidden="true" />
                        {filter}
                      </label>
                    ))}
                  </div>
                  <div className="cs-replace-image-modal__filter-group">
                    <strong>Last Modified</strong>
                    {["Today", "Current week", "Current month", "Custom ranges"].map((filter, index) => (
                      <label key={`modified-${filter}`}>
                        <span className={index === 0 ? "is-selected" : ""} aria-hidden="true" />
                        {filter}
                      </label>
                    ))}
                  </div>
                </aside>
                <section className="cs-replace-image-modal__content">
                  <div className="cs-replace-image-modal__toolbar amp-asset-modal__toolbar">
                    <div className="cs-replace-image-modal__search">
                      <span aria-hidden="true" />
                      <input
                        value={assetSearch}
                        onChange={(event) => setAssetSearch(event.target.value)}
                        placeholder="Search image"
                        aria-label="Search image"
                      />
                    </div>
                    <input
                      ref={uploadAssetInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="amp-asset-modal__file-input"
                      onChange={handleAssetLibraryUpload}
                    />
                  </div>
                  <div className="cs-replace-image-modal__content-header">
                    <h3>
                      {filteredAssets.some((asset) => asset.kind === "video") ? "Assets" : "Images"} (
                      {filteredAssets.length})
                    </h3>
                  </div>
                  <div className="cs-image-options">
                    {filteredAssets.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        className={selectedAssetId === option.id ? "is-selected" : ""}
                        onClick={() => setSelectedAssetId(option.id)}
                      >
                        <span className="cs-image-options__preview">
                          {option.kind === "video" ? (
                            <video src={option.src} muted playsInline preload="metadata" />
                          ) : (
                            <img src={option.src} alt="" />
                          )}
                          {selectedAssetId === option.id && (
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
                    {!filteredAssets.length && (
                      <p className="amp-asset-modal__empty">No assets found. Upload a new asset to continue.</p>
                    )}
                  </div>
                </section>
              </div>
              <div className="cs-modal__footer cs-replace-image-modal__footer amp-asset-modal__footer">
                <button type="button" className="cs-btn cs-btn--secondary-ghost" onClick={() => setShowAssetModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary"
                  onClick={() => uploadAssetInputRef.current?.click()}
                >
                  Upload Asset
                </button>
                <button
                  type="button"
                  className="cs-btn cs-btn--primary"
                  onClick={confirmAssetReplacement}
                  disabled={!selectedModalAsset}
                >
                  Replace asset
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
