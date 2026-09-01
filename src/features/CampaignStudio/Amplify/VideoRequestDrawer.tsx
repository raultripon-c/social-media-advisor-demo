import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import paperPlaneIcon from "../../../assets/svg/paper-plane-16.svg";
import marcusThumb from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import { APIService } from "../../../utils/api.service";
import { UiDropdown, UiDropdownOption } from "../UiDropdown";
import { getCampaignCreatorName, getRefNum } from "../campaignStudioData";
import { SharePack } from "./amplifyTypes";

interface VideoRequestDrawerProps {
  open: boolean;
  onClose: () => void;
  onSend: (pack: SharePack) => void;
}

type TenantPage = {
  id: string;
  label: string;
  url: string;
};

const MAX_REQUEST_NAME = 130;
const MAX_INTRO_TITLE = 60;
const MAX_INTRO_DESCRIPTION = 200;

const VIDEO_LENGTH_OPTIONS: UiDropdownOption[] = [
  { value: "15", label: "15 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "90", label: "1 minute 30 seconds" },
  { value: "120", label: "2 minutes" },
];

const VIDEO_ORIENTATION_OPTIONS: UiDropdownOption[] = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
];

const DEFAULT_INTRO_TITLE = "Welcome to your Video Capture request!";
const DEFAULT_INTRO_DESCRIPTION =
  "We are looking for an authentic video. Remember to smile and have fun! Follow the instructions below to complete your video.";

const mapSiteVariantToLabel = (variant: string) => {
  const labels: Record<string, string> = {
    internal: "Employee Experience",
    external: "Career Site",
    newvariant: "New Variant",
  };
  return labels[variant] || variant;
};

const getPageId = (page: any, index: number) =>
  String(page?.pageId || page?._id || page?.id || page?.url || page?.path || `page-${index}`);

const getPageUrl = (page: any) =>
  String(page?.url || page?.pageUrl || page?.publishedUrl || page?.path || page?.slug || "");

export const VideoRequestDrawer: React.FC<VideoRequestDrawerProps> = ({ open, onClose, onSend }) => {
  const { refnum } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requestName, setRequestName] = useState("");
  const [locale, setLocale] = useState("");
  const [persona, setPersona] = useState("");
  const [landingPageId, setLandingPageId] = useState("");
  const [introTitle, setIntroTitle] = useState(DEFAULT_INTRO_TITLE);
  const [introDescription, setIntroDescription] = useState(DEFAULT_INTRO_DESCRIPTION);
  const [introVideo, setIntroVideo] = useState<File | null>(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [maximumVideoLength, setMaximumVideoLength] = useState("");
  const [videoOrientation, setVideoOrientation] = useState("16:9");
  const [tagDraft, setTagDraft] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [applyDefaultBranding, setApplyDefaultBranding] = useState(false);
  const [localeOptions, setLocaleOptions] = useState<UiDropdownOption[]>([]);
  const [personaOptions, setPersonaOptions] = useState<UiDropdownOption[]>([]);
  const [tenantPages, setTenantPages] = useState<TenantPage[]>([]);
  const [tenantOptionsLoading, setTenantOptionsLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [tenantOptionsError, setTenantOptionsError] = useState("");
  const [brandingMessage, setBrandingMessage] = useState("");

  const refNum = refnum || getRefNum();

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
    setRequestName("");
    setLocale("");
    setPersona("");
    setLandingPageId("");
    setIntroTitle(DEFAULT_INTRO_TITLE);
    setIntroDescription(DEFAULT_INTRO_DESCRIPTION);
    setIntroVideo(null);
    setVideoPrompt("");
    setMaximumVideoLength("");
    setVideoOrientation("16:9");
    setTagDraft("");
    setTags([]);
    setApplyDefaultBranding(false);
    setTenantPages([]);
    setTenantOptionsError("");
    setBrandingMessage("");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    const loadTenantOptions = async () => {
      setTenantOptionsLoading(true);
      setTenantOptionsError("");
      try {
        const [languages, variants] = await Promise.all([
          APIService.getSupportedLangs(refNum),
          APIService.getSiteVariants(refNum),
        ]);
        if (!active) return;

        const nextLocales = Array.isArray(languages)
          ? languages
              .map((language: any) => ({
                label: String(language?.description || language?.language || ""),
                value: String(language?.language || "").toLowerCase(),
              }))
              .filter((option) => option.label && option.value)
          : [];
        const nextPersonas = Array.isArray(variants)
          ? variants
              .map((variant: any) => {
                const value = String(variant?.value || variant?.variantName || variant || "");
                return {
                  label: String(variant?.label || mapSiteVariantToLabel(value)),
                  value,
                };
              })
              .filter((option) => option.label && option.value)
          : [];

        setLocaleOptions(nextLocales);
        setPersonaOptions(nextPersonas);
        if (!nextLocales.length || !nextPersonas.length) {
          setTenantOptionsError("Locale or persona information is unavailable for this tenant.");
        }
      } catch {
        if (!active) return;
        setLocaleOptions([]);
        setPersonaOptions([]);
        setTenantOptionsError("We couldn’t load locale and persona information. Please try again.");
      } finally {
        if (active) setTenantOptionsLoading(false);
      }
    };

    void loadTenantOptions();
    return () => {
      active = false;
    };
  }, [open, refNum]);

  useEffect(() => {
    setLandingPageId("");
    setTenantPages([]);
    if (!open || !locale || !persona) return undefined;
    let active = true;

    const loadPages = async () => {
      setPagesLoading(true);
      setTenantOptionsError("");
      try {
        const pages = await APIService.getAllPages({
          refNum,
          locale,
          variantName: persona,
          deviceType: "desktop",
        });
        if (!active) return;
        const nextPages = Array.isArray(pages)
          ? pages
              .filter((page: any) => page?.displayName?.toLowerCase() !== "category")
              .map((page: any, index: number) => ({
                id: getPageId(page, index),
                label: String(page?.displayName || page?.name || page?.title || `Page ${index + 1}`),
                url: getPageUrl(page),
              }))
          : [];
        setTenantPages(nextPages);
        if (!nextPages.length) {
          setTenantOptionsError("No landing pages are available for the selected locale and persona.");
        }
      } catch {
        if (!active) return;
        setTenantOptionsError("We couldn’t load landing pages for this tenant.");
      } finally {
        if (active) setPagesLoading(false);
      }
    };

    void loadPages();
    return () => {
      active = false;
    };
  }, [locale, open, persona, refNum]);

  const landingPageOptions = useMemo(
    () => tenantPages.map((page) => ({ value: page.id, label: page.label })),
    [tenantPages],
  );
  const selectedLandingPage = tenantPages.find((page) => page.id === landingPageId);

  const canSend =
    requestName.trim().length > 0 &&
    locale.length > 0 &&
    persona.length > 0 &&
    landingPageId.length > 0 &&
    introTitle.trim().length > 0 &&
    introDescription.trim().length > 0 &&
    videoPrompt.trim().length > 0 &&
    maximumVideoLength.length > 0 &&
    videoOrientation.length > 0;

  const addTag = () => {
    const nextTag = tagDraft.trim();
    if (!nextTag || tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) return;
    setTags((current) => [...current, nextTag]);
    setTagDraft("");
  };

  const handleIntroVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
      event.target.value = "";
      setTenantOptionsError("Intro video must be an MP4 file.");
      return;
    }
    setIntroVideo(file);
    setTenantOptionsError("");
  };

  const handleSend = () => {
    if (!canSend || !selectedLandingPage) return;
    const now = new Date().toISOString();
    const slug = requestName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);
    const pack: SharePack = {
      id: `video-req-${Date.now()}`,
      title: requestName.trim(),
      subtitle: `${VIDEO_LENGTH_OPTIONS.find((option) => option.value === maximumVideoLength)?.label} · ${
        VIDEO_ORIENTATION_OPTIONS.find((option) => option.value === videoOrientation)?.label
      }`,
      status: "sent",
      source: "Manual",
      sourceLabel: "Video request",
      audienceLabel: personaOptions.find((option) => option.value === persona)?.label || persona,
      audienceCount: 0,
      channels: ["email"],
      thumbnailUrl: marcusThumb,
      mediaType: "video",
      ctaLabel: selectedLandingPage.label,
      ctaDestination: selectedLandingPage.url,
      utmPreview: `utm_source=employee_advocacy&utm_medium=email&utm_campaign=video-request-${slug || "custom"}`,
      captions: [{ id: "video-req-prompt", text: videoPrompt.trim() }],
      createdAt: now,
      createdByName: getCampaignCreatorName(),
      sentAt: now,
      videoRequest: {
        locale,
        persona,
        landingPageId,
        landingPageLabel: selectedLandingPage.label,
        landingPageUrl: selectedLandingPage.url,
        introTitle: introTitle.trim(),
        introDescription: introDescription.trim(),
        introVideoName: introVideo?.name,
        videoPrompt: videoPrompt.trim(),
        maximumVideoLengthSeconds: Number(maximumVideoLength),
        videoOrientation,
        tags,
        applyDefaultBranding,
      },
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
            <p className="amp-drawer__subtitle">Configure the video experience employees will receive.</p>
          </div>
          <button type="button" className="amp-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="amp-drawer__body amp-video-request">
          <section className="amp-video-request__section">
            <label className="amp-field amp-field--compact" htmlFor="amp-video-request-name">
              <span className="amp-video-request__label-row">
                <span>
                  Request Name <span className="cs-required">*</span>
                </span>
                <span className="amp-video-request__counter">
                  {requestName.length} / {MAX_REQUEST_NAME}
                </span>
              </span>
              <span className="amp-video-request__help">This name will be attached to each video file</span>
              <input
                id="amp-video-request-name"
                value={requestName}
                maxLength={MAX_REQUEST_NAME}
                onChange={(event) => setRequestName(event.target.value)}
                placeholder="e.g. Marketing Testimonials"
              />
            </label>
          </section>

          <section className="amp-video-request__section amp-video-request__grid">
            <div className="amp-field amp-field--compact">
              <span className="amp-video-request__field-title">
                Locale <span className="cs-required">*</span>
              </span>
              <span className="amp-video-request__help">Select the site’s locale for the request</span>
              <UiDropdown
                value={locale}
                options={localeOptions}
                onChange={setLocale}
                placeholder={tenantOptionsLoading ? "Loading locales…" : "Select Locale"}
                ariaLabel="Locale"
                disabled={tenantOptionsLoading || !localeOptions.length}
              />
            </div>
            <div className="amp-field amp-field--compact">
              <span className="amp-video-request__field-title">
                Persona <span className="cs-required">*</span>
              </span>
              <span className="amp-video-request__help">Select a persona for the request</span>
              <UiDropdown
                value={persona}
                options={personaOptions}
                onChange={setPersona}
                placeholder={tenantOptionsLoading ? "Loading personas…" : "Select Persona"}
                ariaLabel="Persona"
                disabled={tenantOptionsLoading || !personaOptions.length}
              />
            </div>
          </section>

          <section className="amp-video-request__section">
            <div className="amp-field amp-field--compact">
              <span className="amp-video-request__field-title">
                Landing page <span className="cs-required">*</span>
              </span>
              <span className="amp-video-request__help">Select the landing page for the request</span>
              <UiDropdown
                value={landingPageId}
                options={landingPageOptions}
                onChange={setLandingPageId}
                placeholder={
                  pagesLoading
                    ? "Loading pages…"
                    : locale && persona
                      ? "Select Link"
                      : "Select Locale and Persona first"
                }
                ariaLabel="Landing page"
                disabled={!locale || !persona || pagesLoading || !landingPageOptions.length}
              />
            </div>
          </section>

          <section className="amp-video-request__section">
            <div className="amp-video-request__section-heading">
              <h3>Intro text</h3>
              <p>Personalize your intro text to encourage participants to respond.</p>
            </div>
            <label className="amp-field amp-field--compact" htmlFor="amp-video-intro-title">
              <span className="amp-video-request__label-row">
                <span>Title <span className="cs-required">*</span></span>
                <span className="amp-video-request__counter">
                  {introTitle.length} / {MAX_INTRO_TITLE}
                </span>
              </span>
              <input
                id="amp-video-intro-title"
                value={introTitle}
                maxLength={MAX_INTRO_TITLE}
                onChange={(event) => setIntroTitle(event.target.value)}
              />
            </label>
            <label className="amp-field amp-field--compact" htmlFor="amp-video-intro-description">
              <span className="amp-video-request__label-row">
                <span>Description <span className="cs-required">*</span></span>
                <span className="amp-video-request__counter">
                  {introDescription.length} / {MAX_INTRO_DESCRIPTION}
                </span>
              </span>
              <textarea
                id="amp-video-intro-description"
                rows={4}
                value={introDescription}
                maxLength={MAX_INTRO_DESCRIPTION}
                onChange={(event) => setIntroDescription(event.target.value)}
              />
            </label>
          </section>

          <section className="amp-video-request__section">
            <span className="amp-video-request__field-title">
              Intro video <span className="amp-optional">(optional)</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,.mp4"
              className="amp-video-request__file-input"
              onChange={handleIntroVideo}
            />
            <button
              type="button"
              className={`amp-video-request__upload${introVideo ? " has-file" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <strong>{introVideo ? introVideo.name : "Select video files"}</strong>
              <span>{introVideo ? "Choose a different MP4 file" : "Vertical video recommended · Supported: MP4"}</span>
            </button>
            {introVideo && (
              <button
                type="button"
                className="amp-video-request__remove-file"
                onClick={() => {
                  setIntroVideo(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove video
              </button>
            )}
          </section>

          <section className="amp-video-request__section">
            <label className="amp-field amp-field--compact" htmlFor="amp-video-prompt">
              Video Prompt <span className="cs-required">*</span>
              <span className="amp-video-request__help">
                Write a question or topic you want the recipient to talk about.
              </span>
              <input
                id="amp-video-prompt"
                value={videoPrompt}
                onChange={(event) => setVideoPrompt(event.target.value)}
                placeholder="e.g. Tell us about your role in our company"
              />
            </label>
          </section>

          <section className="amp-video-request__section amp-video-request__grid">
            <div className="amp-field amp-field--compact">
              <span className="amp-video-request__field-title">
                Maximum Video Length <span className="cs-required">*</span>
              </span>
              <span className="amp-video-request__help">Set a time limit for the video</span>
              <UiDropdown
                value={maximumVideoLength}
                options={VIDEO_LENGTH_OPTIONS}
                onChange={setMaximumVideoLength}
                placeholder="Select Video Length"
                ariaLabel="Maximum Video Length"
              />
            </div>
            <div className="amp-field amp-field--compact">
              <span className="amp-video-request__field-title">
                Video Orientation <span className="cs-required">*</span>
              </span>
              <span className="amp-video-request__help">Choose the format for the recorded video</span>
              <UiDropdown
                value={videoOrientation}
                options={VIDEO_ORIENTATION_OPTIONS}
                onChange={setVideoOrientation}
                ariaLabel="Video Orientation"
              />
            </div>
          </section>

          <section className="amp-video-request__section">
            <label className="amp-field amp-field--compact" htmlFor="amp-video-tags">
              Tags <span className="amp-optional">(optional)</span>
              <span className="amp-video-request__help">
                Tags make content easier to sort, search, and personalize.
              </span>
              <div className="amp-video-request__tag-input">
                <input
                  id="amp-video-tags"
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g. Marketing, Career Growth, Diversity"
                />
                <button type="button" onClick={addTag} disabled={!tagDraft.trim()}>
                  + Add
                </button>
              </div>
            </label>
            {tags.length > 0 && (
              <div className="amp-video-request__tags" aria-label="Added tags">
                {tags.map((tag) => (
                  <span key={tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="amp-video-request__section">
            <span className="amp-video-request__field-title">Branding</span>
            <label className="amp-video-request__branding">
              <input
                type="checkbox"
                checked={applyDefaultBranding}
                onChange={(event) => setApplyDefaultBranding(event.target.checked)}
              />
              <span>Apply default branding to all videos.</span>
              <button
                type="button"
                onClick={() =>
                  setBrandingMessage("Default branding configuration is not available in Campaign Studio yet.")
                }
              >
                Configure default branding
              </button>
            </label>
          </section>

          {(tenantOptionsError || brandingMessage) && (
            <p className="amp-video-request__status" role="status" aria-live="polite">
              {tenantOptionsError || brandingMessage}
            </p>
          )}
        </div>

        <footer className="amp-drawer__footer">
          <button type="button" className="cs-btn cs-btn--secondary-ghost" onClick={onClose}>
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
