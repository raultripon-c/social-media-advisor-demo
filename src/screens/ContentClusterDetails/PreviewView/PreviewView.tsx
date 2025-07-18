import React, { useState, useEffect } from "react";
import "./PreviewView.css";
import crossIcon from "../../../assets/svg/white-cross.svg";
import editIcon from "../../../assets/svg/white-editIcon.svg";
import improveIcon from "../../../assets/svg/improve.svg";
import publishIcon from "../../../assets/svg/publish.svg";

interface PreviewViewProps {
  pageData?: any;
  onBack: () => void;
}

const PreviewView: React.FC<PreviewViewProps> = ({ pageData, onBack }) => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (pageData) {
      // Extract URL from page data
      const url = pageData?.previewUrl || pageData?.fullUrl || pageData?.url  || "";
      setCurrentUrl(url);
      setIsLoading(true);
    }
  }, [pageData]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    // Handle error - maybe show a fallback content
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    // Handle error - maybe show a fallback content
  };

  // Function to check if URL is an image
  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    const lowerUrl = url.toLowerCase();
    
    // Check for image file extensions
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
           // Check for data URLs with image types
           lowerUrl.startsWith('data:image/') ||
           // Check for common image hosting domains
           lowerUrl.includes('imgur.com') ||
           lowerUrl.includes('images.unsplash.com') ||
           lowerUrl.includes('picsum.photos');
  };

  const getPageTitle = () => {
    return pageData?.displayName || 
           pageData?.name || 
           pageData?.title || 
           pageData?.templateName || 
           "Page Preview";
  };

  const getPageType = () => {
    if (pageData?.aiLandingPage) return "AI Landing Page";
    if (pageData?.aiContentPage) return "AI Content Page";
    if (pageData?.aiBlog) return "AI Blog";
    if (pageData?.landingPage) return "Landing Page";
    if (pageData?.contentPage) return "Content Page";
    if (pageData?.blog) return "Blog";
    if (pageData?.emailTemplate) return "Email Template";
    if (pageData?.jobListing) return "Job Listing";
    return "Page";
  };



  const renderUrlContent = () => {
    if (isImageUrl(currentUrl)) {
      return (
        <div className="preview-image-container">
          <img
            src={currentUrl}
            alt="Preview Image"
            className="preview-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
    } else {
      return (
        <div className="preview-iframe-container">
          <iframe
            src={currentUrl}
            className="preview-iframe"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Page Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      );
    }
  };

  return (
    <div className="preview-view-container">
      <div className="preview-header">
            <div className="preview-header-left">
          <button className="preview-back-btn">
            <img src={crossIcon} alt="Back" onClick={onBack}/>
            <span className="preview-title">{getPageTitle()}</span>
          </button>
            </div>
        
        {/* <div className="preview-header-center">
          <h1 className="preview-title">{getPageTitle()}</h1>
        </div> */}
        
        <div className="preview-header-right">
          {/* {hasUnpublishedChanges && (
            <button className="preview-btn preview-btn-secondary">
              <span>Unpublished changes</span>
              <img src={publishIcon} alt="Publish" />
            </button>
          )}
          
          <button className="preview-btn preview-btn-improve">
            <img src={improveIcon} alt="Improve" />
            <span>Improve with AI</span>
            <img src={publishIcon} alt="Dropdown" />
          </button> */}
          
          <button className="preview-btn preview-btn-edit">
            <img src={editIcon} alt="Edit" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content">
        {isLoading && (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
        )}
        
        {currentUrl ? (
          renderUrlContent()
        ) : (
          <div className="preview-no-url">
            <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {/* <div className="preview-toolbar">
        <button className="toolbar-btn">
          <img src={editIcon} alt="Draw" />
        </button>
        <button className="toolbar-btn">
          <img src={improveIcon} alt="Link" />
        </button>
        <button className="toolbar-btn">
          <img src={publishIcon} alt="Color" />
        </button>
        <button className="toolbar-btn">
          <img src={crossIcon} alt="Code" />
        </button>
      </div> */}
    </div>
  );
};

export default PreviewView;
