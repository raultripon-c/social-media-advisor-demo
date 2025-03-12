import React, { useState } from "react";
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
        <span className="cluster-detail-card-label">{aiBlog || aiContentPage ? "AI" : "Manual"}</span>
      </div>
      <div className="cluster-detail-card-content">
        <h3 className="cluster-detail-card-title">
          {contentPage?.displayName ||
            landingPage?.displayName ||
            blog?.title ||
            aiBlog?.title ||
            aiContentPage?.name ||
            emailTemplate?.templateName ||
            createdEmailTemplate?.templateName ||
            "Sample Name"}
        </h3>
        {(blog || aiBlog || emailTemplate || createdEmailTemplate) && (
          <p className="cluster-detail-card-meta">
            Created:
            {blog?.lastModifiedDisplayDate ||
              aiBlog?.lastModifiedDisplayDate ||
              (emailTemplate && formatDate(emailTemplate?.createdDate)) ||
              (createdEmailTemplate && formatDate(createdEmailTemplate?.createdDate)) ||
              "Jun 2, 2021"}
          </p>
        )}

        <div className="cluster-detail-card-footer">
          <span className="cluster-detail-card-score">Score: A</span>
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
