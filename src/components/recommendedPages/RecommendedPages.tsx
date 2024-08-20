import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { API } from "../../utils/api";
import "./RecommendedPages.scss";
import { Button } from "@phenom/react-ui-components";
import noRecommIcon from "../../assets/images/dashboard/noRecommIcon.svg";
import { Loader } from "@phenom/react-ui-components";

export const RecommendedPages = (props: any) => {
  const {} = props;
  const selectedTenant = useSelector(
    (state: any) => state.customer.selectedTenant
  );

  let [pageRecommendation, setRecommendedPagesData] = useState<any>(null);
  let [isRecommendationsReady, setRecommendationsReady] =
    useState<boolean>(false);
  const CMS_URL = (window as any)._env_.CMS_URL;
  const { code, type } = window.orgInfo;
  useEffect(() => {
    const loginAndFetchRecommendations = async () => {
      try {
        const loginResponse = await API.post(
          `${CMS_URL}/api/txeLogin`,
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
          `${CMS_URL}/api/getPageRecommendations`,
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
          setRecommendationsReady(true);
        }
        console.log(
          "response from the get tenant variants",
          recommendationsResponse
        );
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    loginAndFetchRecommendations();
  }, [selectedTenant, code, type]);

  useEffect(() => {}, [isRecommendationsReady]);

  const getRecommendedPages = (visibleData: any) => {
    const recommendedData = visibleData.slice(0, 4);
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
        <img src={noRecommIcon} alt="" />
        <span className="container-name">Recommended pages</span>
      </div>
      {!isRecommendationsReady ? (
        <div className="no-recommended-pages-card">
          <div className="no-recommended-pages-card-body">
            <Loader title="Please Wait, Loading..." />
          </div>
        </div>
      ) : pageRecommendation?.data?.length > 0 ? (
        <div className="recommended-pages-cards">
          {getRecommendedPages(pageRecommendation.data)}
        </div>
      ) : (
        <div className="no-recommended-pages-card">
          <div className="no-recommended-pages-icon">
            <img
              src="https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/svgexport-49.svg"
              className="search-icon-img"
              alt="search-icon"
            />
          </div>
          <div className="no-recommended-pages-card-body">
            <span>Great Job!</span>
            <span>You already created the most relevant pages</span>
          </div>
        </div>
      )}
    </div>
  );
};
