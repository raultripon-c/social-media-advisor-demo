import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SupportingMaterial from "./SupportingMaterial/SupportingMaterial";
import { Loader } from "@phenom/react-ui-components";
import { APIService } from "../../utils/api.service";
import Modal from "../../components/Modal/Modal";

import segmentIcon from "../../assets/svg/users.svg";
import disabledSparkleIcon from "../../assets/svg/grey-sparkle.svg";
import arrowUpIcon from "../../assets/svg/green-arrow-up.svg";
import sparkleIcon from "../../assets/svg/sparkle.svg";
import fileIcon from "../../assets/svg/file.svg";
import disabledArrowUpIcon from "../../assets/svg/arrow-up.svg";
import infoIcon from "../../assets/svg/info.svg";
import clusterIcon from "../../assets/svg/folder.svg";
import landingPageIcon from "../../assets/svg/tvIcon.svg";
import emailIcon from "../../assets/svg/email.svg";
import blogIcon from "../../assets/svg/blog.svg";
import pencilIcon from "../../assets/svg/pen.svg";
import searchIcon from "../../assets/images/search-grey.svg";
import tickIcon from "../../assets/svg/tick-icon.svg";

import "./CreateContentCluster.css";
import AddedLinks from "./SupportingMaterial/AddedLinks/AddedLinks";
import { toast } from "react-toastify";

interface CreateContentClusterProps { }

const supportingMaterialsConfig = [
  { name: "List", icon: segmentIcon },
  // { name: "Job Links", icon: linkIcon },
  { name: "Reference Page", icon: fileIcon },
];

const contentTypesMap: any = {
  Pages: ["aiCreatedContentPage", "contentPages", "landingPages"],
  Blogs: ["aiCreatedBlog", "blogs"],
  "Email Templates": ["createdEmailTemplate", "emailTemplates"],
};

const CreateContentCluster: React.FC<CreateContentClusterProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>("");
  const [clusterTitle, setClusterTitle] = useState<string>("Content Clusters");
  const [sampleSelectionListItems, setSampleSelectionListItems] = useState<string[]>([]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState<boolean>(false);
  const [crmUserInfo, setCrmUserInfo] = useState<any>({});
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [addedurls, setAddedurls] = useState<string[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<any[]>([]);
  const [fetchedPages, setFetchedPages] = useState<any>(null);
  const [showClustersList, setShowClustersList] = useState<boolean>(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState<boolean>(false);
  const [showSaveOrDiscardModal, setShowSaveOrDiscardModal] = useState<boolean>(false);
  const [isPromptSubmitted, setIsPromptSubmitted] = useState<boolean>(false);
  const [originalPromptInput, setOriginalPromptInput] = useState<string>("");
  const [contentClustersList, setContentClustersList] = useState<any[]>([]);
  const [clustersLoader, setClustersLoader] = useState<boolean>(false);
  const [clusterSearchTerm, setClusterSearchTerm] = useState<string>("");
  const [editClusterTitle, setEditClusterTitle] = useState<boolean>(false);
  const [updateClusterTitle, setUpdateClusterTitle] = useState<boolean>(false);
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // default selected as per image
  const [searchTagTerm, setSearchTagTerm] = useState<string>("");
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);
  const [jobLink, setJobLink] = useState<string>("");
  const [listInput, setListInput] = useState<string>("");
  const [listItems, setListItems] = useState<any[]>([]);
  const [suggestedLists, setSuggestedLists] = useState<any[]>([]);
  const [selectedListsData, setSelectedListsData] = useState<any[]>([]);
  const [clusterTitleError, setClusterTitleError] = useState<boolean>(false);
  
  const saveContentCluster = (payload: any) => {
    APIService.createContentCluster(payload).then((clusterDetail) => {
      console.log("Content Cluster created:", clusterDetail);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);

      navigateToClusterDetails(clusterDetail);
    }).catch((error) => {
      console.error("Error creating content cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
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
        aiBlog: clusterDetails?.aiCreatedBlog?.[0],
        aiContentPage: clusterDetails?.aiCreatedContentPage?.[0],
        aiLandingPage: clusterDetails?.aiCreatedLandingPage?.[0],
        emailTemplates: clusterDetails?.emailTemplates,
        createdEmailTemplate: clusterDetails?.createdEmailTemplate?.[0],
        clusterName: clusterDetails?.clusterName,
      },
    });
  };

  useEffect(() => {
    // setShowPromptSuggestions(true)
    APIService.getCRMUserInfo()
      .then((userInfo) => {
        if(userInfo?.userDetails?.id){
          setCrmUserInfo(userInfo);
        }else{
          setCrmUserInfo(window?.keycloakInstance?.tokenParsed?.userDetails);
        }
      })
      .catch((err) => console.error("Error getting CRM user info", err));
  }, []);

  useEffect(() => {
    // Fetch content clusters
    setClustersLoader(true);
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
    };
    APIService.getAllContentClusters(payload)
      .then((clusters: any) => {
        setContentClustersList(clusters);
        setClustersLoader(false);
      })
      .catch((error) => {
        console.error("Error fetching content clusters:", error);
        setContentClustersList([]);
        setClustersLoader(false);
      });
  }, []);


  const getListItems = (searchTerm: string) => {
    // Check if crmUserInfo and userDetails exist before making the API call
    if (!crmUserInfo?.userDetails?.id) {
      console.log("crmUserInfo not loaded yet, skipping getListItems");
      return Promise.resolve();
    }
    
    return APIService.getListItems({
        "refNum": selectedTenant.refNum,
        "filterType": "Candidates",
        "status": "All",
        "keywords": searchTerm,
        "createdBy": "",
        "recruiterUserId": crmUserInfo.userDetails.id,
        "from": 1,
        "size": 20,
        "type": "dynamic_candidates",
        "sort": {
          "field": "updatedDate",
          "order": -1
        }
    }).then((res) => {
      setListItems(res.data.message);
    })
  }
  const getSuggestedLists = () => {
    // Check if crmUserInfo and userDetails exist before making the API call
    if (!crmUserInfo?.userDetails?.id) {
      console.log("crmUserInfo not loaded yet, skipping getSuggestedLists");
      return Promise.resolve();
    }
    
    return APIService.getSuggestedLists({
      "refNum": selectedTenant.refNum,
      "filterType": "Candidates",
      "status": "All",
      "keywords": listInput,
      "createdBy": "",
      "recruiterUserId": crmUserInfo.userDetails.id,
      "from": 1,
      "size": 50,
      "type": "dynamic_candidates",
      "sort": {
        "field": "updatedDate",
        "order": -1
      },
      "content": promptInput,
  }).then((res) => {
      setSuggestedLists(res);
      return res;
    })
  }
  const fetchPagesForContent = (keywords: string[]) => {
    return APIService.getPagesForContent({
      keywords,
      prompt: promptInput,
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
      isCanvasSite: Boolean(sessionStorage.getItem("isCanvasSite")) || false,
    });
  };

  const createCRMEmailTemplate = () => {
    // Check if crmUserInfo and userDetails exist before making the API call
    if (!crmUserInfo?.userDetails?.id) {
      console.log("crmUserInfo not loaded yet, skipping createCRMEmailTemplate");
      return Promise.resolve();
    }
    
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
    // Check if crmUserInfo and userDetails exist before making the API call
    if (!crmUserInfo?.userDetails?.id) {
      console.log("crmUserInfo not loaded yet, skipping fetchEmailTemplatesForContent");
      return Promise.resolve();
    }
    
    return APIService.getEmailTemplatesForContent({
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
      keywords: promptInput.split(" "),
    });
  };

  const fetchAllEmailTemplates = () => {
    // Check if crmUserInfo and userDetails exist before making the API call
    if (!crmUserInfo?.userDetails?.id) {
      console.log("crmUserInfo not loaded yet, skipping fetchAllEmailTemplates");
      return Promise.resolve();
    }
    
    return APIService.getAllEmailTemplates({
      recruiterUserId: crmUserInfo.userDetails.id,
      refNum: selectedTenant.refNum,
    });
  };

  const fetchBlogsForContent = (keywords: string[]) => {
    return APIService.getBlogsForContent({
      keywords,
      prompt: promptInput,
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

  const getPromptBasedSuggestions = (supportingMaterial: any) => {
    return APIService.getPromptBasedSuggestions({
      isEnhancePrompt: jobLink ? true : false,
      prompt: promptInput,
      deviceType: "desktop",
      language: locale,
      refNum: selectedTenant.refNum,
      supportingMaterial,
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

  const createCluster = () => {
    return APIService.createAIPages({
      contentTypes: selectedContentId,
      companyName: selectedTenant.tenantName,
      refNum: selectedTenant.refNum,
      locale,
      siteVariant: "external",
      content: promptInput,
      isCanvasSite: Boolean(JSON.parse(sessionStorage.getItem("isCanvasSite") || "false")) || false,
      urlList: addedurls,
      clusterName: clusterTitle,
      recruiterUserId: crmUserInfo?.userDetails?.id,
      displayName: crmUserInfo?.displayName,
      userEmail: crmUserInfo?.userName,
    });
  };

  const enhancePrompt = () => {
    if (!promptInput) return;
    setShowSaveOrDiscardModal(true);
    setShowLoader(true);
    return APIService.enhancePrompt({
      isEnhancePrompt: true,
      prompt: promptInput,
      deviceType: "desktop",
      language: locale,
      refNum: selectedTenant.refNum,
    }).then((response) => {
      // Update the prompt input with the enhanced version
      setShowSaveOrDiscardModal(false); 
      if (response?.enhancedPrompt) {
        setPromptInput(response.enhancedPrompt);
      }
      setShowLoader(false);
      console.log("Enhanced prompt:", response);
    }).catch((error) => {
      setShowSaveOrDiscardModal(false);
      console.error("Error enhancing prompt:", error);
      setShowLoader(false);
      // You could add a toast notification here for user feedback
    });
  }

  const handleListSearch = (searchTerm: string) => {
    getListItems(searchTerm);
  };

  const handlePromptSubmit = () => {
    if (promptInput) {
      setShowSaveOrDiscardModal(true);
      setFetchedPages(null);
      // handleClusterCreation();
      handlePromptBasedSuggestions();
    }
  };

  const handlePromptBasedSuggestions = () => {
    setShowLoader(true);
    const payload =  [
        {
            "type": "jobLink",
            "urlList": [jobLink]
        }
    ];
    
    // Call both APIs in parallel
    Promise.all([
      getPromptBasedSuggestions(payload),
      getSuggestedLists()
    ]).then(([promptResponse, suggestedListsResponse]) => {
      // Handle prompt based suggestions response
      if (promptResponse?.masterPrompt) {
        setPromptInput(promptResponse.masterPrompt);
      }
      
      // Set fetched pages with content from response
      const fetchedPagesData = {
        contentPages: promptResponse?.contentPages || [],
        landingPages: promptResponse?.landingPages || [],
        blogs: promptResponse?.blogDetails || []
      };
      setFetchedPages(fetchedPagesData);
      
      // Update content types based on response
      if (promptResponse.data?.contentTypes) {
        const contentTypeNames = promptResponse.contentTypes.map((type: any) => type.displayName);
        setSelectedContentTypes(contentTypeNames);
      }
      
      // Set cluster title based on the first content page or blog
      let clusterTitleName = "Content Cluster";
      let suggestedTagsData = promptResponse.contentTypes || [];
      setSuggestedTags(suggestedTagsData);
      
      // Set default selectedTags and selectedContentId to first two content types
      if (suggestedTagsData.length >= 2) {
        const defaultTags = suggestedTagsData.slice(0, 2).map((type: any) => type.displayName);
        const defaultContentIds = suggestedTagsData.slice(0, 2).map((type: any) => type.contentId);
        setSelectedTags(defaultTags);
        setSelectedContentId(defaultContentIds);
      } else if (suggestedTagsData.length === 1) {
        // If only one content type, select just that one
        setSelectedTags([suggestedTagsData[0].displayName]);
        setSelectedContentId([suggestedTagsData[0].contentId]);
      }
      
      // Handle suggested lists response
      console.log("Suggested Lists Response:", suggestedListsResponse);
      setSuggestedLists(suggestedListsResponse.data?.result || []);
      
      setEditClusterTitle(true);
      setClusterTitle(clusterTitleName);
      setShowLoader(false);
      setIsPromptSubmitted(true);
      setShowSaveOrDiscardModal(false);
      setShowClustersList(true);
      setShowPromptSuggestions(true);
        
      console.log("Prompt Based Suggestions", promptResponse);
    }).catch((err) => {
      console.error("Error fetching data:", err);
      setShowSaveOrDiscardModal(false);
      setShowLoader(false);
    });
  }
  const handleClusterCreate = async () => {
    setShowLoader(true);
    setShowSaveOrDiscardModal(true);
    setClusterTitleError(false);
    
    // Validate cluster name first
    try {
      const validationPayload = {
        refNum: selectedTenant.refNum,
        clusterName: clusterTitle,
        recruiterUserId: crmUserInfo?.userDetails?.id
      };
      
      const validationResponse = await APIService.validateClusterFields(validationPayload);
      
      if (!validationResponse) {
        setUpdateClusterTitle(true);
        setClusterTitleError(true);
        setShowLoader(false);
        setShowSaveOrDiscardModal(false);
        toast.error("Failed to validate cluster name. Please try again.");
        return;
      }
      
      if (validationResponse?.status === "success" && validationResponse?.data?.clusterNameUnique === false) {
        // Cluster name already exists
        setUpdateClusterTitle(true);
        setClusterTitleError(true);
        setShowLoader(false);
        setShowSaveOrDiscardModal(false);
        toast.error("Cluster name already exists");
        return;
      }
      
      // If validation passes, proceed with cluster creation
      // setShowLoader(true);
      // setShowSaveOrDiscardModal(true);
      
      const res = await createCluster();
      console.log("res", res);
      
      // Process the response to extract successful content
      const successfulContent = res.filter((item: any) => item.success);
      const failedContent = res.filter((item: any) => !item.success);
      
      // Log any failed content for debugging
      if (failedContent.length > 0) {
        console.warn("Some content failed to create:", failedContent);
      }
      
      // Extract successful content by type
      const successfulBlog = successfulContent.find((item: any) => item.contentType === "blog-article");
      const successfulContentPage = successfulContent.find((item: any) => item.contentType === "content-page");
      const successfulEmailTemplate = successfulContent.find((item: any) => item.contentType === "email-template");
      const aiLandingPage = successfulContent.find((item: any) => item.contentType === "landing-page");
      // Prepare cluster data for saving
      let createdBlogDetail = null;
      if (successfulBlog) {
        const allBlogs = await fetchAllBlogsDetails();
        createdBlogDetail = allBlogs["all"]?.find((blog: any) => blog.articleId === successfulBlog.data?.articleId);
      }
      let createdEmailTemplateData = null;
      if (successfulEmailTemplate) {
        const allEmailTemplates = await fetchAllEmailTemplates();
        createdEmailTemplateData = allEmailTemplates.find((template: any) => template.templateName === successfulEmailTemplate.data.templateName);
      }

      const clusterData = {
        refNum: selectedTenant.refNum,
        locale,
        siteVariant: "external",
        contentPages: fetchedPages?.contentPages, 
        landingPages: fetchedPages?.landingPages,
        blogs: fetchedPages?.blogs,
        aiCreatedLandingPage: aiLandingPage ? [aiLandingPage.data.data] : [],
        aiCreatedBlog: createdBlogDetail ? [createdBlogDetail] : [],
        aiCreatedContentPage: successfulContentPage ? [successfulContentPage.data.data] : [],
        emailTemplates: [],
        createdEmailTemplate: createdEmailTemplateData ? [createdEmailTemplateData] : [],
        clusterTitle: promptInput,
        clusterName: clusterTitle,
        selectedLists: selectedListsData,
      };
      
      // Save the cluster
      saveContentCluster(clusterData);
    } catch (error) {
      console.error("Error creating cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
    }
  }
  const handleClusterCreation = () => {
    const keywords = promptInput.split(" ");
    setShowLoader(true);
    const apiCalls: Promise<any>[] = [];

    if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
      apiCalls.push(fetchPagesForContent(keywords));
      // apiCalls.push(createCMSAIPage());
    }

    if (selectedContentTypes.includes("Blog")) {
      apiCalls.push(fetchBlogsForContent(keywords));
      // apiCalls.push(createCMSAiBlog());
    }

    if (selectedContentTypes.includes("Email Template")) {
      // apiCalls.push(createCRMEmailTemplate());
      apiCalls.push(fetchEmailTemplatesForContent());
    }

    Promise.all(apiCalls)
      .then(async (responses) => {
        setEditClusterTitle(true);
        setClusterTitle("Cluster name");
        setShowLoader(false);
        setIsPromptSubmitted(true);
        setShowSaveOrDiscardModal(false);
        setShowClustersList(true);
        setShowPromptSuggestions(true);
        let responseIndex = 0;
        let pages: any,
          aiContentPage: any,
          blogs: any,
          createdBlogDetail: any,
          filteredEmailTemplates: any,
          createdEmailTemplateData: any;

        if (selectedContentTypes.includes("Content Page") || selectedContentTypes.includes("Landing Page")) {
          pages = responses[responseIndex++];
          setFetchedPages(pages);
          // aiContentPage = responses[responseIndex++].data;
        }

        if (selectedContentTypes.includes("Blog")) {
          const blogsResponse = responses[responseIndex++];
          // const createdBlog = responses[responseIndex++];
          blogs = blogsResponse?.blogDetails || [];
          setFetchedPages((prev: any) => ({ ...prev, blogs }));
          // const allBlogs = await fetchAllBlogsDetails();
          // createdBlogDetail = allBlogs["all"].find((blog: any) => blog.articleId === createdBlog.articleId);
        }

        if (selectedContentTypes.includes("Email Template")) {
          const emailTemplate = responses[responseIndex++];
          // filteredEmailTemplates = responses[responseIndex++]["filteredEmailTemplates"];
          setFetchedPages((prev: any) => ({ ...prev, emailTemplates: filteredEmailTemplates }));

          const allEmailTemplates = await fetchAllEmailTemplates();
          createdEmailTemplateData = allEmailTemplates.find((template: any) => template.templateName === promptInput);
        }

        //   saveContentCluster({
        //     refNum: selectedTenant.refNum,
        //     locale,
        //     siteVariant: "external",
        //     contentPages: pages?.contentPages,
        //     landingPages: pages?.landingPages,
        //     blogs: blogs,
        //     aiCreatedBlog: [createdBlogDetail],
        //     aiCreatedContentPage: [aiContentPage],
        //     emailTemplates: filteredEmailTemplates,
        //     createdEmailTemplate: [createdEmailTemplateData],
        //     clusterTitle: promptInput,
        //   });
        // })
        // .catch((err) => {
        //   console.error("Error during cluster creation:", err);
        //   setShowLoader(false);
      });
  };

  const contentTypesForCluster = (cluster: any): string[] => {
    const result: string[] = [];
    const clusterKeys = Object.keys(cluster);
    Object.keys(contentTypesMap).forEach((contentType: string) => {
      const contentTypes = contentTypesMap[contentType];
      if (contentTypes.some((key: string) => clusterKeys.includes(key) && cluster[key] && cluster[key].length > 0)) {
        result.push(contentType);
      }
    });
    return result;
  };
  

  const handleClusterClick = (cluster: any) => {
    console.log("Clicked", cluster);
    const newPath = location.pathname.replace(/\/create$/, "");
    const pagesObj = {
      contentPages: cluster.contentPages,
      landingPages: cluster.landingPages,
    };
    navigate(`${newPath}/${cluster.id}`, {
      state: {
        currentPage: "content-cluster/create",
        pages: pagesObj,
        blogs: cluster?.blogs,
        aiBlog: cluster?.aiCreatedBlog[0],
        aiContentPage: cluster?.aiCreatedContentPage[0],
        emailTemplates: cluster?.emailTemplates,
        createdEmailTemplate: cluster?.createdEmailTemplate[0],
        clusterName: cluster.clusterName,
      },
    });
  };

  const filteredClusters = contentClustersList.filter((cluster) => {
    if (!clusterSearchTerm.trim()) return true;
    
    const searchTerm = clusterSearchTerm.toLowerCase();
    const clusterTitle = (cluster.clusterTitle || '').toLowerCase();
    const contentTypes = contentTypesForCluster(cluster).join(' ').toLowerCase();
    
    return clusterTitle.includes(searchTerm) || contentTypes.includes(searchTerm);
  });

  // Suggested Content Tags (static, as per image)
  // const allSuggestedTags = [
  //   "Content Page", "Landing Page", "Email Template", "Event", "Widget", "Banner", "Custom Job Description", "Video", "Images", "VideoHub Testimonials", "Bot Responses", "Campaigns", "Testimonials"
  // ];


  const filteredTagSuggestions = suggestedTags.filter(
    (tag) => tag.displayName.toLowerCase().includes(searchTagTerm.toLowerCase()) && !selectedTags.includes(tag.displayName)
  );

  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      // Find the corresponding contentId from suggestedTags mapping
      const contentType = suggestedTags.find((suggestedTag: any) => suggestedTag.displayName === tag);
      if (contentType && contentType.contentId) {
        setSelectedContentId([...selectedContentId, contentType.contentId]);
      }
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      // Remove the corresponding contentId
      const contentType = suggestedTags.find((suggestedTag: any) => suggestedTag.displayName === tag);
      if (contentType && contentType.contentId) {
        setSelectedContentId(selectedContentId.filter((id) => id !== contentType.contentId));
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
    // Remove the corresponding contentId
    const contentType = suggestedTags.find((suggestedTag: any) => suggestedTag.displayName === tag);
    if (contentType && contentType.contentId) {
      setSelectedContentId(selectedContentId.filter((id) => id !== contentType.contentId));
    }
  };

  const handleSearchTagSelect = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
    // Find the corresponding contentId from suggestedTags mapping
    const contentType = suggestedTags.find((suggestedTag: any) => suggestedTag.displayName === tag);
    if (contentType && contentType.contentId) {
      setSelectedContentId([...selectedContentId, contentType.contentId]);
    }
    setSearchTagTerm("");
    setShowTagDropdown(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTagTerm(e.target.value);
    setShowTagDropdown(true);
  };

  const handleSearchInputBlur = () => {
    setTimeout(() => setShowTagDropdown(false), 150); // Delay to allow click
  };

  return (
    <>
      {/* {showLoader ? (
        <Loader title="Generating Content Cluster.." />
      ) : ( */}
      <div className="create-content-cluster-container">
        <div className="create-content-cluster-header">
          {updateClusterTitle?(
            <input className={clusterTitleError ? "create-content-cluster-header-title-input-error" : "create-content-cluster-header-title-input"}  onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setUpdateClusterTitle(false);
                setClusterTitleError(false);
              }
            }}
            onClick={() => {
              setClusterTitleError(false);
            }}
            type="text" value={clusterTitle} onChange={(e) => {setClusterTitle(e.target.value); setClusterTitleError(false);}} />
          ):(
            <span className="create-content-cluster-header-title">{clusterTitle}</span>
          )}
          {/* <span className="create-content-cluster-header-title">{clusterTitle}</span> */}
          {editClusterTitle && !updateClusterTitle && (
            <img onClick={() => setUpdateClusterTitle(true)} src={pencilIcon} alt="edit-cluster-title" />
          )}
          {updateClusterTitle && (
            <button className="done-btn" onClick={() => {
              setUpdateClusterTitle(false);
              setClusterTitleError(false);
            }}>Done</button>
          )}
           
        </div>
      <div className="genai-container">
        <div className="prompt-container">
          <h3 className="prompt-heading">Generate new cluster</h3>
          {!isPromptSubmitted ? (
            <div className="prompt-area">
              <div className="prompt-input-wrapper">                  <>
                <input
                  type="text"
                  className="prompt-input"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && promptInput) {
                      if (isEditingPrompt) {
                        // Save changes when in edit mode
                        setIsPromptSubmitted(true);
                        setIsEditingPrompt(false);
                        handlePromptSubmit();
                      } else {
                        // Call API when not in edit mode
                        handlePromptSubmit();
                      }
                    }
                  }}
                  placeholder="e.g Create content for nursing landing page hiring campaign for Chicago Healthcare center"
                />
                {isEditingPrompt ? (
                  <>
                    <button className="prompt-enhance-btn cancel-btn" type="button" tabIndex={-1} onClick={() => {
                      setPromptInput(originalPromptInput);
                      setIsPromptSubmitted(true);
                      setIsEditingPrompt(false);
                    }}>
                      Cancel
                    </button>
                    <button className="prompt-enhance-btn save-btn" type="button" tabIndex={-1} onClick={() => {
                      if (promptInput) {
                        setIsPromptSubmitted(true);
                        setIsEditingPrompt(false);
                        handlePromptSubmit();
                      } else {
                        setShowClustersList(false);
                        setShowPromptSuggestions(false);
                        setIsPromptSubmitted(false);
                        setIsEditingPrompt(false);
                      }
                    }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button className={`prompt-enhance-btn${!promptInput ? " disabled" : ""}`} type="button" tabIndex={-1} disabled={!promptInput} onClick={enhancePrompt}>
                      <img src={!promptInput ? disabledSparkleIcon : sparkleIcon} alt="Enhance prompt with AI." style={{ marginRight: 6 }} />
                      Enhance prompt
                    </button>
                    <button
                      className={`prompt-arrow-btn${!promptInput ? " disabled" : ""}`}
                      onClick={handlePromptSubmit}
                      disabled={!promptInput}
                      type="button"
                      aria-label="Submit prompt"
                    >
                      <img src={!promptInput ? disabledArrowUpIcon : arrowUpIcon} alt="Submit" />
                    </button>
                  </>
                )}
              </>
              </div>
            </div>
          ) : (
            <div
              className="prompt-input-readonly">
              <div className="prompt-input-readonly-wrapper">
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{promptInput}</span>
              </div>
              <div className="prompt-input-readonly-actions">
                <div
                  className="edit-prompt-tooltip-wrapper"
                  onClick={() => { setOriginalPromptInput(promptInput); setIsPromptSubmitted(false); setIsEditingPrompt(true); }}
                >
                  <img
                    src={pencilIcon}
                    alt="Edit"
                    style={{ cursor: 'pointer', marginLeft: 12, width: 18, height: 18 }}
                  />
                  <span className="edit-prompt-tooltip-text">Edit prompt</span>
                </div>
              </div>
            </div>
          )}
          {/* Enter Job Link UI (now outside prompt-area) */}
          {!showClustersList && !isEditingPrompt && (
            <div className="job-link-section">
            <label htmlFor="job-link-input" className="job-link-label">Enter Job Link</label>
            <div className="job-link-input-wrapper">
              <input
                id="job-link-input"
                type="text"
                className="job-link-input"
                placeholder="Paste job link here"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
              />
            </div>
          </div>)}
        </div>
        {showPromptSuggestions && (
          <div>
            <div className="prompt-enhancements">
              <div className="prompt-enhancements-heading">Add supporting materials (Optional)
                <div className="cluster-info-icon-wrapper">
                  <img className="cluster-info-icon" src={infoIcon} alt="Info" />
                  <div className="tooltip-wrapper">
                    <div className="tooltip-text">
                      This section is optional, but adding supporting materials can improve the quality of your content
                    </div>
                  </div>
                </div>
              </div>
              <div className="section-divider" />
              <div style={{ width: "100%" }}>
                <p className="prompt-enhancements-subheading">Add Supporting Materials</p>
                <SupportingMaterial options={supportingMaterialsConfig} fetchedPages={fetchedPages} list={listItems} setAddedurls={setAddedurls} suggestedLists={suggestedLists} onListSearch={handleListSearch} selectedListsData={selectedListsData} setSelectedListsData={setSelectedListsData}/>
              </div>
            </div>
            <div className="prompt-suggestions content-format-section">
              <div className="prompt-suggestions-heading">Recommended content formats</div>
              {/* Suggested Content Tags */}
              <div className="content-tag-wrapper">
              <div className="suggested-tags-section">
                <div className="suggested-tags-heading">Suggested Content Tags</div>
                <div className="suggested-tags-container">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag.contentId}
                      type="button"
                      className={`tag-pill${selectedTags.includes(tag.displayName) ? ' selected' : ''}`}
                      onClick={() => handleTagClick(tag.displayName)}
                    >
                      {selectedTags.includes(tag.displayName) && (<img src={tickIcon} className="tag-checkmark" alt="Selected" />)}
                      {tag.displayName}
                    </button>
                  ))}
                </div>
              </div>
              {/* Search Content Tags */}
              {/* <div className="search-tags-section">
                <div className="search-tags-heading">Search Content Tags</div>
                <div className="search-tags-container">
                  <input
                    type="text"
                    className="tag-search-input"
                    placeholder="Search Content Tags"
                    value={searchTagTerm}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowTagDropdown(true)}
                    onBlur={handleSearchInputBlur}
                  />
                  {searchTagTerm && (
                    <button
                      type="button"
                      className="tag-search-clear"
                      onClick={() => setSearchTagTerm("")}
                    >
                      ×
                    </button>
                  )}
                  <button
                    type="button"
                    className="tag-add-btn"
                    onClick={() => {
                      if (searchTagTerm && !selectedTags.includes(searchTagTerm)) {
                        setSelectedTags([...selectedTags, searchTagTerm]);
                        setSearchTagTerm("");
                      }
                    }}
                  >
                    + Add
                  </button>
                </div>
                {/* Dropdown for search suggestions */}
                {/* 
                {showTagDropdown && filteredTagSuggestions.length > 0 && (
                  <div className="content-tag-autocomplete-dropdown">
                    {filteredTagSuggestions.map((tag) => (
                      <div
                        key={tag}
                        className="content-tag-autocomplete-item"
                        onMouseDown={() => handleSearchTagSelect(tag)}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
              {/* Added Tags */}
              {selectedTags.length > 0 && (
              <div className="added-tags-section">
                <div className="added-tags-heading">Added Tags</div>
                <div className="added-tags-container">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="added-tag">
                      {tag}
                      <button
                        type="button"
                        className="added-tag-remove"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              )}
            </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                className={`generate-cluster-btn${selectedContentId.length === 0 ? " disabled" : ""}`} 
                onClick={handleClusterCreate}
                disabled={selectedContentId.length === 0}
              >
                Generate Cluster
              </button>
            </div>
          </div>
        )}
      </div>
      {/* )} */}
      {!showClustersList && !isEditingPrompt && (
        <div className="clusters-section">
          <div className="clusters-header">
            <span className="clusters-title">{filteredClusters.length} active clusters</span>
            <div className="clusters-controls">
              <div className="cluster-search-container">
                <img src={searchIcon} alt="Search" className="cluster-search-icon" />
                <input 
                  type="text" 
                  className="cluster-search" 
                  placeholder="Search cluster" 
                  value={clusterSearchTerm}
                  onChange={(e) => setClusterSearchTerm(e.target.value)}
                />
              </div>
              {/* <select className="cluster-sort">
                <option>Sort: Most recently updated</option>
              </select> */}
            </div>
          </div>
          <div className="clusters-list">
            {clustersLoader ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader title="Loading clusters..." />
              </div>
            ) : contentClustersList.length > 0 ? (
              filteredClusters.map((cluster: any, idx: number) => {
                const contentTypes = contentTypesForCluster(cluster);
                const createdDate = cluster.createdAt ? new Date(cluster.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Unknown date';
                
                return (
                  <div className="cluster-card" key={cluster.id || idx}>
                    <div className="cluster-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div>
                          <img src={clusterIcon} alt="Folder" className="cluster-folder-icon" />
                        </div>
                        <div>
                          <div 
                            className="cluster-title" 
                            style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}
                            title={cluster.clusterName || cluster.clusterTitle || 'Untitled Cluster'}
                          >
                            {cluster.clusterName || cluster.clusterTitle || 'Untitled Cluster'}
                          </div>
                          <div className="cluster-date">Created {createdDate}</div>
                        </div>
                      </div>
                      <div>
                        <button className="view-cluster-btn" onClick={() => handleClusterClick(cluster)}>View cluster</button>
                        {/* <button className="cluster-menu-btn">⋮</button> */}
                      </div>
                    </div>
                    <div className="cluster-divider" />
                    <div className="cluster-actions">
                      <div className="cluster-content-types-label">Content types:</div>
                      <div className="cluster-content-types">
                        {contentTypes.includes('Pages') && (
                          <span><img src={landingPageIcon} alt="" className="content-type-icon" /> Landing page</span>
                        )}
                        {contentTypes.includes('Email Templates') && (
                          <span><img src={emailIcon} alt="" className="content-type-icon" /> Email template</span>
                        )}
                        {contentTypes.includes('Blogs') && (
                          <span><img src={blogIcon} alt="" className="content-type-icon" /> Blog article</span>
                        )}
                        {contentTypes.length === 0 && (
                          <span>No content types</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', color: '#666' }}>
                {clusterSearchTerm.trim() 
                  ? `No clusters found matching "${clusterSearchTerm}". Try a different search term.`
                  : 'No clusters found. Create your first cluster above.'
                }
              </div>
            )}
          </div>
        </div>
      )}
      <Modal
        title={
          <div className="txe-modal-header-title">
            Generating prompt and creating your new project!
          </div>
        }
        isOpen={showSaveOrDiscardModal}
        onClose={() => setShowSaveOrDiscardModal(false)}
      >
        <div className="modal-content">
          <div className="modal-title-text">
            This may take a few minutes to complete.
          </div>
          <div className="modal-progress-bar">
            <div className="modal-progress-bar-animated" />
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
};

export default CreateContentCluster;
