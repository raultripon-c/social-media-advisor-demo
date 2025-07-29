import React, { useState } from "react";
import aiTag from "../../../assets/svg/aiTag.svg";
import pageIcon from "../../../assets/svg/content-icons.svg";

import landingPageIcon from "../../../assets/svg/landing-page-icon.svg";
import contentPageIcon from "../../../assets/svg/content-page-icon.svg";
import blogIcon from "../../../assets/svg/blog-icon.svg";
import emailTemplateIcon from "../../../assets/svg/email-template-icon.svg";

import contentPageImage from "../../../assets/images/content-page-image.png";
import landingPageImage from "../../../assets/images/landing-page-image.png";
import blogImage from "../../../assets/images/blog-image.png";
import emailTemplateImage from "../../../assets/images/email-template-image.png";
import { CONTENT_TYPES } from "../../../utils/constants";

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
  aiLandingPage?: any;
  setPreviewDiv?: (pageData: any, contentType: string) => void;
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
  aiLandingPage,
  setPreviewDiv,
}) => {

  const getStatusColor = (status: string) => {
    if(status === "Published"){
      return "#28a745"; // Green for published
    }else if(status === "Draft"){
      return "#CCCCCC"; // Gray for draft
    }else if(status === "Unpublished"){
      return "#28a745"; // Red for unpublished
    }
    else{
      return "#28a745"; // Default green
    }
  }

  // Helper function to get content data based on priority order
  const getContentData = () => {
    const contentTypes = [
      { ai: aiContentPage, manual: contentPage, icon: contentPageIcon, image: contentPageImage, type: CONTENT_TYPES.CONTENT_PAGE },
      { ai: aiLandingPage, manual: landingPage, icon: landingPageIcon, image: landingPageImage, type: CONTENT_TYPES.LANDING_PAGE },
      { ai: aiBlog, manual: blog, icon: blogIcon, image: blogImage, type: CONTENT_TYPES.BLOG },
      { ai: createdEmailTemplate, manual: emailTemplate, icon: emailTemplateIcon, image: emailTemplateImage, type: CONTENT_TYPES.EMAIL_TEMPLATE }
    ];

    for (const contentType of contentTypes) {
      if (contentType.ai) {
        return { ...contentType, data: contentType.ai, isAI: true };
      }
      if (contentType.manual) {
        return { ...contentType, data: contentType.manual, isAI: false };
      }
    }
    
    return { icon: pageIcon, image: null, type: 'Content', data: null, isAI: false };
  };

  const getContentIcon = () => {
    return getContentData().icon;
  };

  const getContentImage = () => {
    return getContentData().image;
  };

  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = new Date(timestamp).toLocaleDateString("en-US", options);
    return formattedDate;
  };

  const getContentCreatedDate = () => {
    const contentData = getContentData();
    if (!contentData.data?.createdDate) return null;
    
    // For AI blog, return raw date, for others format it
    if (contentData.type === 'Blog' && contentData.isAI) {
      return contentData.data.createdDate;
    }
    
    return formatDate(contentData.data.createdDate);
  };

  // Function to get content type name for hover display
  const getContentTypeName = () => {
    return getContentData().type;
  };
  return (
    <div className="cluster-detail-card" title={getContentTypeName()}>
      <div className="cluster-detail-card-image">
        <img
          src={
            aiLandingPage?.avatarUrl ||
            createdEmailTemplate?.previewUrl ||
            emailTemplate?.previewUrl ||
            getContentImage() ||
            blog?.desktopThumbnailImage ||
            blog?.avatarUrl ||
            aiBlog?.avatarUrl ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvHpr0nSOkd_2ZDZdS4vceEAKvKWRzuhFqXg&s"
          }
          alt="Placeholder"
          height={"200px"}
          width={"200px"}
        />
          <span className={aiBlog || aiContentPage || aiLandingPage || createdEmailTemplate ? "cluster-detail-card-label-ai" : "cluster-detail-card-label"}>
          {aiBlog || aiContentPage || aiLandingPage || createdEmailTemplate ? (
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
            <img src={getContentIcon()} alt="Content Icon" />
          </span>
          <h3 
            className="cluster-detail-card-title" 
            style={{ 
              margin: 0, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
            title={contentPage?.displayName || landingPage?.displayName || aiLandingPage?.name || emailTemplate?.templateName || createdEmailTemplate?.templateName || aiBlog?.title || aiContentPage?.name || blog?.title || "Sample Name"}
          >
            {contentPage?.displayName || landingPage?.displayName || aiLandingPage?.name || emailTemplate?.templateName || createdEmailTemplate?.templateName || aiBlog?.title || aiContentPage?.name || blog?.title || "Sample Name"}
          </h3>
        </div>
        {/* Status and Date Row */}
        <div className="cluster-detail-card-status-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px 0' }}>
          <span style={{ width: 10, height: 10, background: getStatusColor(contentPage?.status || landingPage?.status || aiLandingPage?.status || emailTemplate?.status || createdEmailTemplate?.status || aiBlog?.status || aiContentPage?.status || blog?.status || "1"), borderRadius: '50%', display: 'inline-block' }}></span>
          <span className="cluster-detail-card-status-text">{contentPage?.status || landingPage?.status || aiLandingPage?.status || emailTemplate?.status || createdEmailTemplate?.status || aiBlog?.status || aiContentPage?.status || blog?.status || "Published"}</span>
          <span style={{ color: '#aaa', fontSize: '0.95rem' }}>|</span>
          <span className="cluster-detail-card-status-text">
            Created {getContentCreatedDate() ? getContentCreatedDate() : ""}
          </span>
        </div>
        <div className="cluster-detail-card-footer">
          {/* <span className="cluster-detail-card-score-badge">
            <span className="score-circle">A</span>
          </span> */}
          <div
            className="preview-link"
            onClick={async () => {
              const pageData = contentPage || landingPage || blog || aiBlog || aiContentPage || emailTemplate || createdEmailTemplate || aiLandingPage;
              
              // Determine content type based on which prop is present
            
              
              setPreviewDiv && setPreviewDiv(pageData, getContentTypeName());
            }}
          >
            Preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterDetailCard;
