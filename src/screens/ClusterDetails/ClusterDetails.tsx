import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ClusterDetails.css";
import ClusterDetailCard from "./ClusterDetailCard/ClusterDetailCard";
import ClusterAnalyticsCard from "./ClusterAnalyticsCard/ClusterAnalyticsCard";

interface ClusterDetailsProps {
  data: any;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterDetails: React.FC<ClusterDetailsProps> = ({ data }) => {
  const location = useLocation();
  const { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate } = location.state || {};

  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["All", "Pages", "Blogs", "Email Templates"];

  useEffect(() => {
    console.log("Pages FROM PARENT------->", pages);
  }, []);

  return (
    <>
      <div className="cluster-details-container">
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
      <div className="cluster-analytics">
        <ClusterAnalyticsCard title="Avg. Content Impressions" count={0} />
        <ClusterAnalyticsCard title="Content Interactions" count={0} />
        <ClusterAnalyticsCard title="Content Performance" count={0} />
      </div>
      {(() => {
        switch (activeTab) {
          case 0:
            return (
              <div className="cluster-tab-data">
                <p className="cluster-tab-data-subheading">Content Pages</p>
                <div className="cluster-detail-card-container">
                  {pages &&
                    pages.contentPages &&
                    pages.contentPages.map((page: any) => <ClusterDetailCard data={data} contentPage={page} />)}
                </div>
                <p className="cluster-tab-data-subheading">Landing Pages</p>
                <div className="cluster-detail-card-container">
                  {pages &&
                    pages.landingPages &&
                    pages.landingPages.map((page: any) => <ClusterDetailCard data={data} landingPage={page} />)}
                </div>
                <p className="cluster-tab-data-subheading">AI Generated Content Page</p>
                <ClusterDetailCard data={data} aiContentPage={aiContentPage} />
                <p className="cluster-tab-data-subheading">AI Generated Blog</p>
                <ClusterDetailCard data={data} aiBlog={aiBlog} />
                <p className="cluster-tab-data-subheading">Matched Blog Articles</p>
                <div className="cluster-detail-card-container">
                  {blogs && blogs.map((blog: any) => <ClusterDetailCard data={data} blog={blog} />)}
                </div>
                <p className="cluster-tab-data-subheading">Matched Email Templates</p>
                <div className="cluster-detail-card-container">
                  {emailTemplates &&
                    emailTemplates.map((emailTemplate: any) => (
                      <ClusterDetailCard data={data} emailTemplate={emailTemplate} />
                    ))}
                </div>

                <p className="cluster-tab-data-subheading">Created Email Templates</p>
                <ClusterDetailCard data={data} createdEmailTemplate={createdEmailTemplate} />
              </div>
            );
          case 1:
            return (
              <div className="cluster-tab-data">
                <p className="cluster-tab-data-subheading">Pages</p>
                <ClusterDetailCard data={data} />
              </div>
            );
          case 2:
            return (
              <div className="cluster-tab-data">
                <p className="cluster-tab-data-subheading">Blogs</p>
                <ClusterDetailCard data={data} />
              </div>
            );
          case 3:
            return <div className="cluster-tab-data">Email Templates</div>;
          default:
            return <div className="cluster-tab-data">All</div>;
        }
      })()}
    </>
  );
};

export default ClusterDetails;
