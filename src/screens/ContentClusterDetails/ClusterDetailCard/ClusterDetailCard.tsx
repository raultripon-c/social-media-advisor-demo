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
  setPreviewDiv?: (pageDataOrObject: any) => Promise<void>;
  pageType?: string;
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
  pageType,
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

  // Function to determine the appropriate icon based on content type
  const getContentIcon = () => {
    // Check for AI-generated content first
    if (aiContentPage) {
      return contentPageIcon; // AI content page
    }
    if (aiLandingPage) {
      return landingPageIcon; // AI landing page
    }
    if (aiBlog) {
      return blogIcon; // AI blog
    }
    if (createdEmailTemplate) {
      return emailTemplateIcon; // AI email template
    }
    
    // Check for manual content
    if (contentPage) {
      return contentPageIcon; // Manual content page
    }
    if (landingPage) {
      return landingPageIcon; // Manual landing page
    }
    if (blog) {
      return blogIcon; // Manual blog
    }
    if (emailTemplate) {
      return emailTemplateIcon; // Manual email template
    }
    
    // Default fallback
    return pageIcon;
  };
  const getContentImage = () => {
    // Check for AI-generated content first
    if (aiContentPage) {
      return contentPageImage; // AI content page
    }
    if (aiLandingPage) {
      return landingPageImage; // AI landing page
    }
    if (aiBlog) {
      return blogImage; // AI blog
    }
    if (createdEmailTemplate) {
      return emailTemplateImage; // AI email template
    }
    
    // Check for manual content
    if (contentPage) {
      return contentPageImage; // Manual content page
    }
    if (landingPage) {
      return landingPageImage; // Manual landing page
    }
    if (blog) {
      return blogImage; // Manual blog
    }
    if (emailTemplate) {
      return emailTemplateImage; // Manual email template
    }
    
    // Default fallback
    return null;
  };

  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = new Date(timestamp).toLocaleDateString("en-US", options);
    return formattedDate;
  };
  

  const getContentCreatedDate = () => {
    if(createdEmailTemplate){
      return formatDate(createdEmailTemplate?.createdDate);
    }
    if(aiLandingPage){
      return formatDate(aiLandingPage?.createdDate);
  }
  if(aiBlog){
    return aiBlog?.createdDate;
  }
  if(aiContentPage){
    return aiContentPage?.createdDate;
  }
  if(contentPage){
    return contentPage?.createdDate;
  }
  if(landingPage){
    return landingPage?.createdDate;
  }
  if(blog){
    return blog?.createdDate;
  }
  if(emailTemplate){
    return emailTemplate?.createdDate;
  }
  return null;
}
  return (
    <div className="cluster-detail-card">
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
              if (setPreviewDiv) {
                await setPreviewDiv({ pageData, pageType: pageType || 'unknown' });
              }
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
