import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import PreviewView from "../../ContentClusterDetails/PreviewView/PreviewView";
import ClusterDetailCard from "../../ContentClusterDetails/ClusterDetailCard/ClusterDetailCard";
import { APIService } from "../../../utils/api.service";
import { API } from "../../../utils/api";
import pageImage from "../../../assets/images/page-image.png";
import arrowUp from '../../../assets/svg/arrow-head.svg';
import "./PreviewPages.css";
import "../../ContentClusterDetails/ClusterDetailCard/ClusterDetailCard.css";
import "../../ContentClusterDetails/ContentClusterDetails.css";
import { getRefnumFromLink } from "../../../utils/appUtils";
import { toast } from "react-toastify";
import { update } from "lodash";
import { CMS_PAGE_TYPES, CMSPageType, CMS_PAGE_TYPE_META } from "../../../utils/constants";

interface PreviewData {
  id: string;
  url: string;
  selector: string;
  upload: boolean;
  contentType?: string;
  htmlStructure?: string;
  imageUrl?: string;
  title?: string;
  createdAt?: string;
  createdBy?: string;
  type?: string;

}

interface PreviewPagesProps {
  pagesBasedKeywords: any;
  promptInput: any;
  showSaveOrDiscardModal: any;
  selectedCards: any;
  setSelectedCards: any;
  newCluster: any;
}

export default function PreviewPages({ pagesBasedKeywords, promptInput, showSaveOrDiscardModal, selectedCards, setSelectedCards, newCluster }: PreviewPagesProps) {
  const [aiGeneratedPages, setAiGeneratedPages] = useState<PreviewData[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCrmEmailTemplateLoading, setIsCrmEmailTemplateLoading] = useState(false);
  const [emailTemplateResults, setEmailTemplateResults] = useState<any[]>([]);
  const [cmsHtmlByType, setCmsHtmlByType] = useState<Partial<Record<CMSPageType, string>>>({});
  const [selectedPreview, setSelectedPreview] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    aiGenerated: true,
    contentPages: true,
    landingPages: true,
    blogPages: true
  });
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const crmUserInfo = useSelector((state: AppStore) => state.customer.crmUserInfo);

  const siteMetaData = useSelector(
    (state: AppStore) => state.customer.siteMetaData
  );


  useEffect(() => {
    const run = async (generateCmsAiPages: boolean) => {
      if (generateCmsAiPages) {
        generateCmsAiPreviewPagesAllTypesInParallel();
      } else {
        generateHtmlStructure();
      }
      generatePromptBasedEmailTemplatesInParallel(3);
    };
    run(true);
  }, []);

  const generatePromptBasedEmailTemplatesInParallel = async (times: number) => {
    try {
      setIsCrmEmailTemplateLoading(true);
      const locale: string = siteMetaData?.defaultLanguage?.toLowerCase() || "en_us";
      const emailTemplateResults: any[] = [];

      const tasks = Array.from({ length: times }).map(async () => {
        try {
          const enhanced = await APIService.enhancePrompt({
            isEnhancePrompt: true,
            prompt: promptInput,
            deviceType: "desktop",
            language: locale,
            refNum: selectedTenant.refNum,
          });
          const enhancedPromptValue = enhanced?.enhancedPrompt || promptInput;
          let id = `${Math.random().toString(36).slice(2, 9)}`;

          const result = await generateEmailTemplate(enhancedPromptValue, false, id);
          if (result) {
            setEmailTemplateResults(prev => [...prev, { id: id, emailTemplatePreview: JSON.stringify(result) }]);
            emailTemplateResults.push({ id: id, emailTemplatePreview: JSON.stringify(result) });
          }
        } catch (err) {
          console.error('Parallel enhance/generate failed:', err);
        }
      });

      await Promise.allSettled(tasks);
      updateClusterWithEmailTemplates(emailTemplateResults);

      // Call updateCluster after all tasks are completed
    } finally {
      setIsCrmEmailTemplateLoading(false);
    }
  };

  const updateCluster = async (payload: any) => {
    try {
      await APIService.updateCluster(payload);
    } catch (error) {
      console.error('Error updating cluster:', error);
      toast.error("Error updating cluster");
    }
  };

  const updateClusterWithEmailTemplates = async (emailTemplateResults: any[], isCreatedTemplate: boolean = false) => {
    const payload = {
      clusterId: newCluster.clusterId,
      ...(isCreatedTemplate
        ? { createdEmailTemplate: emailTemplateResults, flag: true }
        : { emailTemplatePreview: emailTemplateResults, flag: true }
      )
    };
    await updateCluster(payload);
  };

  const generateHtmlStructure = async () => {
    try {
      setIsLoading(true);

      const siteMetaDataResp: any = !siteMetaData ? (await APIService.getSiteMetaData(getRefnumFromLink(window.location.href, selectedTenant)))?.data?.data : siteMetaData;
      const payload = {
        companyName: selectedTenant.tenantName,
        refNum: selectedTenant.refNum,
        locale: "en_us",
        siteVariant: "external",
        siteType: "external",
        url: "https://" + siteMetaDataResp?.domain + "/",
        selector: "body > main",
        upload: true,
        language: siteMetaData?.defaultLanguage?.toLowerCase() || "en_us",
        pageTypes: Object.values(CMS_PAGE_TYPES),
        aiVoiceTone: "friendly",
        aiMetaData: {
          context: promptInput
        },
      };

      // Call the canvas API using APIService
      let result = await APIService.generateHtmlStructure(payload);

      if (result?.data) {
        // Handle content-page data
        result = result.data;
        if (result?.[CMS_PAGE_TYPES.CONTENT_PAGE] && Array.isArray(result[CMS_PAGE_TYPES.CONTENT_PAGE])) {
          const contentData: PreviewData[] = result[CMS_PAGE_TYPES.CONTENT_PAGE].map((item: any, index: number) => ({
            id: `${CMS_PAGE_TYPES.CONTENT_PAGE}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Content Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: CMS_PAGE_TYPES.CONTENT_PAGE
          }));
          setAiGeneratedPages(prev => [...prev, ...contentData]);
        }

        // Handle landing-page data
        if (result?.[CMS_PAGE_TYPES.LANDING_PAGE] && Array.isArray(result?.[CMS_PAGE_TYPES.LANDING_PAGE])) {
          const landingData: PreviewData[] = result?.[CMS_PAGE_TYPES.LANDING_PAGE].map((item: any, index: number) => ({
            id: `${CMS_PAGE_TYPES.LANDING_PAGE}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Landing Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: CMS_PAGE_TYPES.LANDING_PAGE
          }));
          setAiGeneratedPages(prev => [...prev, ...landingData]);
        }

        // Handle blog-page data
        if (result?.[CMS_PAGE_TYPES.BLOG] && Array.isArray(result?.[CMS_PAGE_TYPES.BLOG])) {
          const blogData: PreviewData[] = result?.[CMS_PAGE_TYPES.BLOG].map((item: any, index: number) => ({
            id: `${CMS_PAGE_TYPES.BLOG}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Blog Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: CMS_PAGE_TYPES.BLOG
          }));
          setAiGeneratedPages(prev => [...prev, ...blogData]);
        }
      } else {
        toast.error("Error in generating HTML structure");
        console.error('Failed to generate HTML structure:', result);
      }
    } catch (error) {
      toast.error("Error in generating HTML structure");
      console.error('Error generating HTML structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureHtmlForType = async (pageType: CMSPageType): Promise<string> => {
    const cached = cmsHtmlByType[pageType];
    if (cached) return cached;
    const base = `${(window as any)._env_.CMS_URL}`;
    const url = `${base}/api/html/aiPagePreview?refNum=${selectedTenant?.refNum}&context=${encodeURIComponent(promptInput)}&companyName=${selectedTenant?.tenantName}&pageType=${pageType}`;
    const response = await API.get(url, { withCredentials: false });
    const html = String(response?.data || "");
    setCmsHtmlByType(prev => ({ ...prev, [pageType]: html }));
    return html;
  };

  const generateCmsAiPreviewPage = async (pageType: CMSPageType) => {
    try {
      const base = `${(window as any)._env_.CMS_URL}`;
      const url = `${base}/api/html/aiPagePreview?refNum=${selectedTenant?.refNum}&context=${encodeURIComponent(promptInput)}&companyName=${selectedTenant?.tenantName}&pageType=${pageType}`;
      const htmlString = await ensureHtmlForType(pageType);
      const { displayName, idPrefix } = CMS_PAGE_TYPE_META[pageType];
      const item: PreviewData = {
        id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: htmlString ? "" : url,
        selector: "body > main",
        upload: false,
        title: displayName,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: "System",
        htmlStructure: htmlString || "",
        imageUrl: pageImage,
        type: pageType,
      };
      setAiGeneratedPages(prev => [...prev, item]);
    } catch (error) {
      console.error('Error generating CMS AI preview page:', error);
    }
  };

  const generateCmsAiPreviewPagesAllTypesInParallel = async () => {
    try {
      setIsLoading(true);
      const types = Object.values(CMS_PAGE_TYPES);
      const tasks = types.map(async (type) => {
        try {
          await generateCmsAiPreviewPage(type as CMSPageType);
        } catch (err) {
          console.error(`Parallel CMS AI preview generation failed for ${type}:`, err);
        }
      });
      await Promise.allSettled(tasks);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailTemplate = async (content?: string, manageLoading: boolean = true, id: string = "") => {
    try {
      const locale: string = siteMetaData?.defaultLanguage?.toLowerCase() || "en_us";
      const payload: any = {
        recruiterUserId: crmUserInfo?.userDetails?.id,
        displayName: crmUserInfo?.displayName,
        userEmail: crmUserInfo?.userName,
        import: false,
        refNum: selectedTenant.refNum,
      };
      if (content) {
        payload.content = content;
        payload.locale = locale;
        payload.siteVariant = "external";
      }

      let result = await APIService.generateCRMEmailTemplate(payload);
      const emailTemplateData: PreviewData[] = result?.["response"]?.map((item: any, index: number) => ({
        id: id,
        url: "",
        selector: "",
        upload: false,
        title: `Email Template`,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: "System",
        htmlStructure: item.htmlStructure,
        imageUrl: item.filePath || pageImage,
        type: "email-template"
      })) || [];
      if (emailTemplateData.length > 0) {
        setAiGeneratedPages(prev => [...prev, ...emailTemplateData]);
      }
      return result.response[0];
    } catch (error) {
      console.error('Error generating email template:', error);
      return null;
    }
  };
  const handlePreviewClick = (data: PreviewData) => {
    // Set the selected preview with HTML structure for PreviewView
    setSelectedPreview(data);
    setShowPreview(true);
  };

  const handleBackFromPreview = () => {
    setShowPreview(false);
    setSelectedPreview(null);
  };
  const handleSelect = (isSelected: boolean, cardId: string) => {
    setSelectedCards((prev: any) => {
      if (isSelected) {
        // Find the card being selected to get its type
        const selectedCard = aiGeneratedPages.find(card => card.id === cardId);
        if (selectedCard) {
          // Remove any existing card of the same type
          const filteredCards = prev.filter((id: any) => {
            const existingCard = aiGeneratedPages.find(card => card.id === id);
            return existingCard?.type !== selectedCard.type;
          });
          // Add the new selection
          return [...filteredCards, cardId];
        }
        return [...prev, cardId];
      } else {
        return prev.filter((id: any) => id !== cardId);
      }
    });
  };
  const handlePreviewOpen = (pageData: any, contentType: string = "") => {
    setSelectedPreview(pageData);
    setShowPreview(true);
  };

  // Helper to toggle section
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (showPreview && selectedPreview) {
    return (
      <PreviewView
        pageData={{
          ...selectedPreview,
          htmlStructure: selectedPreview.htmlStructure,
          title: selectedPreview.title || "HTML Preview",
        }}
        onBack={handleBackFromPreview}
        crmUserInfo={crmUserInfo}
        contentType={selectedPreview.contentType}
        isCheckingTaskProgress={false}
        className={` ${selectedPreview.type == "email-template" ? "" : "preview-pages-container-preview"}`}
        edit={false}
      />
    );
  }

  return (
    <>


      {/* Content Pages Section */}
      {aiGeneratedPages && aiGeneratedPages.length > 0 ? (
        <div className="preview-pages-container">
          <div className="cluster-tab-data-container ai-generated">

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <p className="cluster-tab-data-subheading">AI Generated Pages</p>
              <img
                src={arrowUp}
                alt="Toggle"
                style={{
                  width: 24,
                  height: 24,
                  transform: openSections['contentPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => toggleSection('contentPages')}
              />
            </div>
            {!showSaveOrDiscardModal && isLoading && (
              <div className="preview-pages-loading">
                <div className="loading-spinner"></div>
                <p>Generating content previews...</p>
              </div>
            )}
            {openSections['contentPages'] !== false && (
              <div className="cluster-detail-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {aiGeneratedPages.map((data, index) => {
                  const pageType = data.type;
                  if (data.type === CMS_PAGE_TYPES.CONTENT_PAGE) {
                    const contentPage = {
                      id: data.id,
                      name: CMS_PAGE_TYPE_META[pageType as CMSPageType].displayName,
                      createdDate: data.createdAt,
                      avatarUrl: data.imageUrl,
                      htmlStructure: data.htmlStructure,
                      url: data.url,
                      contentType: data.url ? CMS_PAGE_TYPES.CONTENT_PAGE : "HtmlPreview"
                    };
                    return (
                      <ClusterDetailCard
                        key={data.id}
                        aiContentPage={contentPage}
                        setPreviewDiv={handlePreviewOpen}
                        cardTag={false}
                        showStatus={false}
                        showDate={false}
                        selectable={true}
                        isSelected={selectedCards.includes(data.id)}
                        onSelect={(isSelected: boolean) => handleSelect(isSelected, data.id)}
                      />
                    );
                  }
                  else if (data.type === CMS_PAGE_TYPES.BLOG) {
                    const blogPage = {
                      id: data.id,
                      title: CMS_PAGE_TYPE_META[pageType as CMSPageType].displayName,
                      createdDate: data.createdAt,
                      avatarUrl: data.imageUrl,
                      htmlStructure: data.htmlStructure,
                      url: data.url,
                      contentType: CMS_PAGE_TYPES.BLOG
                    };
                    return (
                      <ClusterDetailCard
                        key={data.id}
                        aiBlog={blogPage}
                        setPreviewDiv={handlePreviewOpen}
                        cardTag={false}
                        showStatus={false}
                        showDate={false}
                        selectable={true}
                        isSelected={selectedCards.includes(data.id)}
                        onSelect={(isSelected: boolean) => handleSelect(isSelected, data.id)}
                      />
                    );
                  }
                  else if (data.type === CMS_PAGE_TYPES.LANDING_PAGE) {
                    const landingPage = {
                      id: data.id,
                      name: CMS_PAGE_TYPE_META[pageType as CMSPageType].displayName,
                      createdDate: data.createdAt,
                      avatarUrl: data.imageUrl,
                      htmlStructure: data.htmlStructure,
                      url: data.url,
                      contentType: data.url ? CMS_PAGE_TYPES.LANDING_PAGE : "HtmlPreview"
                    };
                    return (
                      <ClusterDetailCard
                        key={data.id}
                        aiLandingPage={landingPage}
                        setPreviewDiv={handlePreviewOpen}
                        cardTag={false}
                        showStatus={false}
                        showDate={false}
                        selectable={true}
                        onSelect={(isSelected: boolean) => handleSelect(isSelected, data.id)}
                        isSelected={selectedCards.includes(data.id)}
                      />
                    );
                  }
                })}
              </div>
            )}
          </div>
          <div className="cluster-tab-data-container ai-generated">
            {!showSaveOrDiscardModal && isCrmEmailTemplateLoading && (
              <div className="preview-pages-loading">
                <div className="loading-spinner"></div>
                <p>Generating email templates...</p>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <p className="cluster-tab-data-subheading">AI Generated Email Templates</p>
              <img
                src={arrowUp}
                alt="Toggle"
                style={{
                  width: 24,
                  height: 24,
                  transform: openSections['emailTemplates'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => toggleSection('emailTemplates')}
              />
            </div>
            {openSections['emailTemplates'] !== false && (
              <div className="cluster-detail-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {aiGeneratedPages.map((data, index) => {
                  if (data.type === "email-template") {
                    const emailTemplate = {
                      id: data.id,
                      templateName: "Email Template",
                      createdDate: data.createdAt,
                      avatarUrl: data.imageUrl,
                      htmlStructure: data.htmlStructure,
                      title: "Email Template",
                      type: "email-template"
                    };
                    return (
                      <ClusterDetailCard
                        key={data.id}
                        createdEmailTemplate={emailTemplate}
                        setPreviewDiv={handlePreviewOpen}
                        cardTag={false}
                        showStatus={false}
                        showDate={false}
                        selectable={true}
                        onSelect={(isSelected: boolean) => handleSelect(isSelected, data.id)}
                        isSelected={selectedCards.includes(data.id)}
                      />
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      ) : !showSaveOrDiscardModal && (
        <div className="preview-pages-container">
          <div className="preview-pages-loading">
            <div className="loading-spinner"></div>
            <p>Generating content previews...</p>
          </div>
        </div>
      )}
    </>
  );
}