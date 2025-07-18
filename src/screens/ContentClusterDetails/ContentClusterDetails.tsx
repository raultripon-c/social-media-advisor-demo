import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./ContentClusterDetails.css";
import ClusterDetailCard from "./ClusterDetailCard/ClusterDetailCard";
import ClusterAnalyticsCard from "./ClusterAnalyticsCard/ClusterAnalyticsCard";
import PreviewView from "./PreviewView/PreviewView";
import { APIService } from "../../../src/utils/api.service";
import InlineLoader from "../../components/loader/InlineLoader";


import backIcon from "../../assets/svg/leftArrow.svg";
import arrowUp from '../../assets/svg/arrow-up.svg';
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
  const sectionKeys = [
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

  // Helper to toggle section
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
    {previewDiv ? (
      <PreviewView 
        pageData={selectedPageData} 
        onBack={handlePreviewClose} 
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
          {tabs.map((tab: string) => {
            return (
              <button
                className={`cluster-tab ${activeTab === tabs.indexOf(tab) ? "cluster-tab-active" : ""}`}
                onClick={() => setActiveTab(tabs.indexOf(tab))}
              >
                {tab}
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
                {pages && (
                  <>
                    {pages.contentPages && (
                      <div className="cluster-tab-data-container">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <p className="cluster-tab-data-subheading">Content Pages</p>
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
                          <p className="cluster-tab-data-subheading">Landing Pages</p>
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

                {aiContentPage && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated Content Page</p>
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
                    {openSections['aiContentPage'] === true && (
                      <ClusterDetailCard 
                        aiContentPage={aiContentPage} 
                        setPreviewDiv={handlePreviewOpen}
                      />
                    )}
                  </div>
                )}

                {aiBlog && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated Blog</p>
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
                    {openSections['aiBlog'] === true && (
                      <ClusterDetailCard 
                        aiBlog={aiBlog} 
                        setPreviewDiv={handlePreviewOpen}
                      />
                    )}
                  </div>
                )}
                {blogs && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Matched Blog Articles</p>
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

                {emailTemplates && emailTemplates.length > 0 && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Matched Email Templates</p>
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

                {createdEmailTemplate && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">Created Email Templates</p>
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
                    {openSections['createdEmailTemplate'] === true && (
                      <ClusterDetailCard 
                        createdEmailTemplate={createdEmailTemplate} 
                        setPreviewDiv={handlePreviewOpen}
                      />
                    )}
                  </div>
                )}
                {aiLandingPage && (
                  <div className="cluster-tab-data-container">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p className="cluster-tab-data-subheading">AI Generated Landing Page</p>
                      <img
                        src={arrowUp}
                        alt="Toggle"
                        style={{
                          width: 24,
                          height: 24,
                          transform: openSections['aiLandingPage'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => toggleSection('aiLandingPage')}
                      />
                    </div>  
                    {openSections['aiLandingPage'] === true && (
                      <ClusterDetailCard 
                        aiLandingPage={aiLandingPage} 
                        setPreviewDiv={handlePreviewOpen}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          case 1:
            return (
              <div className="cluster-tab-data">
                {pages && (
                  <>
                    {pages.contentPages && (
                      <div className="cluster-tab-data-container">
                        <p className="cluster-tab-data-subheading">Content Pages</p>
                        <div className="cluster-detail-card-container">
                          {pages.contentPages.map((page: any) => (
                            <ClusterDetailCard 
                              contentPage={page} 
                              setPreviewDiv={handlePreviewOpen}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {pages.landingPages && (
                      <div className="cluster-tab-data-container">
                        <p className="cluster-tab-data-subheading">Landing Pages</p>
                        <div className="cluster-detail-card-container">
                          {pages.landingPages.map((page: any) => (
                            <ClusterDetailCard 
                              landingPage={page} 
                              setPreviewDiv={handlePreviewOpen}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {aiContentPage && (
                  <div className="cluster-tab-data-container">
                    <p className="cluster-tab-data-subheading">AI Generated Content Page</p>
                    <ClusterDetailCard 
                      aiContentPage={aiContentPage} 
                      setPreviewDiv={handlePreviewOpen}
                    />
                  </div>
                )}
                {aiLandingPage && (
                  <div className="cluster-tab-data-container">
                    <p className="cluster-tab-data-subheading">AI Generated Landing Page</p>
                    <ClusterDetailCard 
                      aiLandingPage={aiLandingPage} 
                      setPreviewDiv={handlePreviewOpen}
                    />
                  </div>
                )}
                {(!pages?.contentPages && !pages?.landingPages && !aiContentPage && !aiLandingPage) && (
                  <div>No Pages Data</div>
                )}
              </div>
            );
          case 2:
            return (
              <div className="cluster-tab-data">
                {aiBlog ? (
                  <>
                    <p className="cluster-tab-data-subheading">AI Generated Blog</p>
                    <ClusterDetailCard 
                      aiBlog={aiBlog} 
                      setPreviewDiv={handlePreviewOpen}
                    />
                  </>
                ) : blogs ? (
                  <>
                    <p className="cluster-tab-data-subheading">Matched Blog Articles</p>
                    <div className="cluster-detail-card-container">
                      {blogs.map((blog: any) => (
                        <ClusterDetailCard 
                          blog={blog} 
                          setPreviewDiv={handlePreviewOpen}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div>No Blogs Data</div>
                )}
              </div>
            );
          case 3:
            return (
              <div className="cluster-tab-data">
                {emailTemplates && emailTemplates.length > 0 ? (
                  <div className="cluster-tab-data-container">
                    <p className="cluster-tab-data-subheading">Matched Email Templates</p>
                    <div className="cluster-detail-card-container">
                      {emailTemplates.map((emailTemplate: any) => (
                        <ClusterDetailCard 
                          emailTemplate={emailTemplate} 
                          setPreviewDiv={handlePreviewOpen}
                        />
                      ))}
                    </div>
                  </div>
                ) : createdEmailTemplate ? (
                  <div className="cluster-tab-data-container">
                    <p className="cluster-tab-data-subheading">Created Email Templates</p>
                    <ClusterDetailCard 
                      createdEmailTemplate={createdEmailTemplate} 
                      setPreviewDiv={handlePreviewOpen}
                    />
                  </div>
                ) : (
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
