import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./ContentClusterDetails.css";
import ClusterDetailCard from "./ClusterDetailCard/ClusterDetailCard";
import ClusterAnalyticsCard from "./ClusterAnalyticsCard/ClusterAnalyticsCard";
import { APIService } from "../../../src/utils/api.service";

interface ClusterDetailsProps {
  data: any;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterDetails: React.FC<ClusterDetailsProps> = ({ data }) => {
  const location = useLocation();
  const { clusterId } = useParams();
  let { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate } = location.state || {};

  const [activeTab, setActiveTab] = useState(0);
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const tabs = ["All", "Pages", "Blogs", "Email Templates"];

  useEffect(() => {
    if (!pages || !blogs || !aiBlog || !aiContentPage || !emailTemplates || !createdEmailTemplate) {
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
          aiBlog = cluster?.aiCreatedBlog[0];
          aiContentPage = cluster?.aiCreatedContentPage[0];
          emailTemplates = cluster?.emailTemplates;
          createdEmailTemplate = cluster?.createdEmailTemplate[0];
        }
        location.state = { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate };
      });
    }
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
                {pages && (
                  <>
                    <>
                      <p className="cluster-tab-data-subheading">Content Pages</p>
                      <div className="cluster-detail-card-container">
                        {pages.contentPages &&
                          pages.contentPages.map((page: any) => <ClusterDetailCard contentPage={page} />)}
                      </div>
                    </>
                    <>
                      <p className="cluster-tab-data-subheading">Landing Pages</p>
                      <div className="cluster-detail-card-container">
                        {pages.landingPages &&
                          pages.landingPages.map((page: any) => <ClusterDetailCard landingPage={page} />)}
                      </div>
                    </>
                  </>
                )}

                {aiContentPage && (
                  <>
                    <p className="cluster-tab-data-subheading">AI Generated Content Page</p>
                    <ClusterDetailCard aiContentPage={aiContentPage} />
                  </>
                )}

                {aiBlog && (
                  <>
                    <p className="cluster-tab-data-subheading">AI Generated Blog</p>
                    <ClusterDetailCard aiBlog={aiBlog} />
                  </>
                )}
                {blogs && (
                  <>
                    <p className="cluster-tab-data-subheading">Matched Blog Articles</p>
                    <div className="cluster-detail-card-container">
                      {blogs.map((blog: any) => (
                        <ClusterDetailCard blog={blog} />
                      ))}
                    </div>
                  </>
                )}

                {emailTemplates && (
                  <>
                    <p className="cluster-tab-data-subheading">Matched Email Templates</p>
                    <div className="cluster-detail-card-container">
                      {emailTemplates.map((emailTemplate: any) => (
                        <ClusterDetailCard emailTemplate={emailTemplate} />
                      ))}
                    </div>
                  </>
                )}

                {createdEmailTemplate && (
                  <>
                    <p className="cluster-tab-data-subheading">Created Email Templates</p>
                    <ClusterDetailCard createdEmailTemplate={createdEmailTemplate} />
                  </>
                )}
              </div>
            );
          case 1:
            return (
              <div className="cluster-tab-data">
                {pages && (
                  <>
                    <>
                      <p className="cluster-tab-data-subheading">Content Pages</p>
                      <div className="cluster-detail-card-container">
                        {pages.contentPages &&
                          pages.contentPages.map((page: any) => <ClusterDetailCard contentPage={page} />)}
                      </div>
                    </>
                    <>
                      <p className="cluster-tab-data-subheading">Landing Pages</p>
                      <div className="cluster-detail-card-container">
                        {pages.landingPages &&
                          pages.landingPages.map((page: any) => <ClusterDetailCard landingPage={page} />)}
                      </div>
                    </>
                  </>
                )}
                {aiContentPage && (
                  <>
                    <p className="cluster-tab-data-subheading">AI Generated Content Page</p>
                    <ClusterDetailCard aiContentPage={aiContentPage} />
                  </>
                )}
              </div>
            );
          case 2:
            return (
              <div className="cluster-tab-data">
                {aiBlog && (
                  <>
                    <p className="cluster-tab-data-subheading">AI Generated Blog</p>
                    <ClusterDetailCard aiBlog={aiBlog} />
                  </>
                )}
                {blogs && (
                  <>
                    <p className="cluster-tab-data-subheading">Matched Blog Articles</p>
                    <div className="cluster-detail-card-container">
                      {blogs.map((blog: any) => (
                        <ClusterDetailCard blog={blog} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          case 3:
            return (
              <div className="cluster-tab-data">
                {emailTemplates && (
                  <>
                    <p className="cluster-tab-data-subheading">Matched Email Templates</p>
                    <div className="cluster-detail-card-container">
                      {emailTemplates.map((emailTemplate: any) => (
                        <ClusterDetailCard emailTemplate={emailTemplate} />
                      ))}
                    </div>
                  </>
                )}

                {createdEmailTemplate && (
                  <>
                    <p className="cluster-tab-data-subheading">Created Email Templates</p>
                    <ClusterDetailCard createdEmailTemplate={createdEmailTemplate} />
                  </>
                )}
              </div>
            );
          default:
            return <div className="cluster-tab-data">All</div>;
        }
      })()}
    </>
  );
};

export default ClusterDetails;
