import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppStore } from "store";
import "./PreviewView.css";
import crossIcon from "../../../assets/svg/white-cross.svg";
import editIcon from "../../../assets/svg/white-editIcon.svg";
import { AppSelectionOptions } from "../../../interfaces/AppSelectionOptions";
import { appSelectionHandler } from "../../../utils/appUtils";
import { APIService } from "../../../utils/api.service";
import { setSiteMetaData } from "../../../store/customer/actions";

interface PreviewViewProps {
    pageData?: any;
    onBack: () => void;
    crmUserInfo: any;
}

const PreviewView: React.FC<PreviewViewProps> = ({ pageData, onBack, crmUserInfo }) => {
    const navigate = useNavigate();
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [htmlContent, setHtmlContent] = useState<string>("");
   
    const { selectedApp, allApps } = useSelector((state: any) => state.app);

    const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");

      const siteMetaData = useSelector(
        (state: AppStore) => state.customer.siteMetaData
      );

      const dispatch = useDispatch();
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

    const navigateToExperienceManager = () => {
        const app = allApps.find((app: any) => app.name === "Experience Manager");
    
        if (!app || !selectedTenant || !navigate || !dispatch) {
            console.error("Missing dependencies for navigating to Experience Manager.");
            return;
        }
    
        const appSelectionOptions: AppSelectionOptions = {
            selectedApp: app,
            navigate,
            customerCode: selectedTenant.customerCode,
            refNum: selectedTenant.refNum,
            siteMetaData,
            dispatch,
            openInNewTab: false,
            setSiteMetaData,
            selectedTenant,
        };
    
        appSelectionHandler(appSelectionOptions);
    };
    
    const handleEditClick = () => {
        if (pageData?.application === "crm" && pageData?._id && selectedTenant) {
            const editPath = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/dashboard/email-management/templates/${pageData._id}`;
            window.open(editPath, '_blank');
        } else {
            navigateToExperienceManager();
        }
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

                    <button className="preview-btn preview-btn-edit" onClick={handleEditClick}>
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
