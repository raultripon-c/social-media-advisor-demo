import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import downloadIcon from "../../../assets/svg/download.svg";
import editIcon from "../../../assets/svg/edit.svg";
import { getCampaignStudioPaths } from "../ContentBoard/CampaignStudioSubNav";
import "../ContentBoard/ContentBoard.css";
import { countVideoSubmissionsByStatus, getVideoSubmissions } from "./amplifyData";
import { SharePack, VideoSubmission, VideoSubmissionStatus } from "./amplifyTypes";
import { deleteVideoSubmission, updateSharePack, updateVideoSubmission } from "./sharePackStorage";
import { VideoReviewModal } from "./VideoReviewModal";

interface VideoRequestDetailPageProps {
  pack: SharePack;
  onPackChange: (pack: SharePack) => void;
}

const BackArrowIcon = () => (
  <svg className="cs-back-edit__icon" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
    <path
      d="M0.23125 6.54554C0.084375 6.40179 0 6.20804 0 6.00179C0 5.79554 0.084375 5.60179 0.23125 5.45804L5.73125 0.208037C6.03125 -0.0794632 6.50625 -0.0669631 6.79063 0.233037C7.075 0.533037 7.06563 1.00804 6.76562 1.29241L2.62188 5.25179H13.25C13.6656 5.25179 14 5.58616 14 6.00179C14 6.41741 13.6656 6.75179 13.25 6.75179H2.62188L6.76875 10.708C7.06875 10.9955 7.07812 11.4674 6.79375 11.7674C6.50937 12.0674 6.03438 12.0768 5.73438 11.7924L0.234375 6.54241L0.23125 6.54554Z"
      fill="currentColor"
    />
  </svg>
);

const TAB_LABELS: Record<VideoSubmissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const EMPTY_COPY: Record<VideoSubmissionStatus, { title: string; body: string }> = {
  pending: {
    title: "No pending videos",
    body: "Uploaded videos waiting for review will appear here.",
  },
  approved: {
    title: "No approved videos",
    body: "Approved videos will appear here once you review submissions.",
  },
  rejected: {
    title: "No rejected videos",
    body: "Rejected videos will appear here after review.",
  },
};

export const VideoRequestDetailPage: React.FC<VideoRequestDetailPageProps> = ({ pack, onPackChange }) => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const paths = getCampaignStudioPaths(customerCode, refnum);

  const [activeTab, setActiveTab] = useState<VideoSubmissionStatus>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<VideoSubmission | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(pack.title);
  const [toast, setToast] = useState<string | null>(null);

  const submissions = useMemo(() => getVideoSubmissions(pack), [pack]);
  const videoPrompt = pack.videoRequest?.videoPrompt || pack.captions[0]?.text || "";

  const tabCounts = useMemo(
    () => ({
      pending: countVideoSubmissionsByStatus(submissions, "pending"),
      approved: countVideoSubmissionsByStatus(submissions, "approved"),
      rejected: countVideoSubmissionsByStatus(submissions, "rejected"),
    }),
    [submissions],
  );

  const filteredSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === activeTab),
    [activeTab, submissions],
  );

  useEffect(() => {
    setTitleDraft(pack.title);
  }, [pack.title]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const persistSubmission = (submission: VideoSubmission) => {
    const next = updateVideoSubmission(pack.id, submission.id, () => submission);
    if (next) onPackChange(next);
  };

  const handleApprove = (submission: VideoSubmission) => {
    const nextSubmission = { ...submission, status: "approved" as const };
    persistSubmission(nextSubmission);
    setSelectedSubmission(null);
    setToast("Video approved");
  };

  const handleReject = (submission: VideoSubmission) => {
    const nextSubmission = { ...submission, status: "rejected" as const };
    persistSubmission(nextSubmission);
    setSelectedSubmission(null);
    setToast("Video rejected");
  };

  const handleDelete = (submissionId: string) => {
    const next = deleteVideoSubmission(pack.id, submissionId);
    if (!next) return;
    onPackChange(next);
    setSelectedSubmission(null);
    setToast("Video deleted");
  };

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === pack.title) {
      setTitleDraft(pack.title);
      setIsEditingTitle(false);
      return;
    }
    const next = updateSharePack(pack.id, (current) => ({ ...current, title: trimmed }));
    if (next) onPackChange(next);
    setIsEditingTitle(false);
  };

  return (
    <main className="campaign-studio">
      <section className="cs-overview amp-video-request-detail">
        <div className="cs-overview__topbar">
          <button type="button" className="cs-back-edit cs-overview__back" onClick={() => navigate(paths.employeeAdvocacy)}>
            <BackArrowIcon /> Back to Employee Advocacy
          </button>
        </div>

        <div className="amp-video-request-detail__header">
          <div className="amp-video-request-detail__title-block">
            {isEditingTitle ? (
              <input
                className="amp-video-request-detail__title-input"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={saveTitle}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveTitle();
                  if (event.key === "Escape") {
                    setTitleDraft(pack.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                aria-label="Request name"
              />
            ) : (
              <div className="amp-video-request-detail__title-row">
                <h1>{pack.title}</h1>
                <button
                  type="button"
                  className="cs-icon-button amp-video-request-detail__edit-title"
                  aria-label="Edit request name"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <img src={editIcon} alt="" width={16} height={16} />
                </button>
              </div>
            )}
            {videoPrompt && <p className="amp-video-request-detail__prompt">&ldquo;{videoPrompt}&rdquo;</p>}
          </div>
        </div>

        <div className="amp-video-request-detail__tabs-wrap">
          <nav className="cs-subnav amp-video-request-detail__tabs" aria-label="Submission status">
            {(Object.keys(TAB_LABELS) as VideoSubmissionStatus[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`cs-subnav__link${activeTab === tab ? " is-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
                {tab === "pending" && tabCounts.pending > 0 ? ` (${tabCounts.pending})` : ""}
              </button>
            ))}
          </nav>
        </div>

        <div className="amp-video-request-detail__content">
          {!filteredSubmissions.length ? (
            <div className="amp-video-request-detail__empty">
              <h3>{EMPTY_COPY[activeTab].title}</h3>
              <p>{EMPTY_COPY[activeTab].body}</p>
            </div>
          ) : (
            <div className="amp-video-submissions-grid">
              {filteredSubmissions.map((submission) => (
                <article key={submission.id} className="amp-video-submission-card">
                  <button
                    type="button"
                    className="amp-video-submission-card__media"
                    onClick={() => setSelectedSubmission(submission)}
                    aria-label={`Review video from ${submission.name}`}
                  >
                    <img src={submission.thumbnailUrl} alt="" />
                    <span className="amp-video-submission-card__play" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 7.5L16.5 12L9 16.5V7.5Z" fill="currentColor" />
                      </svg>
                    </span>
                  </button>
                  <div className="amp-video-submission-card__body">
                    <button
                      type="button"
                      className="cs-link-button amp-video-submission-card__name"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      {submission.name}
                    </button>
                    <p className="amp-video-submission-card__email">{submission.email}</p>
                  </div>
                  <div className="amp-video-submission-card__footer">
                    <span className="amp-video-submission-card__meta">
                      {submission.durationLabel} | {submission.fileSizeLabel}
                    </span>
                    <button type="button" className="cs-icon-button" aria-label={`Download video from ${submission.name}`}>
                      <img src={downloadIcon} alt="" width={16} height={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedSubmission && (
        <VideoReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSave={persistSubmission}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {toast && (
        <div className="amp-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
};
