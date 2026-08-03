import React, { useEffect, useState } from "react";
import { advisorBoardAdapter, contentTypeLabel } from "../ContentBoard/contentBoardData";
import { AdvisorCard, CampaignInfo } from "../ContentBoard/contentBoardTypes";
import { VIDEO_HUB_UPLOAD_DELAY_MS } from "../ContentBoard/videoHubData";
import { VideoHubBuilder } from "../ContentBoard/VideoHubBuilder";
import "./Nudges.css";

interface EmployerBrandSignalsProps {
  refNum: string;
  onUseMedia: (card: AdvisorCard) => void;
  onUseTestimonialReady: (card: AdvisorCard) => void;
}

const badgeClass = (card: AdvisorCard) => {
  if (card.status === "ready_for_campaign") return "ready";
  if (card.status === "awaiting_uploads") return "awaiting";
  if (card.accent === "yellow") return "testimonial";
  if (card.contentType === "Award") return "award";
  return "mention";
};

const badgeLabel = (card: AdvisorCard) => {
  if (card.status === "ready_for_campaign") return "Ready";
  if (card.status === "awaiting_uploads") return "Awaiting";
  return contentTypeLabel[card.contentType];
};

/** Short, scannable headline — one line where possible, two max */
const nudgeLead = (card: AdvisorCard) => {
  if (card.source === "testimonial") {
    if (card.status === "ready_for_campaign") {
      const count = card.campaignInfo?.videos?.length || 0;
      return count === 1 ? "1 video ready to launch" : `${count || "New"} videos ready to launch`;
    }
    if (card.status === "awaiting_uploads") {
      const count = card.campaignInfo?.recipients?.length || 0;
      return count > 0 ? `Waiting on ${count} video${count === 1 ? "" : "s"}` : "Waiting for uploads";
    }
    if (card.title.toLowerCase().includes("marcus")) return "Marcus hit 5 years. Request a testimonial?";
    if (card.title.toLowerCase().includes("applications") || card.title.toLowerCase().includes("slowed"))
      return "Apps slowed in Raleigh. Feature a local teammate?";
    if (card.title.toLowerCase().includes("priya") || card.title.toLowerCase().includes("intern"))
      return "Priya went from intern to RN. Share her story?";
    if (card.title.toLowerCase().includes("certification"))
      return "New Radiology certifications. Spotlight them?";
    if (card.title.toLowerCase().includes("daisy")) return "DAISY Award winner. Capture a story?";
    if (card.title.toLowerCase().includes("anniversary")) return "5 year story ready to publish";
    return card.title;
  }

  if (card.source === "media_listening") {
    if (card.contentType === "Award") {
      if (card.title.toLowerCase().includes("forbes") || card.title.toLowerCase().includes("new grads"))
        return "Forbes Best Employer for New Grads — not posted yet";
      if (card.title.toLowerCase().includes("diversity"))
        return "Workplace diversity recognition — not posted yet";
      if (card.title.toLowerCase().includes("magnet"))
        return "Nursing Magnet recognition — not posted yet";
      return "New award earned — not posted yet";
    }

    if (card.title.toLowerCase().includes("minimum wage") || card.title.toLowerCase().includes("$20"))
      return "Minimum wage raised to $20/hr — not amplified yet";
    if (card.title.toLowerCase().includes("homegrown") || card.title.toLowerCase().includes("$203"))
      return "$203M HomeGrown initiative — not shared yet";
    return "Positive brand coverage — not turned into a post yet";
  }

  return card.title;
};

export const EmployerBrandSignals: React.FC<EmployerBrandSignalsProps> = ({
  refNum,
  onUseMedia,
  onUseTestimonialReady,
}) => {
  const year = new Date().getFullYear();
  const [signals, setSignals] = useState<AdvisorCard[]>([]);
  const [previewCard, setPreviewCard] = useState<AdvisorCard | null>(null);
  const [videoHubCard, setVideoHubCard] = useState<AdvisorCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadSignals = async () => {
    const cards = await advisorBoardAdapter.listCards(refNum, year);
    const brand = cards
      .filter((card) => card.source === "media_listening" && card.status === "to_be_reviewed")
      .slice(0, 3);
    const testimonials = cards.filter((card) => card.source === "testimonial");
    const ready = testimonials.filter((card) => card.status === "ready_for_campaign");
    const suggested = testimonials
      .filter((card) => card.status === "to_be_reviewed")
      .slice(0, 2);
    const awaiting = testimonials.filter((card) => card.status === "awaiting_uploads");
    setSignals([...ready, ...brand, ...suggested, ...awaiting]);
  };

  useEffect(() => {
    void loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refNum]);

  useEffect(() => {
    const hasAwaiting = signals.some((card) => card.status === "awaiting_uploads");
    if (!hasAwaiting) return undefined;
    const handle = window.setInterval(() => {
      void loadSignals();
    }, Math.min(VIDEO_HUB_UPLOAD_DELAY_MS / 2, 2500));
    return () => window.clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals, refNum]);

  useEffect(() => {
    if (!toast) return undefined;
    const handle = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const handleDismiss = async (cardId: string) => {
    await advisorBoardAdapter.dismissCard(refNum, year, cardId);
    setSignals((current) => current.filter((card) => card.id !== cardId));
    if (previewCard?.id === cardId) setPreviewCard(null);
  };

  const handleVideoHubLaunch = async (campaignInfo: CampaignInfo) => {
    if (videoHubCard) {
      const updated = await advisorBoardAdapter.launchTestimonial(refNum, year, videoHubCard.id, campaignInfo);
      setSignals((current) => current.map((card) => (card.id === updated.id ? updated : card)));
    }
    setVideoHubCard(null);
    setToast("Request sent to Video Hub — waiting for uploads");
  };

  return (
    <section className="cs-nudges">
      <div className="cs-nudges__header">
        <h2>Today&apos;s employer brand signals</h2>
        <p>Opportunities ready to turn into posts</p>
      </div>

      {signals.length === 0 ? (
        <div className="cs-nudges__empty">
          <p>No new brand signals right now. Reviewed and dismissed items live on the Content Board.</p>
        </div>
      ) : (
        <ul className="cs-nudges__list">
          {signals.map((card) => {
            const isTestimonial = card.source === "testimonial";
            const isReady = card.status === "ready_for_campaign";
            const isAwaiting = card.status === "awaiting_uploads";
            const tone = badgeClass(card);
            const videos = isReady ? card.campaignInfo?.videos?.slice(0, 3) || [] : [];

            return (
              <li key={card.id} className={`cs-nudge cs-nudge--${tone}`}>
                <span className="cs-nudge__type">{badgeLabel(card)}</span>

                <p className="cs-nudge__lead" title={nudgeLead(card)}>
                  {nudgeLead(card)}
                </p>

                <div className="cs-nudge__meta">
                  {videos.length > 0 && (
                    <span className="cs-nudge__thumbs" aria-label="Uploaded videos">
                      {videos.map((video) => (
                        <img key={video.id} src={video.thumbnailUrl} alt="" />
                      ))}
                    </span>
                  )}

                  {card.sourceLabel && !isTestimonial && (
                    <a
                      className="cs-nudge__source"
                      href={card.sourceUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {card.sourceLabel}
                    </a>
                  )}

                  {isAwaiting ? (
                    <span className="cs-nudge__waiting">
                      <span className="cs-nudge__waiting-dot" aria-hidden="true" />
                      We&apos;ll notify you
                    </span>
                  ) : isTestimonial && isReady ? (
                    <button
                      type="button"
                      className="cs-nudge__action cs-nudge__action--strong"
                      onClick={() => onUseTestimonialReady(card)}
                    >
                      Configure campaign
                    </button>
                  ) : isTestimonial ? (
                    <button
                      type="button"
                      className="cs-nudge__action"
                      onClick={() => setVideoHubCard(card)}
                    >
                      Request video
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cs-nudge__action"
                      onClick={() => setPreviewCard(card)}
                    >
                      Preview prompt
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="cs-nudge__dismiss"
                  aria-label={`Dismiss ${badgeLabel(card)}`}
                  onClick={() => handleDismiss(card.id)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path
                      d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {previewCard && (
        <NudgeDraftPreview
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onUse={() => {
            const selected = previewCard;
            setPreviewCard(null);
            onUseMedia(selected);
          }}
        />
      )}

      <VideoHubBuilder
        open={Boolean(videoHubCard)}
        sourceCard={videoHubCard}
        onClose={() => setVideoHubCard(null)}
        onLaunch={handleVideoHubLaunch}
      />

      {toast && (
        <div className="cb-toast" role="status">
          <span className="cb-toast__check" aria-hidden="true">
            ✓
          </span>
          {toast}
        </div>
      )}
    </section>
  );
};

const NudgeDraftPreview: React.FC<{
  card: AdvisorCard;
  onClose: () => void;
  onUse: () => void;
}> = ({ card, onClose, onUse }) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button type="button" className="cs-nudge-preview-backdrop" aria-label="Close preview" onClick={onClose} />
      <div className="cs-nudge-preview" role="dialog" aria-modal="true" aria-labelledby="cs-nudge-preview-title">
        <header className="cs-nudge-preview__header">
          <div>
            <p className="cs-nudge-preview__eyebrow">Campaign prompt</p>
            <h3 id="cs-nudge-preview-title">{card.title}</h3>
          </div>
          <button type="button" className="cs-nudge-preview__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="cs-nudge-preview__body">
          <p className="cs-nudge-preview__draft">{card.copy}</p>
        </div>
        <footer className="cs-nudge-preview__footer">
          <button type="button" className="cs-btn cs-btn--secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="cs-btn cs-btn--primary" onClick={onUse}>
            Start Generating Campaign
          </button>
        </footer>
      </div>
    </>
  );
};
