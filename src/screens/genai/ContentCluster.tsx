import React, { useEffect, useState } from "react";
import MultiSelectButton from "../../components/MultiSelectButton/MultiSelectButton";
import SupportingMaterial from "./SupportingMaterial/SupportingMaterial";
import segmentIcon from "../../assets/svg/users.svg";
import refreshIcon from "../../assets/svg/refresh.svg";
import sparkleIcon from "../../assets/svg/sparkle.svg";
import linkIcon from "../../assets/svg/link.svg";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import "./ContentCluster.css";
import SelectionList from "../../components/SelectionList/SelectionList";
import { APIService } from "../../utils/api.service";
import ClusterDetails from "../../screens/ClusterDetails/ClusterDetails";
import { Loader } from "@phenom/react-ui-components";

interface ContentClusterProps {}

const supportingMaterialsConfig = [
  { name: "Segments", icon: segmentIcon },
  { name: "Links", icon: linkIcon },
  { name: "Reference Page", icon: linkIcon },
];
const clusterId = "aycb2ncskncma62";

const ContentCluster: React.FC<ContentClusterProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [matchedPagesData, setMatchedPagesData] = useState<any>();
  const [matchedBlogsData, setMatchedBlogsData] = useState<any>();
  const [matchedEmailTemplatesData, setMatchedEmailTemplateData] = useState<any>();
  const [aiGeneratedBlogData, setAiGeneratedBlogData] = useState<any>();
  const [aiGeneratedContentPageData, setAiGeneratedContentPageData] = useState<any>();
  const [createdEmailTemplate, setCreatedEmailTemplate] = useState<any>();

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
  // State to hold the selected options from MultiSelectButton
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["Content Page", "Landing Page", "Blog"]);

  useEffect(() => {
    APIService.getCRMUserInfo()
      .then((userInfo) => {
        console.log("CRM User Info:", userInfo);
        setCrmUserInfo(userInfo);
      })
      .catch((err: any) => console.error("Error getting CRM user info", err));
  }, []);

  const fetchPagesForContent = (keywords: string[], locale: string) => {
    const payload = {
      keywords: keywords,
      deviceType: "desktop",
      language: locale,
      refnum: selectedTenant.refNum,
      refNum: selectedTenant.refNum,
    };
    return APIService.getPagesForContent(payload);
  };

  const createCMSAIPage = (locale: string) => {
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
      content: promptInput,
    };
    return APIService.generateCMSAIPage(payload);
  };

  const createCRMEmailTemplate = async (locale: string) => {
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
      content: promptInput,
      recruiterUserId: crmUserInfo.userDetails.id,
      displayName: crmUserInfo.displayName,
      userEmail: crmUserInfo.userName,
    };

    return APIService.generateCRMEmailTemplate(payload);
  };

  const fetchEmailTemplatesForContent = () => {
    const payload = {
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
      keywords: promptInput.split(" "),
    };
    return APIService.getEmailTemplatesForContent(payload);
  };

  const fetchAllEmailTemplates = () => {
    const payload = {
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
    };
    return APIService.getAllEmailTemplates(payload);
  };

  const fetchBlogsForContent = (keywords: string[], locale: string) => {
    const blogsPayload = {
      keywords: keywords,
      applyFilters: false,
      locale: locale,
      refNum: selectedTenant.refNum,
      siteVariant: "external",
    };
    return APIService.getBlogsForContent(blogsPayload);
  };

  const fetchAllBlogsDetails = (locale: string) => {
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
      applyFilters: false,
    };
    return APIService.getAllBlogsDetails(payload);
  };

  const createCMSAiBlog = (locale: string) => {
    const payload = {
      companyName: selectedTenant.tenantName,
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
      content: promptInput,
    };
    return APIService.generateCMSAIBlog(payload);
  };

  const handlePromptSubmit = () => {
    setShowPromptSuggestions(true);
  };

  const handleClusterCreation = () => {
    const keywords = promptInput.split(" ");
    const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

    setShowLoader(true);

    const apiCalls: Promise<any>[] = [];

    if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
      apiCalls.push(fetchPagesForContent(keywords, locale));
      apiCalls.push(createCMSAIPage(locale));
    }

    if (selectedContentTypes.includes("Blog")) {
      apiCalls.push(fetchBlogsForContent(keywords, locale));
      apiCalls.push(createCMSAiBlog(locale));
    }

    if (selectedContentTypes.includes("Email Template")) {
      apiCalls.push(createCRMEmailTemplate(locale));
      apiCalls.push(fetchEmailTemplatesForContent());
    }

    Promise.all(apiCalls)
      .then(async (proms) => {
        // You need to process the responses based on the order of the API calls added.
        // For demonstration, assume the following:
        // - First response: pages data (if applicable)
        // - Second response: AI content page data (if applicable)
        // - Third response: blogs data (if applicable)
        // - Fourth response: AI blog data (if applicable)
        // - Next response: email template (if applicable)
        // You might need to adjust this based on your requirements.
        let responseIndex = 0;
        let createdEmailTemplateData: any,
          pages: any,
          blogs: any,
          createdBlogDetail: any,
          aiContentPage: any,
          filteredEmailTemplates: any;
        if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
          pages = proms[responseIndex++];
          aiContentPage = proms[responseIndex++]["data"];
          setMatchedPagesData(pages);
          setAiGeneratedContentPageData(aiContentPage);
          console.log("Pages:", pages);
          console.log("AI Content Page:", aiContentPage);
        }

        if (selectedContentTypes.includes("Blog")) {
          const blogsResponse = proms[responseIndex++];
          const createdBlog = proms[responseIndex++];
          blogs = blogsResponse.blogDetails;
          setMatchedBlogsData(blogs);
          const allBlogs = await fetchAllBlogsDetails(locale);
          createdBlogDetail = allBlogs["all"].find((blog: any) => blog.articleId === createdBlog.articleId);
          setAiGeneratedBlogData(createdBlogDetail);
          console.log("Created AI Blog Data:", createdBlogDetail);
        }

        if (selectedContentTypes.includes("Email Template")) {
          const emailTemplate = proms[responseIndex++];
          filteredEmailTemplates = proms[responseIndex++];

          setMatchedEmailTemplateData(filteredEmailTemplates);
          console.log("Created Email Template:", emailTemplate);
          const allEmailTemplates = await fetchAllEmailTemplates();
          createdEmailTemplateData = allEmailTemplates.find(
            (emailTemplate: any) => emailTemplate.templateName === promptInput
          );

          setCreatedEmailTemplate(createdEmailTemplateData);
          console.log("Created Email Template Data:", createdEmailTemplateData);
        }

        setShowLoader(false);

        const newPath = location.pathname.replace(/\/create$/, "");
        // Append the ID for navigation.
        const finalPath = `${newPath}/${clusterId}`;
        navigate(finalPath, {
          state: {
            pages: pages,
            blogs: blogs,
            aiBlog: createdBlogDetail,
            aiContentPage: aiContentPage,
            emailTemplates: filteredEmailTemplates,
            createdEmailTemplate: createdEmailTemplateData,
          },
        });
      })
      .catch((err) => {
        console.error("Error during cluster creation:", err);
        setShowLoader(false);
      });
  };

  return (
    <>
      <Routes>
        <Route path={`/content-cluster/${clusterId}`} element={<ClusterDetails data={""} />} />
      </Routes>
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
                    alt="reset prompt"
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
                      onChange={(updatedItems: string[]) => {
                        console.log("Updated Items from SelectionList Component:", updatedItems);
                        setSampleSelectionListItems(updatedItems);
                      }}
                      maxVisible={4}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="prompt-suggested-content-tags">Content Types</h4>
                  <div className="multi-select-container">
                    <MultiSelectButton
                      options={["Content Page", "Landing Page", "Blog", "Email Template"]}
                      onSelectionChange={(selected) => {
                        console.log("Selected Content Types:", selected);
                        setSelectedContentTypes(selected);
                      }}
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

export default ContentCluster;
