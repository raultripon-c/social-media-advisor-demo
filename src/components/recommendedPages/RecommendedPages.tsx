import { useEffect, useState } from "react";
import React from "react";
import { API } from "../../utils/api";
import "./RecommendedPages.scss";
import {
    Button,
  } from "@phenom/react-ui-components";

export const RecommendedPages = (props: any) => {
    const {} = props;
    const companyNotificationIcon = ``;

    const mockGetPageRecommendationPagesResponse = require('./getPageRecommendations.json');
    let [pageRecommendation, setRecommendedPagesData] = useState<any>(null);
    const [error, setError] = useState(null);
    const CMS_PREPROD_API_URL = (window as any)._env_.CMS_PREPROD_API_URL;
    const { code, type } = window.orgInfo;
    useEffect(() => {
        API.post(`${CMS_PREPROD_API_URL}/txeLogin`, {
            "ph-org-code":code,
            "ph-org-type": type,
            "token": window.keycloakInstance.token,
            "expires_in":window?.keycloakInstance?.tokenParsed?.exp
        }, {
            withCredentials: true,
        }).then((response) => {
            console.log(response);
            API.post(`${CMS_PREPROD_API_URL}/getTenantVariants`, {
                "locale":"en_us",
                "refNum": 'WAWWAUS'
            }, {
                withCredentials: true,
            }).then((response) => {
                if(response != null && response.data != null) {
                    setRecommendedPagesData(response.data);
                }
                console.log("response from the get tenant variants "+response)
            })
        });
      }, []); 

    let mockData = mockGetPageRecommendationPagesResponse.data;
    const recommendedPagesElement = [];
    if(mockData != null) {
        for (let i = 0; i < mockData.length; i++) {         
            const values = Object.entries(mockData[i].value)
            .filter(([key]) => !['category', 'city', 'cityState', 'location', 'citylocation', 'cityLocation'].includes(key))
            .map(([key, value]) => [key, mockData[0]]);
            mockData[i]['valuesUpdated'] = values;
        }
    for (let cardContent of mockData){
        recommendedPagesElement.push(
            <div className="recommended-pages-card">
                <div className="card-header">
                    <div className="card-type">
                        <div dangerouslySetInnerHTML={{ __html: companyNotificationIcon }}></div>
                        <span className="card-category-name">{
                            cardContent.value.city || cardContent.value.cityState || 
                            cardContent.value.location || cardContent.value.citylocation || 
                            cardContent.value.cityLocation
                        }</span>
                    </div>
                    <div className="card-jobs">
                        <span className="card-jobs-count">{cardContent.jobCount} jobs</span>
                    </div>
                </div>
                <div className="card-content">
                    <div className="card-title">{cardContent.value.category}
                    </div>
                    <div className="card-description">Persona: {
                        (cardContent.siteVariant !== 'external' && cardContent.siteVariant !== 'internal') ? 
                        cardContent.siteVariant : (cardContent.siteVariant === 'external') ? 
                        'Career Site' : 'Employee Experience' 
                        }
                    </div>
                    {
                    cardContent.valuesUpdated.map((val: any, index: number) => (
                            <span className="component-type-bg-au" key={index}>
                                <span className="component-type-text-au">{val[0]}: {val[1]}</span>
                            </span>
                        ))
                    }
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
        )
    }
    }
    
    
    return (
        <div className="recommended-pages-container">
            <div className="recommended-pages-name-container">
                <span className="container-name">Recommended pages</span>
            </div>
            <div className="recommended-pages-cards">
                {
                    mockData ? recommendedPagesElement: 
                    <div className="no-recommended-pages-card">
                        <span>Great Job!</span>
                        <span>You already created the most relevant pages</span>
                    </div>
                }
            </div>
        </div>
    );
};