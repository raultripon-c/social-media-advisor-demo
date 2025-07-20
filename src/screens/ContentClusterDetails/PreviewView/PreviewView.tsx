import React, { useState, useEffect } from "react";
import "./PreviewView.css";
import crossIcon from "../../../assets/svg/white-cross.svg";
import editIcon from "../../../assets/svg/white-editIcon.svg";
import { APIService } from "../../../utils/api.service";

interface PreviewViewProps {
    pageData?: any;
    onBack: () => void;
    crmUserInfo: any;
}

const PreviewView: React.FC<PreviewViewProps> = ({ pageData, onBack, crmUserInfo }) => {
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [htmlContent, setHtmlContent] = useState<string>("");
   

    const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");

    useEffect(() => {
        if (pageData) {
            // Check if it's an email template with _id
            if (pageData?.application=="crm" && pageData?._id) {
                fetchEmailTemplatePreview();
            } else {
                // Extract URL from page data
                const url = pageData?.previewUrl || pageData?.fullUrl || pageData?.url || "";
                setCurrentUrl(url);
                setIsLoading(true);
            }
        }
    }, [pageData]);



    const fetchEmailTemplatePreview = async () => {
        try {
            setIsLoading(true);
            const payload = {
                "id": pageData?._id,
                "source": "template",
                "userPreferredLanguage": "en",
                "recruiterUserId": crmUserInfo.userDetails.id,
                "refNum": selectedTenant.refNum
            }
            
            const response = await APIService.getPreview(payload);
            if (response?.htmlStructure) {
                setHtmlContent(response.htmlStructure);
            } else {
                // Fallback to URL if no HTML structure
                const url = pageData?.previewUrl || pageData?.fullUrl || pageData?.url || "";
                setCurrentUrl(url);
            }
        } catch (error) {
            console.error('Error fetching email template preview:', error);
            // Fallback to URL
            const url = pageData?.previewUrl || pageData?.fullUrl || pageData?.url || "";
            setCurrentUrl(url);
        } finally {
            setIsLoading(false);
        }
    };

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

    const renderHtmlContent = () => {
        return (
            <div className="preview-html-container">
                <iframe
                    srcDoc={htmlContent}
                    className="preview-iframe"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="Email Template Preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </div>
        );
    };

    return (
        <div className="preview-view-container">
            <div className="preview-header">
                <div className="preview-header-left">
                    <div className="preview-back-btn">
                        <img src={crossIcon} alt="Back" onClick={onBack} />
                        <span className="preview-title">{getPageTitle()}</span>
                    </div>
                </div>
                <div className="preview-header-right">

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

                {htmlContent ? (
                    renderHtmlContent()
                ) : currentUrl ? (
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
        </div>
    );
};

export default PreviewView;
