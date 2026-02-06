import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppStore } from "store";
import "./PreviewView.css";
import crossIcon from "../../../assets/svg/white-cross.svg";
import editIcon from "../../../assets/svg/white-editIcon.svg";
import { AppSelectionOptions } from "../../../interfaces/AppSelectionOptions";
import { appSelectionHandler, getLink, getRefnumFromLink, handleDomainUrlForSite } from "../../../utils/appUtils";
import { APIService } from "../../../utils/api.service";
import { setSiteMetaData } from "../../../store/customer/actions";
import { CMSPageType, CONTENT_TYPES, SupportedContentType } from "../../../utils/constants";
import { isEmpty } from "lodash";
interface PreviewViewProps {
    pageData?: any;
    onBack: () => void;
    crmUserInfo: any;
    contentType?: string;
    isCheckingTaskProgress?: boolean;
    className?: string;
    noUrlClassName?: string;
    preview?: boolean;
    onRegenerate?: (pageData: any, contentType: SupportedContentType) => Promise<boolean>;
    clickDisabled?: boolean | true;
}

const PreviewView: React.FC<PreviewViewProps> = ({ pageData, onBack, crmUserInfo, contentType, isCheckingTaskProgress, className, preview=false, onRegenerate, noUrlClassName, clickDisabled=true}) => {
    const navigate = useNavigate();
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [htmlContent, setHtmlContent] = useState<string>("");
    const observerRef = useRef<MutationObserver | null>(null);
   
    const { selectedApp, allApps } = useSelector((state: any) => state.app);

    const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");

      const siteMetaData = useSelector(
        (state: AppStore) => state.customer.siteMetaData
      );

      const dispatch = useDispatch();
    useEffect(() => {
        if (pageData) {
            const htmlStructure = pageData?.htmlStructure;
            let url = pageData?.fullUrl || pageData?.url || "";
            // Check if it's an email template with _id
            if (pageData?.application=="crm" && pageData?._id && contentType === CONTENT_TYPES.EMAIL_TEMPLATE) {
                fetchEmailTemplatePreview();
            } else if(!htmlStructure && url) {
                if(contentType === CONTENT_TYPES.BLOG){
                    url = pageData?.previewUrl || url;
                }
                setCurrentUrl(url);
                setIsLoading(true);
            } else {
                setHtmlContent(pageData?.htmlStructure);
            }
        }
    }, [pageData]);

    // Cleanup observer on component unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);



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


    const handleIframeError = () => {
        setIsLoading(false);
        // Handle error - maybe show a fallback content
    };
    

    const handleIframeLoad = () => {
        setIsLoading(false);
        
        // Clean up any existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        
        // Add event listeners to disable only hyperlinks in iframe content
        const iframe = document.querySelector('.preview-iframe-click-disabled') as HTMLIFrameElement;
        if (iframe && iframe.contentDocument && clickDisabled) {
            try {
                const iframeDoc = iframe.contentDocument;
                
                // Function to disable all links
                const disableAllLinks = () => {
                    const links = iframeDoc.querySelectorAll('a');
                    links.forEach(link => {
                        // Remove existing event listeners to avoid duplicates
                        link.removeEventListener('click', preventLinkClick, true);
                        // Add click prevention
                        link.addEventListener('click', preventLinkClick, true);
                    });
                };
                
                // Function to prevent link clicks
                const preventLinkClick = (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                };
                
                // Disable existing links
                if(clickDisabled) {
                    disableAllLinks();
                }
                
                // Set up observer to catch dynamically added links
                const observer = new MutationObserver((mutations) => {
                    let shouldDisableLinks = false;
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    const element = node as Element;
                                    if (element.tagName === 'A' || element.querySelector('a')) {
                                        shouldDisableLinks = true;
                                    }
                                }
                            });
                        }
                    });
                    
                    if (shouldDisableLinks) {
                        disableAllLinks();
                    }
                });
                
                // Store observer reference for cleanup
                observerRef.current = observer;
                
                // Start observing for changes
                observer.observe(iframeDoc.body, {
                    childList: true,
                    subtree: true
                });
                
                // Also add a global click listener on the document
                iframeDoc.addEventListener('click', (e) => {
                    const target = e.target as Element;
                    if (target && target.tagName === 'A') {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }
                }, true);
                
            } catch (error) {
                // Cross-origin iframe, can't access content
                console.log('Cannot access iframe content due to cross-origin restrictions');
            }
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
    };
    
    const handleEditClick = () => {
        if (pageData?.application === "crm" && pageData?._id && selectedTenant && contentType === CONTENT_TYPES.EMAIL_TEMPLATE) {
            const editPath = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/dashboard/email-management/templates/${pageData._id}`;
            window.open(editPath, '_blank');
        } else if(contentType === CONTENT_TYPES.BLOG){
            if(pageData.articleId){
                localStorage.setItem("blogId", pageData.articleId);
              }
            const url = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/blogs`;
            window.open(url, '_blank');
        } else if(contentType?.toLowerCase().includes("page")){
            if (pageData?.id) {
                pageData.pageId = pageData.id;
            }
            pageData.scenario = "navigateToPage"
            navigateOnClick(pageData);
        }
    };
    
    const handleRegenerateClick = async () => {
        setIsLoading(true);
        const contentType: SupportedContentType = pageData?.type;
        const loaded = (await onRegenerate?.(pageData, contentType)) ?? false;
        setIsLoading(false);
    };

    const navigateOnClick = async (pageData: object) => {
        const cmsUrl = (window as any)["_env_"].CMS_URL;
        let metaData = siteMetaData;
        
        if(!siteMetaData || Object.keys(siteMetaData).length === 0) {
            const tenantSupportedLangs = await APIService.getSupportedLangs(
                getRefnumFromLink(window.location.href, selectedTenant)
              );
              metaData = await handleDomainUrlForSite(
                tenantSupportedLangs,
                selectedTenant,
                dispatch,
                setSiteMetaData,
                siteMetaData
              );
        }
        
        const config = {
          appType: "external",
          appConfig: { link: cmsUrl + "/tier3" },
          requestParams: {
            lsrc: "txe",
            lsw: "_self",
            refNum: selectedTenant?.refNum,
            customerCode: selectedTenant?.customerCode,
            route: "pages",
            payload: btoa(JSON.stringify(pageData)),
            site: btoa(JSON.stringify(metaData)),
            scenario: "navigateToPageId"
          },
        };
        const link = getLink(config, {});
        if (link && !isEmpty(link)) 
            window.open(link, "_blank");
      }
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
                        className={`preview-iframe ${clickDisabled ? "preview-iframe-click-disabled" : ""}`}
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
            <div className={`preview-html-container ${className}`}>
                <iframe
                    srcDoc={htmlContent}
                    className={`preview-iframe ${clickDisabled ? "preview-iframe-click-disabled" : ""}`}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="Email Template Preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </div>
        );
    };

    return (
        <div className={`preview-view-container ${className}`}>
            <div className="preview-header">
                <div className="preview-header-left">
                    <div className="preview-back-btn">
                        <img src={crossIcon} alt="Back" onClick={onBack} />
                        <span className="preview-title">{getPageTitle()}</span>
                    </div>
                </div>
                <div className="preview-header-right">

                    {preview ? (
                        <button className="preview-btn preview-btn-edit" onClick={handleRegenerateClick}>
                            <img src={editIcon} alt="Regenerate" />
                            <span>Regenerate</span>
                        </button>
                    ) : (
                        <button className="preview-btn preview-btn-edit" onClick={handleEditClick}>
                            <img src={editIcon} alt="Edit" />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Content */}
            <div className="preview-content">
                {(isLoading || isCheckingTaskProgress) && (
                    <div className="preview-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading preview...</p>
                    </div>
                )}

                {htmlContent ? (
                    renderHtmlContent()
                ) : currentUrl && !isCheckingTaskProgress ? (
                    renderUrlContent()
                ) : (
                    <div className={`preview-no-url ${noUrlClassName}`}>
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
