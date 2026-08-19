import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import downloadIcon from "../../../assets/svg/download.svg";
import infoIcon from "../../../assets/svg/info.svg";
import { getCampaignCreatorName } from "../campaignStudioData";
import { getCampaignStudioPaths } from "../ContentBoard/CampaignStudioSubNav";
import "../CampaignStudio.css";
import "./Amplify.css";
import { statusLabel } from "./amplifyData";
import { SharePack } from "./amplifyTypes";
import { getSharePackById, updateSharePack } from "./sharePackStorage";
import { downloadSharePackContentZip } from "./sharePackExport";

const EMV_PER_CLICK = 15.5;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const formatCount = (value: number) => value.toLocaleString("en-US");

const formatEmv = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const getPackTableStatus = (pack: SharePack) => {
  const classNameByStatus: Record<SharePack["status"], string> = {
    draft: "draft",
    needs_approval: "review",
    ready: "published",
    sent: "sent",
    archived: "completed",
  };
  return {
    label: statusLabel[pack.status],
    className: classNameByStatus[pack.status],
  };
};

const BackArrowIcon = () => (
  <svg className="cs-back-edit__icon" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
    <path
      d="M0.23125 6.54554C0.084375 6.40179 0 6.20804 0 6.00179C0 5.79554 0.084375 5.60179 0.23125 5.45804L5.73125 0.208037C6.03125 -0.0794632 6.50625 -0.0669631 6.79063 0.233037C7.075 0.533037 7.06563 1.00804 6.76562 1.29241L2.62188 5.25179H13.25C13.6656 5.25179 14 5.58616 14 6.00179C14 6.41741 13.6656 6.75179 13.25 6.75179H2.62188L6.76875 10.708C7.06875 10.9955 7.07812 11.4674 6.79375 11.7674C6.50937 12.0674 6.03438 12.0768 5.73438 11.7924L0.234375 6.54241L0.23125 6.54554Z"
      fill="currentColor"
    />
  </svg>
);

export const SharePackDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerCode, refnum, packId } = useParams();
  const paths = getCampaignStudioPaths(customerCode, refnum);

  const [pack, setPack] = useState<SharePack | null>(() => (packId ? getSharePackById(packId) || null : null));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!packId) return;
    setPack(getSharePackById(packId) || null);
  }, [packId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const packAssets = useMemo(() => {
    if (!pack) return [];
    if (pack.assets?.length) return pack.assets;
    return [{ src: pack.thumbnailUrl, kind: pack.mediaType, label: pack.title }];
  }, [pack]);

  const metrics = useMemo(() => {
    if (!pack) return [];
    const emptyRow = [
      { id: "shares", label: "Shares", value: "-" },
      { id: "clicks", label: "Clicks", value: "-" },
      { id: "apps", label: "Applies", value: "-" },
      {
        id: "emv",
        label: "Media value",
        value: "-",
        info: "Estimated Total EMV = Total Clicks × 15.50",
      },
    ];
    if (pack.status !== "sent" || !pack.metrics) return emptyRow;

    const mediaValue = pack.metrics.clicks * EMV_PER_CLICK;
    return [
      { id: "shares", label: "Shares", value: formatCount(pack.metrics.shares) },
      { id: "clicks", label: "Clicks", value: formatCount(pack.metrics.clicks) },
      { id: "apps", label: "Applies", value: formatCount(pack.metrics.applications) },
      {
        id: "emv",
        label: "Media value",
        value: formatEmv(mediaValue),
        info: "Estimated Total EMV = Total Clicks × 15.50",
      },
    ];
  }, [pack]);

  const canApprove = pack?.status === "needs_approval";
  const canSend = pack?.status === "draft" || pack?.status === "ready";
  const showWorkflowActions = canApprove || canSend;

  const handleApprove = () => {
    if (!pack) return;
    const next = updateSharePack(pack.id, (current) => ({ ...current, status: "ready" }));
    if (!next) return;
    setPack(next);
    setToast("Pack approved");
  };

  const handleSend = () => {
    if (!pack) return;
    const now = new Date().toISOString();
    const next = updateSharePack(pack.id, (current) => ({
      ...current,
      status: "sent",
      sentAt: now,
      metrics: current.metrics || { shares: 12, clicks: 48, applications: 1, emvUsd: 900 },
      channels: current.channels.includes("email") ? current.channels : [...current.channels, "email"],
    }));
    if (!next) return;
    setPack(next);
    setToast("Pack sent");
  };

  const handleDownload = async () => {
    if (!pack) return;
    await downloadSharePackContentZip(pack);
    setToast("Share pack content downloaded");
  };

  return (
    <main className="campaign-studio">
      <section className="cs-overview amp-pack-detail">
        <div className="cs-overview__topbar">
          <button type="button" className="cs-back-edit cs-overview__back" onClick={() => navigate(paths.employeeAdvocacy)}>
            <BackArrowIcon /> Back to Employee Advocacy
          </button>
        </div>

        {pack ? (
          <>
            <div className="cs-overview__header">
              <div>
                <div className="cs-overview__title-row">
                  <h1>{pack.title}</h1>
                  <span className={`cs-status cs-status--${getPackTableStatus(pack).className}`}>
                    {getPackTableStatus(pack).label}
                  </span>
                </div>
                <dl className="cs-overview__details">
                  <div>
                    <dt>Audience</dt>
                    <dd>{pack.audienceCount.toLocaleString("en-US")} employees</dd>
                  </div>
                  <div>
                    <dt>Destination link</dt>
                    <dd>
                      <a className="cs-overview-open-link" href={pack.ctaDestination} target="_blank" rel="noreferrer">
                        Open Link
                        <span className="cs-overview-open-link__icon" aria-hidden="true">
                          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M11.875 0.9375C11.875 1.45703 12.293 1.875 12.8125 1.875H16.8008L8.08594 10.5859C7.71875 10.9531 7.71875 11.5469 8.08594 11.9102C8.45312 12.2734 9.04687 12.2773 9.41016 11.9102L18.1211 3.19922L18.125 7.1875C18.125 7.70703 18.543 8.125 19.0625 8.125C19.582 8.125 20 7.70703 20 7.1875V0.9375C20 0.417969 19.582 0 19.0625 0H12.8125C12.293 0 11.875 0.417969 11.875 0.9375ZM2.8125 1.25C1.25781 1.25 0 2.50781 0 4.0625V17.1875C0 18.7422 1.25781 20 2.8125 20H15.9375C17.4922 20 18.75 18.7422 18.75 17.1875V12.1875C18.75 11.668 18.332 11.25 17.8125 11.25C17.293 11.25 16.875 11.668 16.875 12.1875V17.1875C16.875 17.707 16.457 18.125 15.9375 18.125H2.8125C2.29297 18.125 1.875 17.707 1.875 17.1875V4.0625C1.875 3.54297 2.29297 3.125 2.8125 3.125H7.8125C8.33203 3.125 8.75 2.70703 8.75 2.1875C8.75 1.66797 8.33203 1.25 7.8125 1.25H2.8125Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Creator</dt>
                    <dd>{pack.createdByName || getCampaignCreatorName()}</dd>
                  </div>
                  <div>
                    <dt>Created date</dt>
                    <dd>{formatDate(pack.createdAt)}</dd>
                  </div>
                  {pack.sentAt && (
                    <div>
                      <dt>Sent date</dt>
                      <dd>{formatDate(pack.sentAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="cs-overview__actions">
                <button
                  type="button"
                  className={`cs-btn ${showWorkflowActions ? "cs-btn--secondary" : "cs-btn--primary"}`}
                  onClick={handleDownload}
                >
                  <img src={downloadIcon} alt="" /> Download all content as zip
                </button>
                {canApprove && (
                  <button type="button" className="cs-btn cs-btn--secondary" onClick={handleApprove}>
                    Approve
                  </button>
                )}
                {canSend && (
                  <button type="button" className="cs-btn cs-btn--primary" onClick={handleSend}>
                    Send now
                  </button>
                )}
              </div>
            </div>

            <div className="amp-kpi-row amp-pack-detail__metrics">
              {metrics.map((kpi) => (
                <article key={kpi.id} className="amp-kpi">
                  <p className="amp-kpi__label">
                    <span>{kpi.label}</span>
                    {"info" in kpi && kpi.info ? (
                      <span className="amp-kpi__info" tabIndex={0} aria-label={kpi.info}>
                        <img src={infoIcon} alt="" width={14} height={14} />
                        <span className="amp-kpi__tooltip" role="tooltip">
                          {kpi.info}
                        </span>
                      </span>
                    ) : null}
                  </p>
                  <strong>{kpi.value}</strong>
                </article>
              ))}
            </div>

            <section className="cs-overview-assets amp-pack-detail__content">
              <div className="amp-pack-detail__content-grid">
                <div className="amp-pack-detail__content-column">
                  <h2>Pack assets</h2>
                  <div className="amp-pack-detail__asset-grid">
                    {packAssets.map((asset) => (
                      <article key={`${asset.label}-${asset.src}`} className="amp-pack-detail__asset">
                        <div className={`amp-pack-detail__asset-media${asset.kind === "video" ? " is-video" : ""}`}>
                          {asset.kind === "video" ? (
                            <video src={asset.src} playsInline preload="metadata" muted />
                          ) : (
                            <img src={asset.src} alt="" />
                          )}
                          {asset.kind === "video" && <span className="amp-pack-detail__asset-badge">Video</span>}
                        </div>
                        <p>{asset.label}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="amp-pack-detail__content-column">
                  <h2>Share captions</h2>
                  <ul className="amp-caption-list amp-caption-list--detail">
                    {pack.captions.map((caption) => (
                      <li key={caption.id}>{caption.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="cs-overview-assets amp-pack-detail__tracking">
              <div className="cs-overview-assets__header amp-pack-detail__tracking-header">
                <h2>Tracking</h2>
              </div>
              <code className="amp-pack-detail__utm">{pack.utmPreview}</code>
            </section>
          </>
        ) : (
          <div className="cs-overview-card">
            <h2>Share pack not found</h2>
            <p>Go back to Employee Advocacy and select a pack from the table.</p>
            <button type="button" className="cs-btn cs-btn--secondary" onClick={() => navigate(paths.employeeAdvocacy)}>
              Back to Employee Advocacy
            </button>
          </div>
        )}
      </section>

      {toast && (
        <div className="amp-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
};
