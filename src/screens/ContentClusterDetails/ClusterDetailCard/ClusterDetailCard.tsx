import React, { useState } from "react";
import aiTag from "../../../assets/svg/aiTag.svg";
import pageIcon from "../../../assets/svg/content-icons.svg";

import "./ClusterDetailCard.css";
import { create } from "lodash";

interface ClusterDetailCardProps {
  contentPage?: any;
  landingPage?: any;
  blog?: any;
  aiBlog?: any;
  aiContentPage?: any;
  emailTemplate?: any;
  createdEmailTemplate?: any;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterDetailCard: React.FC<ClusterDetailCardProps> = ({
  contentPage,
  landingPage,
  blog,
  aiBlog,
  aiContentPage,
  emailTemplate,
  createdEmailTemplate,
}) => {
  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = new Date(timestamp).toLocaleDateString("en-US", options);
    return formattedDate;
  };

  return (
    <div className="cluster-detail-card">
      <div className="cluster-detail-card-image">
        <img
          src={
            blog?.desktopThumbnailImage ||
            blog?.avatarUrl ||
            aiBlog?.avatarUrl ||
            createdEmailTemplate?.previewUrl ||
            emailTemplate?.previewUrl ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvHpr0nSOkd_2ZDZdS4vceEAKvKWRzuhFqXg&s"
          }
          alt="Placeholder"
          height={"200px"}
          width={"200px"}
        />
          <span className={aiBlog || aiContentPage ? "cluster-detail-card-label-ai" : "cluster-detail-card-label"}>
          {aiBlog || aiContentPage ? (
            <img src={aiTag} alt="AI Tag" style={{ height: 24 }} />
          ) : (
          "Manual"
          )}
        </span>

      </div>
      <div className="cluster-detail-card-content">
        <div className="cluster-detail-card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* SVG Icon */}
          <span className="cluster-detail-card-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={pageIcon} alt="Page Icon" />
          </span>
          <h3 className="cluster-detail-card-title" style={{ margin: 0 }}>
            {contentPage?.displayName || landingPage?.displayName || "Sample Name"}
          </h3>
        </div>
        {/* Status and Date Row */}
        <div className="cluster-detail-card-status-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px 0' }}>
          <span style={{ width: 10, height: 10, background: '#28a745', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#666', fontWeight: 500, fontSize: '0.95rem' }}>Unpublished</span>
          <span style={{ color: '#aaa', fontSize: '0.95rem' }}>|</span>
          <span style={{ color: '#666', fontSize: '0.95rem' }}>
            Created {blog?.lastModifiedDisplayDate ||
              aiBlog?.lastModifiedDisplayDate ||
              (emailTemplate && formatDate(emailTemplate?.createdDate)) ||
              (createdEmailTemplate && formatDate(createdEmailTemplate?.createdDate)) ||
              "Jun 2, 2021"}
          </span>
        </div>
        <div className="cluster-detail-card-footer">
          {/* <span className="cluster-detail-card-score-badge">
            <span className="score-circle">A</span>
          </span> */}
          <a
            href={contentPage?.url || landingPage?.url || blog?.fullUrl || aiBlog?.fullUrl || aiContentPage?.url}
            target="_blank"
            className="preview-link"
          >
            Preview
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClusterDetailCard;
