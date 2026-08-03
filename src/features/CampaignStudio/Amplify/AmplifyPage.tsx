import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CampaignStudioSubNav } from "../ContentBoard/CampaignStudioSubNav";
import "../CampaignStudio.css";
import "../ContentBoard/ContentBoard.css";
import "./Amplify.css";
import { demoSharePacks } from "./amplifyData";
import { AmplifyCampaignSeed, AmplifyMode, SharePack } from "./amplifyTypes";
import { DispatchWizard } from "./DispatchWizard";
import { ImpactView } from "./ImpactView";
import { PackDrawer } from "./PackDrawer";
import { SharePacksView } from "./SharePacksView";

const VIEW_MODES: { id: Exclude<AmplifyMode, "dispatch">; label: string }[] = [
  { id: "packs", label: "Share Packs" },
  { id: "impact", label: "Impact" },
];

type AmplifyLocationState = {
  openAmplifyDispatch?: boolean;
  amplifyFromCampaign?: AmplifyCampaignSeed;
} | null;

export const AmplifyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AmplifyMode>("packs");
  const [packs, setPacks] = useState<SharePack[]>(() => demoSharePacks);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [campaignSeed, setCampaignSeed] = useState<AmplifyCampaignSeed | null>(null);

  const needsApprovalCount = useMemo(
    () => packs.filter((pack) => pack.status === "needs_approval").length,
    [packs],
  );
  const activePack = packs.find((pack) => pack.id === activePackId) || null;

  useEffect(() => {
    const state = location.state as AmplifyLocationState;
    if (!state?.openAmplifyDispatch) return;
    setCampaignSeed(state.amplifyFromCampaign || null);
    setMode("dispatch");
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const approvePacks = (ids: string[]) => {
    setPacks((current) =>
      current.map((pack) =>
        ids.includes(pack.id) && pack.status === "needs_approval" ? { ...pack, status: "ready" } : pack,
      ),
    );
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    if (activePackId && ids.includes(activePackId)) setActivePackId(null);
    showToast(ids.length > 1 ? `${ids.length} packs approved` : "Pack approved");
  };

  const sendPacks = (ids: string[]) => {
    const now = new Date().toISOString();
    setPacks((current) =>
      current.map((pack) => {
        if (!ids.includes(pack.id)) return pack;
        if (pack.status !== "needs_approval" && pack.status !== "ready") return pack;
        return {
          ...pack,
          status: "sent",
          sentAt: now,
          metrics: pack.metrics || { shares: 12, clicks: 48, applications: 1, emvUsd: 900 },
          channels: pack.channels.includes("email") ? pack.channels : [...pack.channels, "email"],
        };
      }),
    );
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    if (activePackId && ids.includes(activePackId)) setActivePackId(null);
    showToast(ids.length > 1 ? `${ids.length} packs sent` : "Pack sent");
  };

  const leaveDispatch = () => {
    setCampaignSeed(null);
    setMode("packs");
  };

  const handleDispatchSend = (pack: SharePack) => {
    setPacks((current) => [pack, ...current]);
    leaveDispatch();
    showToast("Share pack sent");
  };

  const handleDispatchDraft = (pack: SharePack) => {
    setPacks((current) => [pack, ...current]);
    leaveDispatch();
    showToast("Draft saved");
  };

  return (
    <main className="campaign-studio amplify-page">
      <header className="cs-page-header">
        <div>
          <h1>Social Media Advisor</h1>
          <CampaignStudioSubNav />
        </div>
      </header>

      <section className="cb-toolbar">
        <div className="amp-toolbar__row">
          <div className="cb-toolbar__title-block">
            <div className="cb-toolbar__title-row">
              <h2>Amplify</h2>
              {needsApprovalCount > 0 && (
                <span className="cb-toolbar__badge">{needsApprovalCount} to approve</span>
              )}
            </div>
            <p className="cb-toolbar__description">
              Turn approved stories into employee share packs — then measure organic reach.
            </p>
          </div>
        </div>

        {mode !== "dispatch" && (
          <div className="cs-switch-button" role="tablist" aria-label="Amplify modes">
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
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="amp-canvas">
        {mode === "packs" && (
          <SharePacksView
            packs={packs}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onClearSelection={() => setSelectedIds([])}
            onOpen={(pack) => setActivePackId(pack.id)}
            onApprove={approvePacks}
            onSend={sendPacks}
            onCreate={() => {
              setCampaignSeed(null);
              setMode("dispatch");
            }}
          />
        )}
        {mode === "dispatch" && (
          <DispatchWizard
            campaignSeed={campaignSeed}
            onCancel={leaveDispatch}
            onSend={handleDispatchSend}
            onSaveDraft={handleDispatchDraft}
          />
        )}
        {mode === "impact" && <ImpactView packs={packs} />}
      </section>

      <PackDrawer
        pack={activePack}
        onClose={() => setActivePackId(null)}
        onApprove={(id) => approvePacks([id])}
        onSend={(id) => sendPacks([id])}
      />

      {toast && (
        <div className="amp-toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
};
