import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import enhanceIcon from "../../../assets/svg/enhanceIcon.svg";
import generateIcon from "../../../assets/svg/arrow-up-plain.svg";
import { CampaignStudioSubNav, getCampaignStudioPaths } from "../ContentBoard/CampaignStudioSubNav";
import "../CampaignStudio.css";
import "../ContentBoard/ContentBoard.css";
import "./Amplify.css";
import { dispatchTemplates, isVideoRequest } from "./amplifyData";
import { AmplifyCampaignSeed, AmplifyMode, DispatchTemplate, SharePack } from "./amplifyTypes";
import { DispatchWizard } from "./DispatchWizard";
import { SharePackGenerating } from "./SharePackGenerating";
import { SharePacksView } from "./SharePacksView";
import { VideoRequestDrawer } from "./VideoRequestDrawer";
import { VideoRequestsView } from "./VideoRequestsView";
import { loadSharePacks, saveSharePacks } from "./sharePackStorage";

const ENHANCE_SUFFIX =
  " Keep the tone warm, concise, and shareable for LinkedIn and email. Include a clear call to action.";

const templatePrompt = (item: DispatchTemplate) => item.prompt;

const AmpTemplateIcon = ({ type }: { type: DispatchTemplate["icon"] }) => {
  if (type === "user") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 8.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.2 14c.5-2.5 2.3-4 4.8-4s4.3 1.5 4.8 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M4.5 2v2.2M11.5 2v2.2M3 5.5h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
        <path d="M3.2 3.5h9.6c.7 0 1.2.5 1.2 1.2v7.6c0 .7-.5 1.2-1.2 1.2H3.2c-.7 0-1.2-.5-1.2-1.2V4.7c0-.7.5-1.2 1.2-1.2Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "bolt") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8.9 1.8 3.8 8.7h3.4l-.3 5.5 5.3-7.2H8.8l.1-5.2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "sparkle") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 1.8 9.4 6 13.6 8l-4.2 2L8 14.2 6.6 10 2.4 8l4.2-2L8 1.8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="6.2" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.4v3.6M6.2 6.2h3.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      <path d="M5.6 9.4 4.4 14.2 8 12.4l3.6 1.8-1.2-4.8" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
};

type AmplifyLocationState = {
  openAmplifyDispatch?: boolean;
  amplifyFromCampaign?: AmplifyCampaignSeed;
} | null;

export const AmplifyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const paths = getCampaignStudioPaths(customerCode, refnum);
  const promptBoxRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<AmplifyMode>("packs");
  const [packs, setPacks] = useState<SharePack[]>(() => loadSharePacks());
  const [toast, setToast] = useState<string | null>(null);
  const [campaignSeed, setCampaignSeed] = useState<AmplifyCampaignSeed | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [dispatchBrief, setDispatchBrief] = useState<string | null>(null);
  const [dispatchTemplateId, setDispatchTemplateId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [videoRequestOpen, setVideoRequestOpen] = useState(false);

  const sharePacks = useMemo(() => packs.filter((pack) => !isVideoRequest(pack)), [packs]);
  const videoRequests = useMemo(() => packs.filter(isVideoRequest), [packs]);

  useEffect(() => {
    saveSharePacks(packs);
  }, [packs]);

  useEffect(() => {
    if (location.pathname.endsWith("/employee-advocacy") || location.pathname.endsWith("/amplify")) {
      setPacks(loadSharePacks());
    }
  }, [location.pathname]);

  useEffect(() => {
    const state = location.state as AmplifyLocationState;
    if (!state?.openAmplifyDispatch) return;
    setCampaignSeed(state.amplifyFromCampaign || null);
    setDispatchBrief(null);
    setDispatchTemplateId(null);
    setMode("dispatch");
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const canSendStatus = (status: SharePack["status"]) => status === "draft" || status === "ready";

  const sendPacks = (ids: string[]) => {
    const eligible = packs.filter((pack) => ids.includes(pack.id) && canSendStatus(pack.status));
    if (eligible.length === 0) {
      showToast("No packs ready to send");
      return;
    }
    const eligibleIds = eligible.map((pack) => pack.id);
    const now = new Date().toISOString();
    setPacks((current) =>
      current.map((pack) => {
        if (!eligibleIds.includes(pack.id)) return pack;
        return {
          ...pack,
          status: "sent",
          sentAt: now,
          metrics: pack.metrics || { shares: 12, clicks: 48, applications: 1, emvUsd: 900 },
          channels: pack.channels.includes("email") ? pack.channels : [...pack.channels, "email"],
        };
      }),
    );
    showToast(eligibleIds.length > 1 ? `${eligibleIds.length} packs sent` : "Pack sent");
  };

  const leaveDispatch = (options?: { returnToCampaigns?: boolean }) => {
    const returnToCampaigns = options?.returnToCampaigns ?? false;
    setCampaignSeed(null);
    setDispatchBrief(null);
    setDispatchTemplateId(null);
    setIsGenerating(false);
    if (returnToCampaigns) {
      navigate(paths.campaigns);
      return;
    }
    setMode("packs");
  };

  const backToBrief = (brief: string, templateId: string | null) => {
    setPrompt(brief);
    setSelectedTemplateId(templateId);
    setCampaignSeed(null);
    setDispatchBrief(null);
    setDispatchTemplateId(null);
    setIsGenerating(false);
    setMode("packs");
  };

  const startDispatchFromBrief = (brief: string, templateId: string | null = selectedTemplateId) => {
    const trimmed = brief.trim();
    if (!trimmed) return;
    setCampaignSeed(null);
    setDispatchBrief(trimmed);
    setDispatchTemplateId(templateId);
    setIsGenerating(true);
  };

  const finishGenerating = () => {
    setIsGenerating(false);
    setMode("dispatch");
  };

  const cancelGenerating = () => {
    setIsGenerating(false);
    // Keep prompt/template filled on the main page
    setMode("packs");
  };

  const selectTemplate = (item: DispatchTemplate) => {
    setSelectedTemplateId(item.id);
    setPrompt(templatePrompt(item));
  };

  const enhancePrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    if (trimmed.includes("Keep the tone warm, concise, and shareable")) {
      showToast("Brief is already enhanced");
      return;
    }
    setPrompt(`${trimmed.replace(/\s+$/, "")}${trimmed.endsWith(".") ? "" : "."}${ENHANCE_SUFFIX}`);
    showToast("Brief enhanced");
  };

  const handleDispatchSend = (pack: SharePack) => {
    setPacks((current) => [pack, ...current]);
    leaveDispatch();
    setPrompt("");
    setSelectedTemplateId(null);
    showToast("Share pack sent");
  };

  const handleDispatchDraft = (pack: SharePack) => {
    setPacks((current) => [pack, ...current]);
    leaveDispatch();
    setPrompt("");
    setSelectedTemplateId(null);
    showToast("Draft saved");
  };

  const handleVideoRequestSend = (pack: SharePack) => {
    setPacks((current) => [pack, ...current]);
    setVideoRequestOpen(false);
    showToast("Video request sent");
  };

  const handleCreateSharePackFromRequest = (request: SharePack) => {
    const details = request.videoRequest;
    const brief = details
      ? `Create an employee advocacy share pack from the "${request.title}" video request. Video prompt: ${details.videoPrompt}. Landing page: ${details.landingPageLabel}.`
      : `Create a share pack from the "${request.title}" video request.`;
    startDispatchFromBrief(brief);
  };

  const handleDeleteVideoRequest = (requestId: string) => {
    setPacks((current) => current.filter((pack) => pack.id !== requestId));
    showToast("Video request deleted");
  };

  const isWizardFlow = isGenerating || mode === "dispatch";
  const wizardClassName = isGenerating ? "campaign-studio--wizard campaign-studio--generating-wizard" : "campaign-studio--wizard";

  return (
    <main className={`campaign-studio ${isWizardFlow ? wizardClassName : "amplify-page"}`}>
      {!isWizardFlow && (
        <header className="cs-page-header">
          <div>
            <h1>Social Media Advisor</h1>
            <CampaignStudioSubNav />
          </div>
        </header>
      )}

      {isGenerating ? (
        <SharePackGenerating onDone={finishGenerating} onExit={cancelGenerating} />
      ) : mode === "dispatch" ? (
        <DispatchWizard
          campaignSeed={campaignSeed}
          initialBrief={dispatchBrief}
          initialTemplateId={dispatchTemplateId}
          onCancel={() => leaveDispatch({ returnToCampaigns: Boolean(campaignSeed) })}
          onBackToBrief={backToBrief}
          onSend={handleDispatchSend}
          onSaveDraft={handleDispatchDraft}
        />
      ) : (
        <>
          <section className="cs-prompt-panel amp-generate-panel">
            <h2>Generate share pack</h2>
            <div className="cs-prompt-box">
              {!prompt.trim() && !isPromptFocused && (
                <p className="cs-prompt-tip">
                  Tip: Start with which employees will share the pack, what the pack should promote, your link, and the tone you want for the generated share pack.
                </p>
              )}
              <textarea
                ref={promptBoxRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onFocus={() => setIsPromptFocused(true)}
                onBlur={() => setIsPromptFocused(false)}
                placeholder=""
                aria-label="Describe the share pack you need"
              />
              <div className="cs-prompt-actions">
                <button
                  type="button"
                  className="cs-enhance"
                  disabled={!prompt.trim()}
                  onClick={enhancePrompt}
                  title="Polish your brief for employee sharing"
                >
                  <img src={enhanceIcon} alt="" /> Enhance with X+
                </button>
                <button
                  type="button"
                  className="cs-generate-icon"
                  disabled={!prompt.trim()}
                  aria-label="Continue with this brief"
                  onClick={() => startDispatchFromBrief(prompt)}
                >
                  <img src={generateIcon} alt="" />
                </button>
              </div>
            </div>
            <h3>Or start with a template</h3>
            <div className="cs-template-grid">
              {dispatchTemplates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cs-template-card${selectedTemplateId === item.id ? " is-selected" : ""}`}
                  title={item.description}
                  onClick={() => selectTemplate(item)}
                >
                  <AmpTemplateIcon type={item.icon} />
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
          </section>

          <VideoRequestsView
            requests={videoRequests}
            onRequestVideo={() => setVideoRequestOpen(true)}
            onCreateSharePack={handleCreateSharePackFromRequest}
            onDelete={handleDeleteVideoRequest}
          />

          <section className="amp-canvas">
            <SharePacksView packs={sharePacks} onSend={sendPacks} />
          </section>
        </>
      )}

      <VideoRequestDrawer
        open={videoRequestOpen}
        onClose={() => setVideoRequestOpen(false)}
        onSend={handleVideoRequestSend}
      />

      {toast && (
        <div className="amp-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
};
