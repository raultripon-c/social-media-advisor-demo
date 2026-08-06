import React, { useEffect } from "react";
import { channelLabel, statusLabel } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

interface PackDrawerProps {
  pack: SharePack | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSend: (id: string) => void;
}

export const PackDrawer: React.FC<PackDrawerProps> = ({ pack, onClose, onApprove, onSend }) => {
  useEffect(() => {
    if (!pack) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pack, onClose]);

  if (!pack) return null;

  const canApprove = pack.status === "needs_approval";
  const canSend = pack.status === "draft" || pack.status === "needs_approval" || pack.status === "ready";

  return (
    <>
      <button type="button" className="amp-drawer-backdrop" aria-label="Close drawer" onClick={onClose} />
      <aside className="amp-drawer" role="dialog" aria-modal="true" aria-labelledby="amp-drawer-title">
        <header className="amp-drawer__header">
          <div>
            <p className={`amp-pack-badge amp-pack-badge--${pack.status}`}>{statusLabel[pack.status]}</p>
            <h2 id="amp-drawer-title">{pack.title}</h2>
            <p className="amp-drawer__subtitle">{pack.subtitle}</p>
          </div>
          <button type="button" className="amp-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="amp-drawer__body">
          <div className={`amp-drawer__media${pack.mediaType === "video" ? " is-video" : ""}`}>
            <img src={pack.thumbnailUrl} alt="" />
            {pack.mediaType === "video" && (
              <span className="amp-pack-card__media-type amp-pack-card__media-type--lg" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4.5v7l6-3.5-6-3.5z" fill="currentColor" />
                </svg>
              </span>
            )}
          </div>

          <section>
            <h3>Captions</h3>
            <ul className="amp-caption-list">
              {pack.captions.map((caption) => (
                <li key={caption.id}>{caption.text}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Hiring CTA</h3>
            <p className="amp-drawer__cta">
              <strong>{pack.ctaLabel}</strong>
              <a href={pack.ctaDestination} target="_blank" rel="noreferrer">
                {pack.ctaDestination}
              </a>
            </p>
            <p className="amp-drawer__utm">
              UTM preview: <code>{pack.utmPreview}</code>
            </p>
          </section>

          <section>
            <h3>Audience & channels</h3>
            <p>
              {pack.audienceLabel} · {pack.audienceCount} people
            </p>
            <p>{pack.channels.map((channel) => channelLabel[channel]).join(" · ")}</p>
          </section>

          <section>
            <h3>Source</h3>
            <p>
              {pack.source} · {pack.sourceLabel}
            </p>
          </section>

          {pack.metrics && (
            <section>
              <h3>Results</h3>
              <div className="amp-metrics-row">
                <span>
                  <strong>{pack.metrics.shares}</strong> shares
                </span>
                <span>
                  <strong>{pack.metrics.clicks}</strong> clicks
                </span>
                <span>
                  <strong>{pack.metrics.applications}</strong> apps
                </span>
                <span>
                  <strong>${(pack.metrics.emvUsd / 1000).toFixed(1)}k</strong> EMV
                </span>
              </div>
            </section>
          )}
        </div>

        <footer className="amp-drawer__footer">
          <button type="button" className="cs-btn cs-btn--secondary" onClick={onClose}>
            Close
          </button>
          {canApprove && (
            <button type="button" className="cs-btn cs-btn--secondary" onClick={() => onApprove(pack.id)}>
              Approve
            </button>
          )}
          {canSend && (
            <button type="button" className="cs-btn cs-btn--primary" onClick={() => onSend(pack.id)}>
              Send
            </button>
          )}
        </footer>
      </aside>
    </>
  );
};
