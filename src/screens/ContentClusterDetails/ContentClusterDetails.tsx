import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./ContentClusterDetails.css";
import ClusterDetailCard from "./ClusterDetailCard/ClusterDetailCard";
import ClusterAnalyticsCard from "./ClusterAnalyticsCard/ClusterAnalyticsCard";
import PreviewView from "./PreviewView/PreviewView";
import { APIService } from "../../../src/utils/api.service";
import InlineLoader from "../../components/loader/InlineLoader";


import backIcon from "../../assets/svg/leftArrow.svg";
import arrowUp from '../../assets/svg/arrow-head.svg';
import sparkleIcon from '../../assets/svg/black-sparkle.svg';
import penIcon from '../../assets/svg/pen.svg';

interface ClusterDetailsProps {
  data: any;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterDetails: React.FC<ClusterDetailsProps> = ({ data }) => {
  const location = useLocation();
  const { clusterId } = useParams();
  const navigate = useNavigate();
  let { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate, clusterName, aiLandingPage } = location.state || {};

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDiv, setPreviewDiv] = useState(false);
  const [selectedPageData, setSelectedPageData] = useState<any>(null);
  const [contentSourceFilter, setContentSourceFilter] = useState<string>("all");
  const [showContentSourceDropdown, setShowContentSourceDropdown] = useState(false);
  const [crmUserInfo, setCrmUserInfo] = useState<any>({});
  
  const sectionKeys = [
    'aiGenerated',
    'contentPages',
    'landingPages',
    'aiContentPage',
    'aiBlog',
    'blogs',
    'emailTemplates',
    'createdEmailTemplate',
    'aiLandingPage',
  ];
  const [openSections, setOpenSections] = useState<{[key:string]: boolean}>(
    sectionKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const tabs = ["All", "Pages", "Blogs", "Email Templates"];

  const currentPage = location.state?.currentPage;

  // Content source options
  const contentSourceOptions = [
    { value: "all", label: "All", icon: null },
    { value: "ai", label: "AI", icon: sparkleIcon },
    { value: "manual", label: "Manual", icon: penIcon },
  ];

  // Function to calculate counts for each tab
  const getTabCounts = () => {
    let allCount = 0;
    let pagesCount = 0;
    let blogsCount = 0;
    let emailTemplatesCount = 0;

    // Count AI generated content
    if (aiContentPage) allCount++;
    if (aiBlog) allCount++;
    if (aiLandingPage) allCount++;
    if (createdEmailTemplate) allCount++;

    // Count regular content pages
    if (pages?.contentPages) {
      allCount += pages.contentPages.length;
      pagesCount += pages.contentPages.length;
    }
    if (pages?.landingPages) {
      allCount += pages.landingPages.length;
      pagesCount += pages.landingPages.length;
    }

    // Count blogs
    if (blogs) {
      allCount += blogs.length;
      blogsCount += blogs.length;
    }

    // Count email templates
    if (emailTemplates) {
      allCount += emailTemplates.length;
      emailTemplatesCount += emailTemplates.length;
    }

    return { allCount, pagesCount, blogsCount, emailTemplatesCount };
  };

  const tabCounts = getTabCounts();

  const handleBackNavigation = () => {
    if (currentPage === "content-clusters") {
      navigate("/content-clusters");
    } else if (currentPage === "content-cluster/create") {
      navigate("/content-cluster/create");
    }
    else{
      navigate("/content-clusters");
    }
  };

  const handlePreviewOpen = (pageData: any) => {
    setSelectedPageData(pageData);
    setPreviewDiv(true);
  };

  const handlePreviewClose = () => {
    setPreviewDiv(false);
    setSelectedPageData(null);
  };

  const handleContentSourceFilterChange = (value: string) => {
    setContentSourceFilter(value);
    setShowContentSourceDropdown(false);
  };

  // Helper to toggle section
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to check if content should be shown based on filter
  const shouldShowContent = (contentType: 'ai' | 'manual') => {
    if (contentSourceFilter === "all") return true;
    return contentSourceFilter === contentType;
  };

  useEffect(() => {
    if (!pages && !blogs && !aiBlog && !aiContentPage && !emailTemplates && !createdEmailTemplate) {
      setIsLoading(true);
      const payload = {
        refNum: selectedTenant.refNum,
        locale: locale,
        siteVariant: "external",
      };
      APIService.getAllContentClusters(payload).then((clusters: any) => {
        const cluster = clusters.find((cluster: any) => cluster.id === clusterId);
        if (cluster) {
          pages = { contentPages: cluster?.contentPages, landingPages: cluster?.landingPages };
          blogs = cluster?.blogs;
          aiBlog = cluster?.aiCreatedBlog?.[0];
          aiContentPage = cluster?.aiCreatedContentPage?.[0];
          emailTemplates = cluster?.emailTemplates;
          createdEmailTemplate = cluster?.createdEmailTemplate?.[0];
          aiLandingPage = cluster?.aiCreatedLandingPage?.[0];
        }
        location.state = { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate, aiLandingPage };
        setIsLoading(false);
      }).catch((error) => {
        console.error("Error fetching cluster data:", error);
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    // setShowPromptSuggestions(true)
    APIService.getCRMUserInfo()
      .then((userInfo) => {
        if(userInfo?.userDetails?.id){
          setCrmUserInfo(userInfo);
        }else{
          setCrmUserInfo(window?.keycloakInstance?.tokenParsed?.userDetails);
        }
      })
      .catch((err) => console.error("Error getting CRM user info", err));
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowContentSourceDropdown(false);
      }
    };

    if (showContentSourceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContentSourceDropdown]);

  return (
    <>
    {previewDiv ? (
      <PreviewView 
        pageData={selectedPageData} 
        onBack={handlePreviewClose} 
        crmUserInfo={crmUserInfo}
      />
    ) : (
    <div className="cluster-details-wrapper">
      <div className="cluster-details-header">
        <div className="cluster-details-back-btn" onClick={handleBackNavigation}>
          <img src={backIcon} alt="back" />
          <span>Back</span>
        </div>
      </div>
      <div className="cluster-details-container">
        <div className="cluster-details-title">{clusterName}</div>
        <div className="cluster-details-tabs">
          {tabs.map((tab: string, index: number) => {
            const count = index === 0 ? tabCounts.allCount : 
                         index === 1 ? tabCounts.pagesCount :
                         index === 2 ? tabCounts.blogsCount :
                         tabCounts.emailTemplatesCount;
            
            return (
              <button
                key={tab}
                className={`cluster-tab ${activeTab === index ? "cluster-tab-active" : ""}`}
                onClick={() => setActiveTab(index)}
              >
                <span>{tab}</span>
                {count > 0 && (
                  <span 
                    className="cluster-tab-count"
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        

      </div>
      
      {isLoading && (
        <InlineLoader loadingMessage="Please wait, loading cluster details..." />
      )}
      
      {/* <div className="cluster-analytics">
        <ClusterAnalyticsCard title="Avg. Content Impressions" count={0} />
        <ClusterAnalyticsCard title="Content Interactions" count={0} />
        <ClusterAnalyticsCard title="Content Performance" count={0} />
      </div> */}
      {!isLoading && (() => {
        switch (activeTab) {
          case 0:
            return (
              <div className="cluster-tab-data">
                      {/* Content Source Filter */}
        <div className="cluster-details-filter">
          <div className="filter-dropdown">
            <button
              className="filter-dropdown-button"
              onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
            >
              <span className="filter-dropdown-button-text">Content source</span>
              <img 
                src={arrowUp} 
                alt="dropdown" 
                style={{
                  width: 16,
                  height: 16,
                  transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {showContentSourceDropdown && (
              <div className="filter-dropdown-menu">
                {contentSourceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                    onClick={() => handleContentSourceFilterChange(option.value)}
                  >
                    {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                    <span className="filter-dropdown-item-text">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
                {/* AI Generated Section - All AI content in one row */}
                {(aiContentPage || aiBlog || aiLandingPage || createdEmailTemplate) && shouldShowContent('ai') && (
                  <div className="cluster-tab-data-container ai-generated">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['aiGenerated'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('aiGenerated')}
                      />
                    </div>
                    {openSections['aiGenerated'] !== false && (
                      <div className="cluster-detail-card-container" style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
                        {aiContentPage && (
                          <ClusterDetailCard 
                            aiContentPage={aiContentPage} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                        {aiBlog && (
                          <ClusterDetailCard 
                            aiBlog={aiBlog} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                        {aiLandingPage && (
                          <ClusterDetailCard 
                            aiLandingPage={aiLandingPage} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                        {createdEmailTemplate && (
                          <ClusterDetailCard 
                            createdEmailTemplate={createdEmailTemplate} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Content Pages */}
                {pages && shouldShowContent('manual') && (
                  <>
                    {pages.contentPages && (
                      <div className="cluster-tab-data-container">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <p className="cluster-tab-data-subheading">Content Page</p>
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
                        {openSections['contentPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.contentPages.map((page: any) => (
                              <ClusterDetailCard 
                                contentPage={page} 
                                setPreviewDiv={handlePreviewOpen}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {pages.landingPages && (
                      <div className="cluster-tab-data-container">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <p className="cluster-tab-data-subheading">Landing Page</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['landingPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('landingPages')}
                          />
                        </div>
                        {openSections['landingPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.landingPages.map((page: any) => (
                              <ClusterDetailCard 
                                landingPage={page} 
                                setPreviewDiv={handlePreviewOpen}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Regular Blog Articles */}
                {blogs && shouldShowContent('manual') && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Blog Article</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['blogs'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('blogs')}
                      />
                    </div>
                    {openSections['blogs'] === true && (
                      <div className="cluster-detail-card-container">
                        {blogs.map((blog: any) => (
                          <ClusterDetailCard 
                            blog={blog} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Email Templates */}
                {emailTemplates && emailTemplates.length > 0 && shouldShowContent('manual') && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Email Template</p>
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
                    {openSections['emailTemplates'] === true && (
                      <div className="cluster-detail-card-container">
                        {emailTemplates.map((emailTemplate: any) => (
                          <ClusterDetailCard 
                            emailTemplate={emailTemplate} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          case 1:
            return (
              <div className="cluster-tab-data">
                      {/* Content Source Filter */}
        <div className="cluster-details-filter">
          <div className="filter-dropdown">
            <button
              className="filter-dropdown-button"
              onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
            >
              <span className="filter-dropdown-button-text">Content source</span>
              <img 
                src={arrowUp} 
                alt="dropdown" 
                style={{
                  width: 16,
                  height: 16,
                  transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {showContentSourceDropdown && (
              <div className="filter-dropdown-menu">
                {contentSourceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                    onClick={() => handleContentSourceFilterChange(option.value)}
                  >
                    {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                    <span className="filter-dropdown-item-text">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
                {/* AI Generated Pages Section */}
                {(aiContentPage || aiLandingPage) && shouldShowContent('ai') && (
                  <div className="cluster-tab-data-container ai-generated">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['aiContentPage'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('aiContentPage')}
                      />
                    </div>
                    {openSections['aiContentPage'] !== false && (
                      <div className="cluster-detail-card-container" style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
                        {aiContentPage && (
                          <ClusterDetailCard 
                            aiContentPage={aiContentPage} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                        {aiLandingPage && (
                          <ClusterDetailCard 
                            aiLandingPage={aiLandingPage} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Pages */}
                {pages && shouldShowContent('manual') && (
                  <>
                    {pages.contentPages && (
                      <div className="cluster-tab-data-container">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <p className="cluster-tab-data-subheading">Content Page</p>
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
                        {openSections['contentPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.contentPages.map((page: any) => (
                              <ClusterDetailCard 
                                contentPage={page} 
                                setPreviewDiv={handlePreviewOpen}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {pages.landingPages && (
                      <div className="cluster-tab-data-container">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <p className="cluster-tab-data-subheading">Landing Page</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['landingPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('landingPages')}
                          />
                        </div>
                        {openSections['landingPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.landingPages.map((page: any) => (
                              <ClusterDetailCard 
                                landingPage={page} 
                                setPreviewDiv={handlePreviewOpen}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {(!pages?.contentPages && !pages?.landingPages && !aiContentPage && !aiLandingPage) && (
                  <div>No Pages Data</div>
                )}
              </div>
            );
          case 2:
            return (
              <div className="cluster-tab-data">
                      {/* Content Source Filter */}
        <div className="cluster-details-filter">
          <div className="filter-dropdown">
            <button
              className="filter-dropdown-button"
              onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
            >
              <span className="filter-dropdown-button-text">Content source</span>
              <img 
                src={arrowUp} 
                alt="dropdown" 
                style={{
                  width: 16,
                  height: 16,
                  transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {showContentSourceDropdown && (
              <div className="filter-dropdown-menu">
                {contentSourceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                    onClick={() => handleContentSourceFilterChange(option.value)}
                  >
                    {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                    <span className="filter-dropdown-item-text">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
                {/* AI Generated Blogs Section */}
                {aiBlog && shouldShowContent('ai') && (
                  <div className="cluster-tab-data-container ai-generated">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['aiBlog'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('aiBlog')}
                      />
                    </div>
                    {openSections['aiBlog'] !== false && (
                      <div className="cluster-detail-card-container">
                        <ClusterDetailCard 
                          aiBlog={aiBlog} 
                          setPreviewDiv={handlePreviewOpen}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Blog Articles */}
                {blogs && shouldShowContent('manual') && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Blog Article</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['blogs'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('blogs')}
                      />
                    </div>
                    {openSections['blogs'] === true && (
                      <div className="cluster-detail-card-container">
                        {blogs.map((blog: any) => (
                          <ClusterDetailCard 
                            blog={blog} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(!aiBlog && !blogs) && (
                  <div>No Blogs Data</div>
                )}
              </div>
            );
          case 3:
            return (
              <div className="cluster-tab-data">
                      {/* Content Source Filter */}
        <div className="cluster-details-filter">
          <div className="filter-dropdown">
            <button
              className="filter-dropdown-button"
              onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
            >
              <span className="filter-dropdown-button-text">Content source</span>
              <img 
                src={arrowUp} 
                alt="dropdown" 
                style={{
                  width: 16,
                  height: 16,
                  transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {showContentSourceDropdown && (
              <div className="filter-dropdown-menu">
                {contentSourceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                    onClick={() => handleContentSourceFilterChange(option.value)}
                  >
                    {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                    <span className="filter-dropdown-item-text">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
                {/* AI Generated Email Templates Section */}
                {createdEmailTemplate && shouldShowContent('ai') && (
                  <div className="cluster-tab-data-container ai-generated">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['createdEmailTemplate'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('createdEmailTemplate')}
                      />
                    </div>
                    {openSections['createdEmailTemplate'] !== false && (
                      <div className="cluster-detail-card-container">
                        <ClusterDetailCard 
                          createdEmailTemplate={createdEmailTemplate} 
                          setPreviewDiv={handlePreviewOpen}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Email Templates */}
                {emailTemplates && emailTemplates.length > 0 && shouldShowContent('manual') && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Email Template</p>
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
                    {openSections['emailTemplates'] === true && (
                      <div className="cluster-detail-card-container">
                        {emailTemplates.map((emailTemplate: any) => (
                          <ClusterDetailCard 
                            emailTemplate={emailTemplate} 
                            setPreviewDiv={handlePreviewOpen}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(!createdEmailTemplate && (!emailTemplates || emailTemplates.length === 0)) && (
                  <div>No Email Templates Data</div>
                )}
              </div>
            );
          default:
            return <div className="cluster-tab-data">All</div>;
        }
      })()}
    </div>
    )}
    </>
  );
};

export default ClusterDetails;
