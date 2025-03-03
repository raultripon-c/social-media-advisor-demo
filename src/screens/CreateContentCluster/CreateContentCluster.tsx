import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import MultiSelectButton from "../../components/MultiSelectButton/MultiSelectButton";
import SelectionList from "../../components/SelectionList/SelectionList";
import SupportingMaterial from "./SupportingMaterial/SupportingMaterial";
import ClusterDetails from "../ContentClusterDetails/ContentClusterDetails";
import { Loader } from "@phenom/react-ui-components";
import { APIService } from "../../utils/api.service";
import segmentIcon from "../../assets/svg/users.svg";
import refreshIcon from "../../assets/svg/refresh.svg";
import sparkleIcon from "../../assets/svg/sparkle.svg";
import linkIcon from "../../assets/svg/link.svg";
import "./CreateContentCluster.css";

interface CreateContentClusterProps {}

const supportingMaterialsConfig = [
  { name: "Segments", icon: segmentIcon },
  { name: "Links", icon: linkIcon },
  { name: "Reference Page", icon: linkIcon },
];

const CreateContentCluster: React.FC<CreateContentClusterProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>("");
  const [sampleSelectionListItems, setSampleSelectionListItems] = useState<string[]>([
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
  ]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState<boolean>(false);
  const [crmUserInfo, setCrmUserInfo] = useState<any>({});
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["Content Page", "Landing Page", "Blog"]);

  const saveContentCluster = (payload: any) => {
    APIService.createContentCluster(payload).then((clusterDetail) => {
      console.log("Content Cluster created:", clusterDetail);
      setShowLoader(false);

      navigateToClusterDetails(clusterDetail);
    });
  };

  const navigateToClusterDetails = (clusterDetails: any) => {
    const newPath = location.pathname.replace(/\/create$/, "");
    const pagesObj = {
      contentPages: clusterDetails.contentPages,
      landingPages: clusterDetails.landingPages,
    };
    navigate(`${newPath}/${clusterDetails.id}`, {
      state: {
        pages: pagesObj,
        blogs: clusterDetails?.blogs,
        aiBlog: clusterDetails?.aiCreatedBlog[0],
        aiContentPage: clusterDetails?.aiCreatedContentPage[0],
        emailTemplates: clusterDetails?.emailTemplates,
        createdEmailTemplate: clusterDetails?.createdEmailTemplate[0],
      },
    });
  };

  useEffect(() => {
    APIService.getCRMUserInfo()
      .then((userInfo) => {
        setCrmUserInfo(userInfo);
      })
      .catch((err) => console.error("Error getting CRM user info", err));
  }, []);

  const fetchPagesForContent = (keywords: string[]) => {
    return APIService.getPagesForContent({
      keywords,
      deviceType: "desktop",
      language: locale,
      refnum: selectedTenant.refNum,
      refNum: selectedTenant.refNum,
    });
  };

  const createCMSAIPage = () => {
    return APIService.generateCMSAIPage({
      refNum: selectedTenant.refNum,
      locale,
      siteVariant: "external",
      content: promptInput,
    });
  };

  const createCRMEmailTemplate = () => {
    return APIService.generateCRMEmailTemplate({
      refNum: selectedTenant.refNum,
      locale,
      siteVariant: "external",
      content: promptInput,
      recruiterUserId: crmUserInfo.userDetails.id,
      displayName: crmUserInfo.displayName,
      userEmail: crmUserInfo.userName,
    });
  };

  const fetchEmailTemplatesForContent = () => {
    return APIService.getEmailTemplatesForContent({
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
      keywords: promptInput.split(" "),
    });
  };

  const fetchAllEmailTemplates = () => {
    return APIService.getAllEmailTemplates({
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
    });
  };

  const fetchBlogsForContent = (keywords: string[]) => {
    return APIService.getBlogsForContent({
      keywords,
      applyFilters: false,
      locale,
      refNum: selectedTenant.refNum,
      siteVariant: "external",
    });
  };

  const fetchAllBlogsDetails = () => {
    return APIService.getAllBlogsDetails({
      refNum: selectedTenant.refNum,
      locale,
      siteVariant: "external",
      applyFilters: false,
    });
  };

  const createCMSAiBlog = () => {
    return APIService.generateCMSAIBlog({
      companyName: selectedTenant.tenantName,
      refNum: selectedTenant.refNum,
      locale,
      siteVariant: "external",
      content: promptInput,
    });
  };

  const handlePromptSubmit = () => setShowPromptSuggestions(true);

  const handleClusterCreation = () => {
    const keywords = promptInput.split(" ");
    setShowLoader(true);

    const apiCalls: Promise<any>[] = [];

    if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
      apiCalls.push(fetchPagesForContent(keywords));
      apiCalls.push(createCMSAIPage());
    }

    if (selectedContentTypes.includes("Blog")) {
      apiCalls.push(fetchBlogsForContent(keywords));
      apiCalls.push(createCMSAiBlog());
    }

    if (selectedContentTypes.includes("Email Template")) {
      apiCalls.push(createCRMEmailTemplate());
      apiCalls.push(fetchEmailTemplatesForContent());
    }

    Promise.all(apiCalls)
      .then(async (responses) => {
        let responseIndex = 0;
        let pages: any,
          aiContentPage: any,
          blogs: any,
          createdBlogDetail: any,
          filteredEmailTemplates: any,
          createdEmailTemplateData: any;

        if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
          pages = responses[responseIndex++];
          aiContentPage = responses[responseIndex++].data;
        }

        if (selectedContentTypes.includes("Blog")) {
          const blogsResponse = responses[responseIndex++];
          const createdBlog = responses[responseIndex++];
          blogs = blogsResponse.blogDetails;

          const allBlogs = await fetchAllBlogsDetails();
          createdBlogDetail = allBlogs["all"].find((blog: any) => blog.articleId === createdBlog.articleId);
        }

        if (selectedContentTypes.includes("Email Template")) {
          const emailTemplate = responses[responseIndex++];
          filteredEmailTemplates = responses[responseIndex++]["filteredEmailTemplates"];

          const allEmailTemplates = await fetchAllEmailTemplates();
          createdEmailTemplateData = allEmailTemplates.find((template: any) => template.templateName === promptInput);
        }

        saveContentCluster({
          refNum: selectedTenant.refNum,
          locale,
          siteVariant: "external",
          contentPages: pages?.contentPages,
          landingPages: pages?.landingPages,
          blogs: blogs,
          aiCreatedBlog: [createdBlogDetail],
          aiCreatedContentPage: [aiContentPage],
          emailTemplates: filteredEmailTemplates,
          createdEmailTemplate: [createdEmailTemplateData],
          clusterTitle: promptInput,
        });
      })
      .catch((err) => {
        console.error("Error during cluster creation:", err);
        setShowLoader(false);
      });
  };

  return (
    <>
      {/* <Routes>
        <Route path={`/content-cluster/${clusterId}`} element={<ClusterDetails data={""} />} />
      </Routes> */}
      {showLoader ? (
        <Loader title="Generating Content Cluster.." />
      ) : (
        <div className="genai-container">
          <div className="prompt-container">
            <h3 className="prompt-heading">Fast Content Prompt Generator</h3>
            <div className="prompt-area">
              <input
                type="text"
                className="prompt-input"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
              />
              <div className="prompt-actions">
                <img src={sparkleIcon} alt="Enhance prompt with AI." />
                <div style={{ display: "flex" }}>
                  <img
                    className="prompt-reset-image"
                    src={refreshIcon}
                    alt="Reset prompt"
                    onClick={() => setPromptInput("")}
                  />
                  <button className="prompt-submit-btn" onClick={handlePromptSubmit}>
                    Optimize Content
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showPromptSuggestions && (
            <div>
              <div className="prompt-suggestions">
                <h3 className="prompt-suggestions-heading">Prompt Based Suggestions</h3>
                <div>
                  <h4 className="prompt-suggested-content-tags">Suggested Content Tags</h4>
                  <div className="selection-list-container">
                    <SelectionList
                      items={sampleSelectionListItems}
                      onChange={(updatedItems: string[]) => setSampleSelectionListItems(updatedItems)}
                      maxVisible={4}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="prompt-suggested-content-tags">Content Types</h4>
                  <div className="multi-select-container">
                    <MultiSelectButton
                      options={["Content Page", "Landing Page", "Blog", "Email Template"]}
                      onSelectionChange={(selected) => setSelectedContentTypes(selected)}
                      initialSelected={selectedContentTypes}
                    />
                  </div>
                </div>
              </div>
              <div className="prompt-enhancements">
                <h2 className="prompt-enhancements-heading">Enhance your prompts with Supporting Materials!</h2>
                <div style={{ width: "100%" }}>
                  <p className="prompt-enhancements-subheading">Add Supporting Materials</p>
                  <SupportingMaterial options={supportingMaterialsConfig} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="generate-cluster-btn" onClick={handleClusterCreation}>
                  Generate Cluster
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CreateContentCluster;
