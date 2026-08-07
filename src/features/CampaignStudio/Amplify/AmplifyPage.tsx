import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import enhanceIcon from "../../../assets/svg/enhanceIcon.svg";
import generateIcon from "../../../assets/svg/arrow-up-plain.svg";
import { CampaignStudioSubNav, getCampaignStudioPaths } from "../ContentBoard/CampaignStudioSubNav";
import "../CampaignStudio.css";
import "../ContentBoard/ContentBoard.css";
import "./Amplify.css";
import { demoSharePacks, dispatchTemplates } from "./amplifyData";
import { AmplifyCampaignSeed, AmplifyMode, DispatchTemplate, SharePack } from "./amplifyTypes";
import { DispatchWizard } from "./DispatchWizard";
import { ImpactView } from "./ImpactView";
import { PackDrawer } from "./PackDrawer";
import { SharePackGenerating } from "./SharePackGenerating";
import { SharePacksView } from "./SharePacksView";
import { VideoRequestDrawer } from "./VideoRequestDrawer";

const ENHANCE_SUFFIX =
  " Keep the tone warm, concise, and shareable for LinkedIn and email. Include a clear call to action.";

const VIEW_MODES: { id: Exclude<AmplifyMode, "dispatch">; label: string }[] = [
  { id: "packs", label: "Share Packs" },
  { id: "impact", label: "Impact" },
];

const templatePrompt = (item: DispatchTemplate) => item.prompt;

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
  const [packs, setPacks] = useState<SharePack[]>(() => demoSharePacks);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [campaignSeed, setCampaignSeed] = useState<AmplifyCampaignSeed | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [dispatchBrief, setDispatchBrief] = useState<string | null>(null);
  const [dispatchTemplateId, setDispatchTemplateId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoRequestOpen, setVideoRequestOpen] = useState(false);

  const needsApprovalCount = useMemo(
    () => packs.filter((pack) => pack.status === "needs_approval").length,
    [packs],
  );
  const activePack = packs.find((pack) => pack.id === activePackId) || null;

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

  const canSendStatus = (status: SharePack["status"]) =>
    status === "draft" || status === "needs_approval" || status === "ready";

  const approvePacks = (ids: string[]) => {
    const eligible = packs.filter((pack) => ids.includes(pack.id) && pack.status === "needs_approval");
    if (eligible.length === 0) {
      showToast("No packs need approval");
      return;
    }
    const eligibleIds = eligible.map((pack) => pack.id);
    setPacks((current) =>
      current.map((pack) =>
        eligibleIds.includes(pack.id) ? { ...pack, status: "ready" } : pack,
      ),
    );
    if (activePackId && eligibleIds.includes(activePackId)) setActivePackId(null);
    showToast(eligibleIds.length > 1 ? `${eligibleIds.length} packs approved` : "Pack approved");
  };

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
    if (activePackId && eligibleIds.includes(activePackId)) setActivePackId(null);
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
    showToast(
      pack.audienceCount > 1
        ? `Video request sent to ${pack.audienceCount.toLocaleString("en-US")} people`
        : "Video request sent",
    );
  };

  return (
    <main className="campaign-studio amplify-page">
      <header className="cs-page-header">
        <div>
          <h1>Social Media Advisor</h1>
          <CampaignStudioSubNav />
        </div>
      </header>

      {isGenerating ? (
        <SharePackGenerating onDone={finishGenerating} onExit={cancelGenerating} />
      ) : mode === "dispatch" ? (
        <section className="amp-wizard-shell">
          <DispatchWizard
            campaignSeed={campaignSeed}
            initialBrief={dispatchBrief}
            initialTemplateId={dispatchTemplateId}
            onCancel={() => leaveDispatch({ returnToCampaigns: Boolean(campaignSeed) })}
            onBackToBrief={backToBrief}
            onSend={handleDispatchSend}
            onSaveDraft={handleDispatchDraft}
          />
        </section>
      ) : (
        <>
          <section className="cs-prompt-panel amp-generate-panel">
            <h2>Generate share pack</h2>
            <div className="cs-prompt-box">
              <textarea
                ref={promptBoxRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="E.g. 'Share pack for our Backend Engineer and Product Designer roles. Highlight our remote-first culture and recent product launch. Link: careers.company.com. Tone: casual, like a teammate recommending the role — not corporate.' Mention who's sharing, what to highlight, your link, and the tone — the more specific, the better the result."
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
            <div className="amp-template-grid">
              {dispatchTemplates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`amp-template-card${selectedTemplateId === item.id ? " is-selected" : ""}`}
                  onClick={() => selectTemplate(item)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <em>{item.audienceHint}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="amp-canvas">
            <div className="amp-canvas__header">
              <div className="cs-switch-button" role="tablist" aria-label="Employee Advocacy modes">
                {VIEW_MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === item.id}
                    className={mode === item.id ? "is-active" : ""}
                    onClick={() => setMode(item.id)}
                  >
                    {item.label}
                    {item.id === "packs" && needsApprovalCount > 0 ? (
                      <span className="amp-mode-badge">{needsApprovalCount}</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="cs-btn cs-btn--primary amp-canvas__cta"
                onClick={() => {
                  setActivePackId(null);
                  setVideoRequestOpen(true);
                }}
              >
                Request a video
              </button>
            </div>

            {mode === "packs" && (
              <SharePacksView
                packs={packs}
                onOpen={(pack) => setActivePackId(pack.id)}
                onSend={sendPacks}
              />
            )}
            {mode === "impact" && <ImpactView packs={packs} />}
          </section>
        </>
      )}

      <PackDrawer
        pack={activePack}
        onClose={() => setActivePackId(null)}
        onApprove={(id) => approvePacks([id])}
        onSend={(id) => sendPacks([id])}
      />

      <VideoRequestDrawer
        open={videoRequestOpen}
        onClose={() => setVideoRequestOpen(false)}
        onSend={handleVideoRequestSend}
      />

      {toast && (
        <div className="amp-toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
};
