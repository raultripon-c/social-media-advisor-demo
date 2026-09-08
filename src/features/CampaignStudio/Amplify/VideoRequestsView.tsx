import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharePackDetailPath } from "../ContentBoard/CampaignStudioSubNav";
import { getVideoRequestTableStatus, getVideoResponseCount } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

interface VideoRequestsViewProps {
  requests: SharePack[];
  onCreateSharePack: (request: SharePack) => void;
  onDelete: (requestId: string) => void;
  onRequestVideo: () => void;
}

export const VideoRequestsView: React.FC<VideoRequestsViewProps> = ({
  requests,
  onCreateSharePack,
  onDelete,
  onRequestVideo,
}) => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  const openRequest = (request: SharePack) => {
    navigate(getSharePackDetailPath(customerCode, refnum, request.id));
  };

  return (
    <section className="amp-canvas amp-video-requests">
      <div className="amp-video-requests__header">
        <div className="amp-video-requests__copy">
          <h2>Source employee videos</h2>
          <p>Ask employees to record a short video you can turn into a share pack.</p>
        </div>
        <button type="button" className="cs-btn cs-btn--secondary amp-video-requests__button" onClick={onRequestVideo}>
          Request a video
        </button>
      </div>

      <div className="cs-table-wrap amp-video-requests__table">
        <table className="cs-table">
          <colgroup>
            <col className="cs-col-name" />
            <col className="cs-col-status" />
            <col className="cs-col-metric" />
            <col className="cs-col-metric" />
            <col className="cs-col-date" />
            <col className="cs-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Request Name</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Responses</th>
              <th>Date Created</th>
              <th aria-label="More actions" />
            </tr>
          </thead>
          <tbody>
            {!requests.length ? (
              <tr className="cs-table-empty-row">
                <td colSpan={6}>
                  <div className="cs-table-empty-state">
                    <h3>No video requests yet</h3>
                    <p>Send a request to employees and it will appear in this table.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                const tableStatus = getVideoRequestTableStatus(request);
                const responseCount = getVideoResponseCount(request);

                return (
                  <tr key={request.id}>
                    <td>
                      <button
                        type="button"
                        className="cs-link-button cs-campaign-name"
                        title={request.title}
                        onClick={() => openRequest(request)}
                      >
                        {request.title}
                      </button>
                    </td>
                    <td className="cs-status-cell">
                      <span className={`cs-status cs-status--${tableStatus.className}`} title={tableStatus.label}>
                        <span className="cs-status__label">{tableStatus.label}</span>
                      </span>
                    </td>
                    <td>
                      <span className="cs-table-text" title={`${request.audienceCount.toLocaleString()} recipients`}>
                        {request.audienceCount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="cs-table-text" title={`${responseCount.toLocaleString()} responses`}>
                        {responseCount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="cs-table-text" title={formatDate(request.createdAt)}>
                        {formatDate(request.createdAt)}
                      </span>
                    </td>
                    <td className="cs-actions-cell">
                      <button
                        type="button"
                        className={`cs-more-button cs-table-more-button ${openMenu === request.id ? "is-open" : ""}`}
                        aria-label={`More actions for ${request.title}`}
                        aria-expanded={openMenu === request.id}
                        onClick={() => setOpenMenu(openMenu === request.id ? null : request.id)}
                      >
                        <span className="cs-more-button__dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                      {openMenu === request.id && (
                        <div className="cs-menu">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              openRequest(request);
                            }}
                          >
                            View Request
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onCreateSharePack(request);
                            }}
                          >
                            Create Share Pack
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onDelete(request.id);
                            }}
                          >
                            Delete Request
                          </button>
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
    </section>
  );
};
