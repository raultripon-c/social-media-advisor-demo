import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import PreviewView from "../../ContentClusterDetails/PreviewView/PreviewView";
import ClusterDetailCard from "../../ContentClusterDetails/ClusterDetailCard/ClusterDetailCard";
import { APIService } from "../../../utils/api.service";
import pageImage from "../../../assets/images/page-image.png";
import arrowUp from '../../../assets/svg/arrow-head.svg';
import "./PreviewPages.css";
import "../../ContentClusterDetails/ClusterDetailCard/ClusterDetailCard.css";
import "../../ContentClusterDetails/ContentClusterDetails.css";
import { getRefnumFromLink } from "../../../utils/appUtils";
import { toast } from "react-toastify";

interface PreviewData {
  id: string;
  url: string;
  selector: string;
  upload: boolean;
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
  generatePages: any;
  showSaveOrDiscardModal: any;
}

export default function PreviewPages({pagesBasedKeywords, promptInput, generatePages, showSaveOrDiscardModal}: PreviewPagesProps) {
  const [aiGeneratedPages, setAiGeneratedPages] = useState<PreviewData[]>([]);

  const [isLoading, setIsLoading] = useState(false);
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
    // Initialize with API call to generate HTML structure
    generateHtmlStructure();
  }, [generatePages]);

  const generateHtmlStructure = async () => {
    try {
      setIsLoading(true);

      const siteMetaDataResp: any = !siteMetaData ? (await APIService.getSiteMetaData(getRefnumFromLink(window.location.href, selectedTenant)))?.data?.data : siteMetaData;
      const payload = {
        companyName: selectedTenant.tenantName,
        refNum: selectedTenant.refNum,
        locale: "en_us",
        siteVariant: "external",
        url: "https://" + siteMetaDataResp?.domain + "/",
        selector: "body > main",
        upload: true,
        language: siteMetaData?.defaultLanguage?.toLowerCase()|| "en_us",
        pageTypes: "content-page,landing-page,blog-page",
        aiVoiceTone: "friendly",
        aiMetaData: {
          context: promptInput
        },
      };

      // Call the canvas API using APIService
      const result = await APIService.generateHtmlStructure(payload);
      
      if (true || result?.status === "success" && result?.data) {
        // Handle content-page data
        if (result?.["content-page"] && Array.isArray(result["content-page"])) {
          const contentData: PreviewData[] = result["content-page"].map((item: any, index: number) => ({
            id: `content-${index + 1}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Content Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: "content-page"
          }));
          setAiGeneratedPages(prev => [...prev, ...contentData]);
        }

        // Handle landing-page data
        if (result["landing-page"] && Array.isArray(result["landing-page"])) {
          const landingData: PreviewData[] = result["landing-page"].map((item: any, index: number) => ({
            id: `landing-${index + 1}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Landing Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: "landing-page"
          }));
          setAiGeneratedPages(prev => [...prev, ...landingData]);
        }

        // Handle blog-page data
        if (result["blog-page"] && Array.isArray(result["blog-page"])) {
          const blogData: PreviewData[] = result["blog-page"].map((item: any, index: number) => ({
            id: `blog-${index + 1}`,
            url: "",
            selector: "body > main",
            upload: false,
            title: `Blog Page ${index + 1}`,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: "System",
            htmlStructure: item.updatedHtmlStructure,
            imageUrl: item.filePath || pageImage,
            type: "blog-page"
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

  const handlePreviewClick = (data: PreviewData) => {
    // Set the selected preview with HTML structure for PreviewView
    setSelectedPreview(data);
    setShowPreview(true);
  };

  const handleBackFromPreview = () => {
    setShowPreview(false);
    setSelectedPreview(null);
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
          title: selectedPreview.title || "HTML Preview"
        }}
        onBack={handleBackFromPreview}
        crmUserInfo={crmUserInfo}
        contentType="HtmlPreview"
        isCheckingTaskProgress={false}
        className="preview-pages-container-preview"
      />
    );
  }

  return (
    <>
    {!showSaveOrDiscardModal && isLoading && (
        <div className="preview-pages-loading">
          <div className="loading-spinner"></div>
          <p>Generating HTML structure...</p>
        </div>
      )}

    {/* Content Pages Section */}
    {aiGeneratedPages && aiGeneratedPages.length > 0 && (
      <div className="preview-pages-container">
        <div className="cluster-tab-data-container ai-generated">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',width: '100%' }}>
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
          {openSections['contentPages'] !== false && (
            <div className="cluster-detail-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {aiGeneratedPages.map((data, index) => {
                let contentPage = null, blogPage = null, landingPage = null;
                if(data.type === "content-page"){
                const contentPage = {
                  id: data.id,
                  name: "Content Page",
                  createdDate: data.createdAt,
                  avatarUrl: data.imageUrl,
                  htmlStructure: data.htmlStructure
                };
                return (
                  <ClusterDetailCard
                    key={data.id}
                    aiContentPage={contentPage}
                    setPreviewDiv={handlePreviewOpen}
                  />
                );
              }
              else if(data.type === "blog-page"){
                blogPage = {
                  id: data.id,
                  title: "Blog Page",
                  createdDate: data.createdAt,
                  avatarUrl: data.imageUrl,
                  htmlStructure: data.htmlStructure
                };
                return (
                  <ClusterDetailCard
                    key={data.id}
                    aiBlog={blogPage}
                    setPreviewDiv={handlePreviewOpen}
                  />
                );
              }
              else if(data.type === "landing-page"){
                landingPage = {
                  id: data.id,
                  name: "Landing Page",
                  createdDate: data.createdAt,
                  avatarUrl: data.imageUrl,
                  htmlStructure: data.htmlStructure
                };
                return (
                  <ClusterDetailCard
                    key={data.id}
                    aiLandingPage={landingPage}
                    setPreviewDiv={handlePreviewOpen}
                  />
                );
              }
              })}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}