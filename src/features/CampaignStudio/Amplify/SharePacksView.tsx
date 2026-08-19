import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharePackDetailPath } from "../ContentBoard/CampaignStudioSubNav";
import { ImpactKpiRow } from "./ImpactKpiRow";
import { statusLabel } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

interface SharePacksViewProps {
  packs: SharePack[];
  onSend: (ids: string[]) => void;
  onRequestVideo?: () => void;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

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

const PackMetricCell = ({
  pack,
  metric,
}: {
  pack: SharePack;
  metric: "shares" | "clicks" | "applications";
}) => {
  if (pack.status !== "sent" || !pack.metrics) {
    return <span className="cs-table-text cs-table-text--empty">-</span>;
  }

  const value = pack.metrics[metric];
  const conversionPercent =
    metric === "applications" && pack.metrics.clicks
      ? `${Math.round((value / pack.metrics.clicks) * 100)}%`
      : "";

  return (
    <div className="cs-table-metric">
      <span className="cs-table-metric__value-row">
        <span className="cs-table-metric__value">{value.toLocaleString()}</span>
        {conversionPercent ? <span className="cs-table-metric__conversion">({conversionPercent})</span> : null}
      </span>
    </div>
  );
};

export const SharePacksView: React.FC<SharePacksViewProps> = ({ packs, onSend, onRequestVideo }) => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const openPack = (pack: SharePack) => {
    navigate(getSharePackDetailPath(customerCode, refnum, pack.id));
  };

  useEffect(() => {
    if (!openMenu) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(".cs-actions-cell")) return;
      setOpenMenu(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenu]);

  return (
    <div className="amp-packs">
      <div className="amp-packs-table__header amp-canvas__header">
        <div>
          <h2>Share packs</h2>
          <p>
            See how employee advocacy is performing across clicks, applications, and estimated media value —
            then manage every pack in the table below.
          </p>
        </div>
        {onRequestVideo && (
          <button type="button" className="cs-btn cs-btn--secondary amp-canvas__cta" onClick={onRequestVideo}>
            Request a video
          </button>
        )}
      </div>

      <ImpactKpiRow packs={packs} />

      <div className="cs-table-wrap">
        <table className="cs-table">
          <colgroup>
            <col className="cs-col-name" />
            <col className="cs-col-status" />
            <col className="cs-col-metric" />
            <col className="cs-col-metric" />
            <col className="cs-col-metric" />
            <col className="cs-col-date" />
            <col className="cs-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Pack Name</th>
              <th>Status</th>
              <th>Shares</th>
              <th>Clicks</th>
              <th>Applies</th>
              <th>Date Created</th>
              <th aria-label="More actions" />
            </tr>
          </thead>
          <tbody>
            {!packs.length ? (
              <tr className="cs-table-empty-row">
                <td colSpan={7}>
                  <div className="cs-table-empty-state">
                    <h3>No created share packs</h3>
                    <p>Once you create a share pack it will appear in this table.</p>
                  </div>
                </td>
              </tr>
            ) : (
              packs.map((pack) => {
                const tableStatus = getPackTableStatus(pack);
                const canSend = pack.status === "ready" || pack.status === "draft";
                const canReview = pack.status === "needs_approval";

                return (
                  <tr key={pack.id}>
                    <td>
                      <a
                        className="cs-link-button cs-campaign-name"
                        href={`#${pack.id}`}
                        title={pack.title}
                        onClick={(event) => {
                          event.preventDefault();
                          openPack(pack);
                        }}
                      >
                        {pack.title}
                      </a>
                    </td>
                    <td className="cs-status-cell">
                      <span className={`cs-status cs-status--${tableStatus.className}`} title={tableStatus.label}>
                        <span className="cs-status__label">{tableStatus.label}</span>
                      </span>
                    </td>
                    <td>
                      <PackMetricCell pack={pack} metric="shares" />
                    </td>
                    <td>
                      <PackMetricCell pack={pack} metric="clicks" />
                    </td>
                    <td>
                      <PackMetricCell pack={pack} metric="applications" />
                    </td>
                    <td>
                      <span className="cs-table-text" title={formatDate(pack.createdAt)}>
                        {formatDate(pack.createdAt)}
                      </span>
                    </td>
                    <td className="cs-actions-cell">
                      <button
                        type="button"
                        className={`cs-more-button cs-table-more-button ${openMenu === pack.id ? "is-open" : ""}`}
                        aria-label={`More actions for ${pack.title}`}
                        aria-expanded={openMenu === pack.id}
                        onClick={() => setOpenMenu(openMenu === pack.id ? null : pack.id)}
                      >
                        <span className="cs-more-button__dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                      {openMenu === pack.id && (
                        <div className="cs-menu">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              openPack(pack);
                            }}
                          >
                            {canReview ? "Review pack" : "View pack"}
                          </button>
                          {canSend && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onSend([pack.id]);
                              }}
                            >
                              Send now
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
