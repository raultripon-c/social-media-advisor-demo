import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Loader } from "@phenom/react-ui-components";

import ContentClusterListCard from "./ContentClusterListCard/ContentClusterListCard";
import { APIService } from "../../../src/utils/api.service";
import "./ContentClustersList.css";

const contentTypesMap: any = {
  Pages: ["aiCreatedContentPage", "contentPages", "landingPages"],
  Blogs: ["aiCreatedBlog", "blogs"],
  "Email Templates": ["createdEmailTemplate", "emailTemplates"],
};

interface ContentClustersListProps {}

const ContentClustersList: React.FC<ContentClustersListProps> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const [contentClustersList, setContentClustersList] = useState([]);
  const [showLoader, setShowLoader] = useState<boolean>(false);

  useEffect(() => {
    setShowLoader(true);
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
    };
    APIService.getAllContentClusters(payload)
      .then((clusters: any) => {
        setContentClustersList(clusters);
        setShowLoader(false);
      })
      .catch((error) => {
        console.error("Error fetching content clusters:", error);
        setContentClustersList([]);
        setShowLoader(false);
      });
  }, []);

  const contentTypesForCluster = (cluster: any): string[] => {
    const result: string[] = [];
    const clusterKeys = Object.keys(cluster);
    Object.keys(contentTypesMap).forEach((contentType: string) => {
      const contentTypes = contentTypesMap[contentType];
      if (contentTypes.every((key: string) => clusterKeys.includes(key))) {
        result.push(contentType);
      }
    });
    return result;
  };

  const handleClusterClick = (cluster: any) => {
    console.log("Clicked", cluster);
    const newPath = location.pathname.replace(/\/content-clusters$/, "/content-cluster");
    const pagesObj = {
      contentPages: cluster.contentPages,
      landingPages: cluster.landingPages,
    };
    navigate(`${newPath}/${cluster.id}`, {
      state: {
        currentPage: "content-clusters",
        pages: pagesObj,
        blogs: cluster?.blogs,
        aiBlog: cluster?.aiCreatedBlog[0],
        aiContentPage: cluster?.aiCreatedContentPage[0],
        aiLandingPage: cluster?.aiCreatedLandingPage[0],
        emailTemplates: cluster?.emailTemplates,
        createdEmailTemplate: cluster?.createdEmailTemplate[0],
        clusterName: cluster?.clusterName,
      },
    });
  };

  return (
    <div className="content-clusters-list-container">
      {showLoader ? (
        <Loader title="Loading Content Clusters.." />
      ) : (
        <>
          <div className="content-clusters-list-header">
            <div className="content-clusters-list-title">Content Clusters List</div>
            <button className="create-content-cluster-btn" onClick={() => navigate(location.pathname.replace(/\/content-clusters$/, "/content-cluster/create"))}>
              + Create
            </button>
          </div>
          <div className="content-cluster-list-card-container">
            {contentClustersList &&
              contentClustersList.map((cluster: any) => (
                <ContentClusterListCard
                  title={cluster.clusterName || cluster.clusterTitle}
                  contentTypes={contentTypesForCluster(cluster)}
                  handleClick={() => handleClusterClick(cluster)}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentClustersList;
