import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { API } from "../../utils/api";
import "./RecommendedPages.scss";
import { Button } from "@phenom/react-ui-components";
import { AppStore } from "store";

export const RecommendedPages = (props: any) => {
  const {} = props;
  const companyNotificationIcon = ``;
  const selectedTenant = useSelector(
    (state: any) => state.customer.selectedTenant
  );
  const [showAll, setShowAll] = useState(false); // State to toggle visibility

//   const mockGetPageRecommendationPagesResponse = require("./getPageRecommendations.json");
  let [pageRecommendation, setRecommendedPagesData] = useState<any>(null);
  const CMS_PREPROD_API_URL = (window as any)._env_.CMS_PREPROD_API_URL;
  const { code, type } = window.orgInfo;
  useEffect(() => {
    const loginAndFetchRecommendations = async () => {
      try {
        const loginResponse = await API.post(
          `${CMS_PREPROD_API_URL}/txeLogin`,
          {
            "ph-org-code": code,
            "ph-org-type": type,
            token: window.keycloakInstance.token,
            expires_in: window?.keycloakInstance?.tokenParsed?.exp,
          },
          { withCredentials: true }
        );
        console.log(loginResponse);
  
        const refNum = selectedTenant?.refNum;
        const locale = sessionStorage.getItem("locale") || "en_us";
  
        const recommendationsResponse = await API.post(
          `${CMS_PREPROD_API_URL}/getPageRecommendations`,
          {
            batchSize: 6,
            isSVRequired: false,
            locale,
            offset: 0,
            refNum,
            siteVariant: "external",
          },
          { withCredentials: true }
        );
  
        if (recommendationsResponse && recommendationsResponse.data) {
          setRecommendedPagesData(recommendationsResponse.data);
        }
        console.log("response from the get tenant variants", recommendationsResponse);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  
    loginAndFetchRecommendations();
  }, [selectedTenant, code, type]);
  //   let mockResponse: Array<any> = [];
  //   mockResponse = pageRecommendation && pageRecommendation.data

  const getRecommendedPages = (visibleData: any) => {
    const recommendedData = showAll ? visibleData : visibleData.slice(0, 4);
    for (let i = 0; i < recommendedData.length; i++) {
      const values = Object.entries(recommendedData[i].value)
        .filter(
          ([key]) =>
            ![
              "category",
              "city",
              "cityState",
              "location",
              "citylocation",
              "cityLocation",
            ].includes(key)
        )
        .map(([key, value]) => [key, value[0]]);
      recommendedData[i]["valuesUpdated"] = values;
    }

    const recommendedPagesElement = [];
    for (let cardContent of recommendedData) {
      recommendedPagesElement.push(
        <div className="recommended-pages-card">
          <div className="card-header">
            <div className="card-type">
              <div
                dangerouslySetInnerHTML={{ __html: companyNotificationIcon }}
              ></div>
              <span className="card-category-name">
                {cardContent.value.city ||
                  cardContent.value.cityState ||
                  cardContent.value.location ||
                  cardContent.value.citylocation ||
                  cardContent.value.cityLocation}
              </span>
            </div>
            <div className="card-jobs">
              <span className="card-jobs-count">
                {cardContent.jobCount} jobs
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="card-title">{cardContent.value.category}</div>
            <div className="card-description">
              Persona:{" "}
              {cardContent.siteVariant !== "external" &&
              cardContent.siteVariant !== "internal"
                ? cardContent.siteVariant
                : cardContent.siteVariant === "external"
                ? "Career Site"
                : "Employee Experience"}
            </div>
            {cardContent.valuesUpdated.map((val: any, index: number) => (
              <span className="component-type-bg-au" key={index}>
                <span className="component-type-text-au">
                  {val[0]}: {val[1]}
                </span>
              </span>
            ))}
          </div>
          <Button
            size="small"
            buttonType="naked"
            text="Generate Page"
            iconLeft="https://pp-cdn.phenompeople.com/CareerConnectResources/eq/pcs/common/Sparkles.svg"
            className="primary-sparkles-button"
            onClick={() => console.log("user clicked generate page")}
          />
        </div>
      );
    }
    return recommendedPagesElement;
  };
  return (
    <div className="recommended-pages-container">
      <div className="recommended-pages-name-container">
        <span className="container-name">Recommended pages</span>
      </div>
      <div className="recommended-pages-cards">
        {pageRecommendation &&
        pageRecommendation.data &&
        pageRecommendation.data.length > 0 ? (
          getRecommendedPages(pageRecommendation.data)
        ) : (
          <div className="no-recommended-pages-card">
            <span>Great Job!</span>
            <span>You already created the most relevant pages </span>
          </div>
        )}
      </div>
      {/* <div>{pageRecommendation &&
        pageRecommendation.data &&
        pageRecommendation.data.length > 6 && (
          <Button
            size="small"
            buttonType="primary"
            text={showAll ? "Show Less" : "Show More"}
            onClick={() => setShowAll(!showAll)}
          />
        )}</div> */}
    </div>
  );
};
