import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import checkWizardIcon from "../../../assets/svg/check-wizard.svg";
import closeIcon from "../../../assets/svg/cross.svg";
import leftArrowIcon from "../../../assets/svg/leftArrow.svg";
import penIcon from "../../../assets/svg/pen.svg";
import { UiDropdown } from "../UiDropdown";
import { UiMultiSelect } from "../UiMultiSelect";
import {
  audienceEmployeeOptions,
  audienceSegmentOptions,
  cmsDestinationPages,
  createSharePackDraftFromBrief,
  ctaBlogOptions,
  ctaEventOptions,
  ctaJobOptions,
  ctaLocaleOptions,
  ctaPersonaOptions,
  dispatchCaptionPool,
  dispatchTemplates,
  formatCaptionForPicker,
  packAssetOptions,
  resolveCtaDestinationMatch,
} from "./amplifyData";
import { getCampaignCreatorName } from "../campaignStudioData";
import { AmplifyCampaignSeed, ShareCaption, SharePack } from "./amplifyTypes";

const BackArrowIcon = () => (
  <svg className="cs-back-edit__icon" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
    <path
      d="M0.23125 6.54554C0.084375 6.40179 0 6.20804 0 6.00179C0 5.79554 0.084375 5.60179 0.23125 5.45804L5.73125 0.208037C6.03125 -0.0794632 6.50625 -0.0669631 6.79063 0.233037C7.075 0.533037 7.06563 1.00804 6.76562 1.29241L2.62188 5.25179H13.25C13.6656 5.25179 14 5.58616 14 6.00179C14 6.41741 13.6656 6.75179 13.25 6.75179H2.62188L6.76875 10.708C7.06875 10.9955 7.07812 11.4674 6.79375 11.7674C6.50937 12.0674 6.03438 12.0768 5.73438 11.7924L0.234375 6.54241L0.23125 6.54554Z"
      fill="currentColor"
    />
  </svg>
);

const OpenLinkIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.875 0.9375C11.875 1.45703 12.293 1.875 12.8125 1.875H16.8008L8.08594 10.5859C7.71875 10.9531 7.71875 11.5469 8.08594 11.9102C8.45312 12.2734 9.04687 12.2773 9.41016 11.9102L18.1211 3.19922L18.125 7.1875C18.125 7.70703 18.543 8.125 19.0625 8.125C19.582 8.125 20 7.70703 20 7.1875V0.9375C20 0.417969 19.582 0 19.0625 0H12.8125C12.293 0 11.875 0.417969 11.875 0.9375ZM2.8125 1.25C1.25781 1.25 0 2.50781 0 4.0625V17.1875C0 18.7422 1.25781 20 2.8125 20H15.9375C17.4922 20 18.75 18.7422 18.75 17.1875V12.1875C18.75 11.668 18.332 11.25 17.8125 11.25C17.293 11.25 16.875 11.668 16.875 12.1875V17.1875C16.875 17.707 16.457 18.125 15.9375 18.125H2.8125C2.29297 18.125 1.875 17.707 1.875 17.1875V4.0625C1.875 3.54297 2.29297 3.125 2.8125 3.125H7.8125C8.33203 3.125 8.75 2.70703 8.75 2.1875C8.75 1.66797 8.33203 1.25 7.8125 1.25H2.8125Z"
      fill="currentColor"
    />
  </svg>
);

interface DispatchWizardProps {
  onCancel: () => void;
  onSend: (pack: SharePack) => void;
  onSaveDraft: (pack: SharePack) => void;
  campaignSeed?: AmplifyCampaignSeed | null;
  /** Brief from the Employee Advocacy main-page generate panel */
  initialBrief?: string | null;
  initialTemplateId?: string | null;
  /** Return to main page with the brief preserved */
  onBackToBrief?: (brief: string, templateId: string | null) => void;
}

type PackAssetOption = (typeof packAssetOptions)[number] | {
  id: string;
  label: string;
  src: string;
  kind: "image" | "video";
  meta: string;
};

const WIZARD_STEPS = [
  { title: "Details", description: "Review Details" },
  { title: "Preview & Publish", description: "Preview Email" },
] as const;
const CTA_TYPE_OPTIONS = [
  { value: "page", label: "Page" },
  { value: "job", label: "Job" },
  { value: "event", label: "Event" },
  { value: "blog", label: "Blog" },
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
  if (ctaBlogOptions.some((option) => option.value === destination)) return "blog";
  return "page";
};

export const DispatchWizard: React.FC<DispatchWizardProps> = ({
  onCancel,
  onSend,
  onSaveDraft,
  campaignSeed = null,
  initialBrief = null,
  initialTemplateId = null,
  onBackToBrief,
}) => {
  const seedCaptionId = campaignSeed?.copy ? `campaign-cap-${campaignSeed.campaignId}` : null;
  const uploadAssetInputRef = useRef<HTMLInputElement>(null);
  const employeeNoteInputRef = useRef<HTMLTextAreaElement>(null);
  const captionPickerRef = useRef<HTMLUListElement>(null);
  const packTitleInputRef = useRef<HTMLInputElement>(null);
  const resolvedInitialCtaDestination = campaignSeed?.ctaDestination || cmsDestinationPages[1].value;
  const initialCtaMatch = resolveCtaDestinationMatch(resolvedInitialCtaDestination);
  const initialCtaDestinationType = resolveInitialCtaType(resolvedInitialCtaDestination);
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetLibrary, setAssetLibrary] = useState<PackAssetOption[]>(() => [...packAssetOptions]);
  const [selectedPackAssetIds, setSelectedPackAssetIds] = useState<string[]>([packAssetOptions[0].id]);
  const [modalSelectedAssetIds, setModalSelectedAssetIds] = useState<string[]>([packAssetOptions[0].id]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [assetSearch, setAssetSearch] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(initialTemplateId);
  const [prompt, setPrompt] = useState(() =>
    initialBrief?.trim()
      ? initialBrief
      : campaignSeed
        ? `Create an employee share pack from the campaign "${campaignSeed.name}".`
        : "",
  );
  const [packTitle, setPackTitle] = useState("");
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>([]);
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
  const [selectedCtaBlog, setSelectedCtaBlog] = useState(
    ctaBlogOptions.some((option) => option.value === resolvedInitialCtaDestination)
      ? resolvedInitialCtaDestination
      : ctaBlogOptions[0].value,
  );
  const [audiences, setAudiences] = useState<string[]>([ALL_EMPLOYEES_VALUE]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [employeeNote, setEmployeeNote] = useState("");
  const [customCaptions, setCustomCaptions] = useState<ShareCaption[]>(() =>
    campaignSeed?.copy && seedCaptionId
      ? [{ id: seedCaptionId, text: campaignSeed.copy }]
      : [],
  );
  const [customCaptionDraft, setCustomCaptionDraft] = useState("");
  const [scrollToCaptionId, setScrollToCaptionId] = useState<string | null>(null);
  const [isEditingPackTitle, setIsEditingPackTitle] = useState(false);
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

  const selectedPackAssets = useMemo(() => {
    const byId = new Map(assetLibrary.map((asset) => [asset.id, asset]));
    const resolved = selectedPackAssetIds
      .map((id) => byId.get(id))
      .filter((asset): asset is PackAssetOption => Boolean(asset));
    return resolved.length ? resolved : [assetLibrary[0] || packAssetOptions[0]];
  }, [assetLibrary, selectedPackAssetIds]);

  const activeAsset =
    selectedPackAssets[Math.min(carouselIndex, selectedPackAssets.length - 1)] || selectedPackAssets[0];
  const mediaUrl = activeAsset.src;
  const mediaType = activeAsset.kind;
  const canCarousel = selectedPackAssets.length > 1;

  const selectedModalAssets = useMemo(() => {
    const byId = new Map(assetLibrary.map((asset) => [asset.id, asset]));
    return modalSelectedAssetIds
      .map((id) => byId.get(id))
      .filter((asset): asset is PackAssetOption => Boolean(asset));
  }, [assetLibrary, modalSelectedAssetIds]);

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
  const utmPreview = `utm_source=employee_advocacy&utm_medium={channel}&utm_campaign=${templateId || "custom"}&utm_content={empId}&utm_locale=${selectedCtaLocale}`;
  const selectedCtaPage =
    cmsDestinationPages.find((page) => page.value === selectedCtaPageValue) || cmsDestinationPages[1];
  const selectedCtaJobOption =
    ctaJobOptions.find((option) => option.value === selectedCtaJob) || ctaJobOptions[0];
  const selectedCtaEventOption =
    ctaEventOptions.find((option) => option.value === selectedCtaEvent) || ctaEventOptions[0];
  const selectedCtaBlogOption =
    ctaBlogOptions.find((option) => option.value === selectedCtaBlog) || ctaBlogOptions[0];
  const resolvedCtaDestination =
    ctaDestinationType === "job"
      ? selectedCtaJob
      : ctaDestinationType === "event"
        ? selectedCtaEvent
        : ctaDestinationType === "blog"
          ? selectedCtaBlog
          : selectedCtaPage.value;
  const resolvedCtaLabel =
    ctaDestinationType === "job"
      ? selectedCtaJobOption.label
      : ctaDestinationType === "event"
        ? selectedCtaEventOption.label
        : ctaDestinationType === "blog"
          ? selectedCtaBlogOption.label
          : selectedCtaPage.label;

  const captionOptions = useMemo(() => {
    const aiCaptions = customCaptions.filter((caption) => caption.id.startsWith("cap-ai-"));
    const otherCustomCaptions = customCaptions.filter((caption) => !caption.id.startsWith("cap-ai-"));

    if (aiCaptions.length > 0) {
      return [...aiCaptions, ...otherCustomCaptions];
    }

    const customIds = new Set(customCaptions.map((caption) => caption.id));
    const pool = dispatchCaptionPool.filter((caption) => !customIds.has(caption.id));
    return [...pool, ...customCaptions];
  }, [customCaptions]);

  const selectedCaptionTexts = useMemo(
    () => captionOptions.filter((caption) => selectedCaptions.includes(caption.id)),
    [captionOptions, selectedCaptions],
  );

  const previewEmployeeNote = employeeNote.trim();

  const syncEmployeeNoteFromInput = () => {
    const nextValue = employeeNoteInputRef.current?.value ?? employeeNote;
    if (nextValue !== employeeNote) {
      setEmployeeNote(nextValue);
    }
    return nextValue.trim();
  };

  const canContinue =
    (step === 0 && selectedCaptions.length >= 5 && !!resolvedCtaDestination && audiences.length > 0) ||
    step === 1;

  const goToNextStep = () => {
    if (step === 0) {
      syncEmployeeNoteFromInput();
    }
    setStep((current) => current + 1);
  };

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  useLayoutEffect(() => {
    if (!scrollToCaptionId) return;

    const list = captionPickerRef.current;
    const item = document.getElementById(`amp-caption-${scrollToCaptionId}`);
    if (!list) {
      setScrollToCaptionId(null);
      return undefined;
    }

    const scrollToCaption = () => {
      list.scrollTop = list.scrollHeight;
      item?.scrollIntoView({ block: "nearest" });
    };

    scrollToCaption();
    const frame = window.requestAnimationFrame(scrollToCaption);

    setScrollToCaptionId(null);
    return () => window.cancelAnimationFrame(frame);
  }, [scrollToCaptionId, customCaptions]);

  useLayoutEffect(() => {
    if (!isEditingPackTitle) return;
    packTitleInputRef.current?.focus();
    packTitleInputRef.current?.select();
  }, [isEditingPackTitle]);

  useEffect(() => {
    if (carouselIndex > selectedPackAssets.length - 1) {
      setCarouselIndex(Math.max(selectedPackAssets.length - 1, 0));
    }
  }, [carouselIndex, selectedPackAssets.length]);

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
    setScrollToCaptionId(id);
    setCustomCaptionDraft("");
  };

  const openAssetModal = () => {
    setModalSelectedAssetIds(selectedPackAssetIds.length ? selectedPackAssetIds : [packAssetOptions[0].id]);
    setAssetSearch("");
    setShowAssetModal(true);
  };

  const toggleModalAsset = (id: string) => {
    setModalSelectedAssetIds((current) => {
      if (current.includes(id)) {
        if (current.length <= 1) return current;
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const confirmAssetSelection = () => {
    if (!selectedModalAssets.length) return;
    const nextIds = selectedModalAssets.map((asset) => asset.id);
    setSelectedPackAssetIds(nextIds);
    setCarouselIndex(0);
    setShowAssetModal(false);
  };

  const showPreviousAsset = () => {
    setCarouselIndex((current) => (current - 1 + selectedPackAssets.length) % selectedPackAssets.length);
  };

  const showNextAsset = () => {
    setCarouselIndex((current) => (current + 1) % selectedPackAssets.length);
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
    setModalSelectedAssetIds((current) =>
      current.includes(nextAsset.id) ? current : [...current, nextAsset.id],
    );
    event.target.value = "";
  };

  useEffect(() => {
    if (campaignSeed) {
      setPackTitle(campaignSeed.name);
      const defaultPoolIds = dispatchCaptionPool.slice(0, 5).map((caption) => caption.id);
      if (seedCaptionId) {
        const merged = [seedCaptionId, ...defaultPoolIds.filter((id) => id !== seedCaptionId)].slice(0, 5);
        setSelectedCaptions(merged);
      } else {
        setSelectedCaptions(defaultPoolIds);
      }
      return;
    }

    const brief = (initialBrief || "").trim();
    if (!brief) return;

    const draft = createSharePackDraftFromBrief(brief, initialTemplateId);
    const asset =
      packAssetOptions.find((item) => item.id === draft.assetId) || packAssetOptions[0];
    setTemplateId(draft.templateId);
    setPackTitle(draft.title);
    setAudiences(draft.audiences);
    setCustomCaptions(draft.captions);
    setSelectedCaptions(draft.selectedCaptionIds);
    setCtaDestinationType(draft.ctaDestinationType);
    setSelectedCtaPageValue(draft.ctaPageValue);
    setSelectedCtaJob(draft.ctaJobValue);
    setSelectedCtaEvent(draft.ctaEventValue);
    setSelectedCtaBlog(draft.ctaBlogValue);
    setSelectedCtaPersona(draft.ctaPersona);
    setSelectedPackAssetIds([asset.id]);
    setCarouselIndex(0);
    // Apply entry brief once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackFromDetails = () => {
    if (campaignSeed) {
      onCancel();
      return;
    }
    if (onBackToBrief) {
      onBackToBrief(prompt.trim(), templateId);
      return;
    }
    onCancel();
  };

  const buildPack = (status: "sent" | "draft", noteOverride?: string): SharePack => {
    const now = new Date().toISOString();
    const resolvedTitle =
      packTitle.trim() || campaignSeed?.name || (selectedTemplate ? template.title : promptTitle);
    const resolvedNote = (noteOverride ?? employeeNote).trim();
    return {
      id: `pack-dispatch-${Date.now()}`,
      title: resolvedTitle,
      subtitle: selectedTemplate?.description || prompt.trim() || template.description,
      status,
      source: campaignSeed ? "Campaign" : selectedTemplate ? "Pull·template" : "Manual",
      sourceLabel: campaignSeed?.name || selectedTemplate?.title || promptTitle,
      audienceLabel,
      audienceCount,
      channels: ["email"],
      thumbnailUrl: selectedPackAssets[0]?.src || mediaUrl,
      mediaType: selectedPackAssets[0]?.kind || mediaType,
      assets: selectedPackAssets.map((asset) => ({
        src: asset.src,
        kind: asset.kind,
        label: asset.label,
      })),
      ctaLabel: resolvedCtaLabel,
      ctaDestination: resolvedCtaDestination,
      utmPreview,
      captions: selectedCaptionTexts,
      metrics: status === "sent" ? { shares: 0, clicks: 0, applications: 0, emvUsd: 0 } : undefined,
      createdAt: now,
      createdByName: getCampaignCreatorName(),
      sentAt: status === "sent" ? now : undefined,
      employeeNote: resolvedNote || undefined,
    };
  };

  const handleSend = () => {
    const note = syncEmployeeNoteFromInput();
    onSend(buildPack("sent", note));
  };

  const handleSaveDraft = () => {
    const note = syncEmployeeNoteFromInput();
    onSaveDraft(buildPack("draft", note));
    setConfirmOpen(false);
  };

  const handleDiscard = () => {
    setConfirmOpen(false);
    onCancel();
  };

  useEffect(() => {
    if (!confirmOpen && !showAssetModal) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (confirmOpen) setConfirmOpen(false);
      if (showAssetModal) setShowAssetModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen, showAssetModal]);

  const backLabel = campaignSeed ? "Back to Campaigns" : "Back to Employee Advocacy";

  return (
    <>
      <header className="cs-wizard-header">
        <div className="cs-wizard-header__content">
          <div className="cs-wizard-hero">
            <button type="button" className="cs-back-edit" onClick={handleBackFromDetails}>
              <svg className="cs-back-edit__icon" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
                <path
                  d="M0.23125 6.54554C0.084375 6.40179 0 6.20804 0 6.00179C0 5.79554 0.084375 5.60179 0.23125 5.45804L5.73125 0.208037C6.03125 -0.0794632 6.50625 -0.0669631 6.79063 0.233037C7.075 0.533037 7.06563 1.00804 6.76562 1.29241L2.62188 5.25179H13.25C13.6656 5.25179 14 5.58616 14 6.00179C14 6.41741 13.6656 6.75179 13.25 6.75179H2.62188L6.76875 10.708C7.06875 10.9955 7.07812 11.4674 6.79375 11.7674C6.50937 12.0674 6.03438 12.0768 5.73438 11.7924L0.234375 6.54241L0.23125 6.54554Z"
                  fill="currentColor"
                />
              </svg>
              {backLabel}
            </button>
            <div className="cs-wizard-title">
              <h1>Generate share pack</h1>
            </div>
          </div>
          <div className="cs-wizard-stepper-row">
            <div className="cs-wizard-steps" aria-label="Generate share pack steps">
              {WIZARD_STEPS.map((item, index) => {
                const stepNumber = index + 1;
                const isActive = step === index;
                const isCompleted = step > index;
                return (
                  <span
                    key={item.title}
                    className={`${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
                  >
                    <span className="cs-wizard-step__rail" aria-hidden="true">
                      <em>
                        {isCompleted ? (
                          <img src={checkWizardIcon} alt="" width={14} height={10} />
                        ) : (
                          stepNumber
                        )}
                      </em>
                    </span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <section className="cs-wizard-page">
        <section className="cs-wizard-section amp-dispatch">

      {campaignSeed && (
        <p className="amp-dispatch__seed" role="status">
          Creating a share pack from <strong>{campaignSeed.name}</strong>
        </p>
      )}

      {step === 0 && (
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
                {canCarousel && (
                  <>
                    <button
                      type="button"
                      className="amp-asset-carousel__nav amp-asset-carousel__nav--prev"
                      onClick={showPreviousAsset}
                      aria-label="Previous asset"
                    >
                      <img src={leftArrowIcon} alt="" width={7} height={13} />
                    </button>
                    <button
                      type="button"
                      className="amp-asset-carousel__nav amp-asset-carousel__nav--next"
                      onClick={showNextAsset}
                      aria-label="Next asset"
                    >
                      <img src={leftArrowIcon} alt="" width={7} height={13} />
                    </button>
                    <span className="amp-asset-carousel__count" aria-live="polite">
                      {Math.min(carouselIndex, selectedPackAssets.length - 1) + 1} / {selectedPackAssets.length}
                    </span>
                  </>
                )}
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
                  {selectedPackAssets.length > 1 ? "Edit assets" : "Select assets"}
                </button>
              </div>
              <div className="amp-post-preview__body">
                <strong>One Health</strong>
                <p>{selectedCaptionTexts[0]?.text || "Select captions to preview."}</p>
                <a href={resolvedCtaDestination || "#"} target="_blank" rel="noreferrer">
                  {resolvedCtaLabel}
                </a>
              </div>
            </div>
          </div>
          <div className="amp-dispatch__fields">
            <h3>Caption variants</h3>
            <p className="amp-help" id="amp-caption-help">
              Select at least 5 captions employees can choose from.{" "}
              <strong>
                {selectedCaptions.length} of 5 selected
              </strong>
              {selectedCaptions.length < 5 && (
                <span className="amp-help--warn">
                  {" "}
                  — select {5 - selectedCaptions.length} more to continue.
                </span>
              )}
            </p>
            <ul className="amp-caption-picker" ref={captionPickerRef}>
              {captionOptions.map((caption) => (
                <li key={caption.id} id={`amp-caption-${caption.id}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCaptions.includes(caption.id)}
                      onChange={() => toggleCaption(caption.id)}
                    />
                    <span>{formatCaptionForPicker(caption.text)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <label className="amp-field amp-caption-add" htmlFor="amp-custom-caption">
              Add a custom caption
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
            </label>
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
                {ctaDestinationType === "blog" && (
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
                      Blog
                      <UiDropdown
                        size="sm"
                        value={selectedCtaBlog}
                        options={ctaBlogOptions}
                        onChange={setSelectedCtaBlog}
                        placeholder="Select blog"
                        ariaLabel="Blog"
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
              Note to Employee
              <textarea
                ref={employeeNoteInputRef}
                rows={3}
                value={employeeNote}
                onChange={(event) => setEmployeeNote(event.target.value)}
                placeholder="Add context for employees before they share…"
              />
            </label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="amp-dispatch__review">
          <div className="amp-dispatch__review-layout">
            <section className="amp-dispatch__review-summary" aria-label="Pack details">
              <div className="amp-pack-overview">
                <div className="cs-overview__title-row amp-pack-overview__title-row">
                  {isEditingPackTitle ? (
                    <input
                      ref={packTitleInputRef}
                      type="text"
                      className="amp-pack-overview__title-input"
                      value={packTitle || promptTitle}
                      onChange={(event) => setPackTitle(event.target.value)}
                      onBlur={() => setIsEditingPackTitle(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === "Escape") {
                          event.preventDefault();
                          setIsEditingPackTitle(false);
                        }
                      }}
                      aria-label="Share pack title"
                    />
                  ) : (
                    <>
                      <h2 className="amp-pack-overview__title">{packTitle || promptTitle}</h2>
                      <button
                        type="button"
                        className="amp-pack-overview__edit"
                        onClick={() => setIsEditingPackTitle(true)}
                        aria-label="Edit pack title"
                      >
                        <img src={penIcon} alt="" width={14} height={14} />
                      </button>
                    </>
                  )}
                </div>
                <dl className="cs-overview__details amp-pack-overview__details">
                  <div>
                    <dt>Media</dt>
                    <dd>
                      {selectedPackAssets.length === 1
                        ? `${activeAsset.kind === "video" ? "Video" : "Image"} · ${activeAsset.label}`
                        : `${selectedPackAssets.length} assets`}
                    </dd>
                  </div>
                  <div>
                    <dt>Captions</dt>
                    <dd>
                      {selectedCaptions.length} variant{selectedCaptions.length === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <div>
                    <dt>Destination link</dt>
                    <dd>
                      <a
                        className="cs-overview-open-link"
                        href={resolvedCtaDestination || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Link
                        <span className="cs-overview-open-link__icon" aria-hidden="true">
                          <OpenLinkIcon />
                        </span>
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Audience</dt>
                    <dd>
                      {selectedAudienceOptions.map((option) => option.label).join(", ") || "None"} (
                      {segmentRecipientCount})
                      {!isAllEmployeesSelected && selectedEmails.length > 0 && (
                        <>
                          <br />
                          <span className="amp-pack-overview__muted">
                            + {selectedEmails.length} by email: {selectedEmails.join(", ")}
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="amp-email-preview" aria-label="Employee email preview">
              <div className="amp-email-preview__chrome">
                <div className="amp-email-preview__meta-row">
                  <span>From</span>
                  <strong>Talent Brand · One Health</strong>
                </div>
                <div className="amp-email-preview__meta-row">
                  <span>To</span>
                  <strong>
                    {audienceLabel}
                    {audienceCount > 0 ? ` (${audienceCount})` : ""}
                  </strong>
                </div>
                <div className="amp-email-preview__meta-row">
                  <span>Subject</span>
                  <strong>You&apos;re invited to share: {packTitle || promptTitle}</strong>
                </div>
              </div>

              <div className="amp-email-preview__body">
                <p className="amp-email-preview__greeting">Hi {"{{first_name}}"},</p>
                {previewEmployeeNote && (
                  <p className="amp-email-preview__intro">{previewEmployeeNote}</p>
                )}
                <p className="amp-email-preview__intro">
                  We put together a ready-to-share pack. Download the
                  attached zip — it includes your media, caption options, and everything you need to post. It only takes
                  a minute.
                </p>
                <p className="amp-email-preview__intro">
                  Destination for your post:{" "}
                  <a href={resolvedCtaDestination || "#"} target="_blank" rel="noreferrer">
                    {resolvedCtaLabel}
                  </a>
                  .
                </p>

                <div className="amp-email-preview__attachments">
                  <p className="amp-email-preview__section-label">Attachments</p>
                  <p className="amp-email-preview__attachments-note">
                    Delivered as{" "}
                    <strong>
                      {(packTitle || promptTitle || "share-pack")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")}
                      .zip
                    </strong>
                  </p>
                  <ul className="amp-email-preview__attachment-list">
                    {selectedPackAssets.map((asset) => {
                      const extension = asset.kind === "video" ? "mp4" : "jpg";
                      const fileName = `${asset.label
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")}.${extension}`;
                      return (
                        <li key={asset.id}>
                          <span className="amp-email-preview__attachment-icon" aria-hidden="true">
                            {asset.kind === "video" ? "VID" : "IMG"}
                          </span>
                          <div>
                            <strong>{fileName}</strong>
                            {asset.kind === "video" && <small>Video · Ready to share</small>}
                          </div>
                        </li>
                      );
                    })}
                    <li>
                      <span className="amp-email-preview__attachment-icon" aria-hidden="true">
                        TXT
                      </span>
                      <div>
                        <strong>captions.txt</strong>
                      </div>
                    </li>
                  </ul>
                </div>

                <p className="amp-email-preview__footer">
                  Thanks for helping candidates discover careers at One Health. If you have questions, reply to this
                  email.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="cs-wizard-footer">
        {step > 0 && (
          <div className="cs-wizard-footer__back">
            <button type="button" className="cs-btn cs-btn--ghost" onClick={() => setStep((current) => current - 1)}>
              <BackArrowIcon /> Back
            </button>
          </div>
        )}
        <div className="cs-wizard-footer__actions">
          <button
            type="button"
            className="cs-btn cs-btn--secondary-ghost"
            onClick={() => (step === 0 ? handleBackFromDetails() : setConfirmOpen(true))}
          >
            Cancel
          </button>
          {step < WIZARD_STEPS.length - 1 ? (
            <button
              type="button"
              className="cs-btn cs-btn--primary"
              disabled={!canContinue}
              onClick={goToNextStep}
              aria-describedby={step === 0 ? "amp-caption-help" : undefined}
            >
              Continue
            </button>
          ) : (
            <>
              <button type="button" className="cs-btn cs-btn--secondary" onClick={handleSaveDraft}>
                Save draft
              </button>
              <button type="button" className="cs-btn cs-btn--primary" onClick={handleSend}>
                Send now
              </button>
            </>
          )}
        </div>
      </footer>
        </section>
      </section>

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
              <div className="amp-confirm__footer-actions">
                <button
                  type="button"
                  className="cs-btn cs-btn--secondary amp-confirm__discard"
                  onClick={handleDiscard}
                >
                  Leave without Saving
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
                <h2 id="amp-replace-asset-title">Select assets</h2>
                <button
                  type="button"
                  className="cs-icon-button"
                  onClick={() => setShowAssetModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="cs-modal__body cs-replace-image-modal__body cs-replace-image-modal__body--no-filters">
                <section className="cs-replace-image-modal__content cs-replace-image-modal__content--full">
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
                    <p className="amp-asset-modal__hint">
                      Select one or more assets. Multiple assets appear as a carousel in the share pack.
                    </p>
                  </div>
                  <div className="cs-image-options">
                    {filteredAssets.map((option) => {
                      const isSelected = modalSelectedAssetIds.includes(option.id);
                      return (
                        <button
                          type="button"
                          key={option.id}
                          className={isSelected ? "is-selected" : ""}
                          onClick={() => toggleModalAsset(option.id)}
                          aria-pressed={isSelected}
                        >
                          <span className="cs-image-options__preview">
                            {option.kind === "video" ? (
                              <video src={option.src} muted playsInline preload="metadata" />
                            ) : (
                              <img src={option.src} alt="" />
                            )}
                            {isSelected && (
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
                      );
                    })}
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
                  onClick={confirmAssetSelection}
                  disabled={!selectedModalAssets.length}
                >
                  Use {selectedModalAssets.length} asset{selectedModalAssets.length === 1 ? "" : "s"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
