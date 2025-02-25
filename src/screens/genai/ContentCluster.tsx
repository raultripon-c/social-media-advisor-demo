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
  const [matchedPagesData, setMatchedPagesData] = useState();
  const [matchedBlogsData, setMatchedBlogsData] = useState();
  const [promptInput, setPromptInput] = useState<string>("");
  const [sampleSelectionListItems, setSampleSelectionListItems] = useState<string[]>([
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
  ]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState<boolean>(false);

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

  const handlePromptSubmit = () => {
    console.log("Prompt Submitted:", promptInput);
    const keywords = promptInput.split(" ");
    const locale = JSON.parse(sessionStorage.getItem("locale") || "") || "en_us";

    setShowLoader(true);
    Promise.all([fetchPagesForContent(keywords, locale), fetchBlogsForContent(keywords, locale)]).then((proms) => {
      const pages = proms[0];
      const blogs = proms[1].blogDetails;

      setMatchedBlogsData(blogs);
      setMatchedPagesData(pages);
      setShowLoader(false);
      setShowPromptSuggestions(true);
    });
  };

  const handleClusterCreation = () => {
    // Hit Cluster Create API and will get an cluster ID in return from API response
    // Navigate to that cluster ID
    const newPath = location.pathname.replace(/\/create$/, "");

    // Append the ID
    const finalPath = `${newPath}/${clusterId}`;
    navigate(finalPath, {
      state: {
        pages: matchedPagesData,
        blogs: matchedBlogsData
      },
    });
  };

  return (
    <>
      <Routes>
        <Route path={`/content-cluster/${clusterId}`} element={<ClusterDetails data={""} />} />
      </Routes>
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
                    onSelectionChange={(selected) => console.log("Selected Content Types:", selected)}
                    initialSelected={["Content Page", "Landing Page", "Blog"]}
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
    </>
  );
};

export default ContentCluster;
