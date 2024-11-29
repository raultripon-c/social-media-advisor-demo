import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
// import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import React from "react";
import "./RecommendedPages.scss";
import { getLink } from "../../utils/appUtils";
import noRecommIcon from "../../assets/images/dashboard/noRecommIcon.svg";
import {APIService} from "../../utils/api.service"
import { Loader, JobPageRecommendationCard } from "@phenom/react-ui-components";
import { AppStore } from "store";

export const RecommendedPages = (props: any) => {
  const selectedTenant = useSelector(
    (state: any) => state.customer.selectedTenant
  );
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const siteMetaData = useSelector((state: AppStore) => state.customer.siteMetaData);

  let [pageRecommendation, setRecommendedPagesData] = useState<any>(null);
  let [recommendationsLoader, setRecommendationsLoader] = useState<boolean>(true);
  const { code, type } = window.orgInfo;
  
  useEffect(() => {
    loginAndFetchRecommendations();
  }, []);

  const loginAndFetchRecommendations = async () => {
    try {
      const txeLoginResponse = await APIService.triggerTxeLogin()
      console.log('TXELogin Response:', txeLoginResponse);
      if(txeLoginResponse.status === 200 && txeLoginResponse.data.status === 'success') {
        const txeLoginCustomEvent = new CustomEvent('txeLoginEvent');
        window.dispatchEvent(txeLoginCustomEvent);

        const refNum = selectedTenant?.refNum;
        const locale = "en_us";
        const recommendationsResponse = await APIService.getPageRecommendations(locale, refNum);

        if (recommendationsResponse?.status) {
          setRecommendationsLoader(false);
          const { status, data } = recommendationsResponse;
          if (status === 200 && data?.status === "success" && Array.isArray(data.data)) {
            setRecommendedPagesData(data.data);
          } else {
            setRecommendedPagesData([]);
          }
        }
      }

    } catch (error) {
      setRecommendationsLoader(false);
      // toast.error("Failed to fetch recommendations");
      console.error("Error fetching recommendations data", error);
    }
  };


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
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value[0]];
          }
          return [key, value];
        });
      recommendedData[i]["valuesUpdated"] = values;
    }

    const navigateOnClick = (cardContent: object) => {
      const cmsUrl = (window as any)["_env_"].CMS_URL;
      const config = {
        appType: "external",
        appConfig: { link: cmsUrl + "/tier3" },
        context: "customer",
        requestParams: {
          lsrc: "txe",
          lsw: "_self",
          refNum: "",
          customerCode: "",
          route: "dashboard-tier3",
          payload: '',
          site: btoa(JSON.stringify(siteMetaData))
        },
      };
      const link = getLink(config, {
        refNum: selectedTenant?.refNum,
        customerCode: selectedTenant?.customerCode || customerDetails?.data?.customerCode,
        payload: btoa(JSON.stringify(cardContent)),
      });
      if (link && !isEmpty(link)) window.open(link, "_blank");
      else {
        // toast.dismiss();
        // toast.error("Link is not provided for navigation");
      }
    };

    const recommendedPagesElement = [];
    for (let cardContent of recommendedData) {
      recommendedPagesElement.push(
        <JobPageRecommendationCard
          category={cardContent.value.category}
          cardLocation={
            cardContent.value.city ||
            cardContent.value.cityState ||
            cardContent.value.location ||
            cardContent.value.citylocation ||
            cardContent.value.cityLocation
          }
          jobCount={cardContent.jobCount}
          persona={
            cardContent.siteVariant !== "external" &&
            cardContent.siteVariant !== "internal"
              ? cardContent.siteVariant
              : cardContent.siteVariant === "external"
              ? "Career Site"
              : "Employee Experience"
          }
          cardUpdatedValues={cardContent.valuesUpdated}
          cardContent={cardContent}
          navigateOnClick={(cardContent: object) => {
            navigateOnClick(cardContent);
          }}
        />
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
      {recommendationsLoader ? (
        <div className="no-recommended-pages-card">
          <div className="no-recommended-pages-card-body">
            <Loader title="Please Wait, Loading..." />
          </div>
        </div>
      ) : pageRecommendation?.length > 0 ? (
        <div className="recommended-pages-cards">
          {getRecommendedPages(pageRecommendation)}
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
