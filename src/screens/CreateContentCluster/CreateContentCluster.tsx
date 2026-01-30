import React, { useEffect, useState, useRef, useMemo } from "react";
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
import PreviewPages from "./PreviewPages/PreviewPages";
import { SUPPORTED_CONTENT_TYPES, CMSPageType } from "../../utils/constants";

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

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

const CreateContentCluster: React.FC<CreateContentClusterProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const isCmsEmailEnabled = localStorage.getItem("isCmsEmailEnabled") === "true" || false;
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const [generatePages, setGeneratePages] = useState<any>(0);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>("");
  const [clusterTitle, setClusterTitle] = useState<string>("Content Clusters");
  const [sampleSelectionListItems, setSampleSelectionListItems] = useState<string[]>([]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState<boolean>(false);
  const [crmUserInfo, setCrmUserInfo] = useState<any>({});
  const [selectedCards, setSelectedCards] = useState<Map<string, { id: string; imageUrl: string }[]>>(new Map());
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
  const [jobLinkError, setJobLinkError] = useState<boolean>(false);
  const [jobLinkErrorMessage, setJobLinkErrorMessage] = useState<string>("");
  const [listInput, setListInput] = useState<string>("");
  const [listItems, setListItems] = useState<any[]>([]);
  const [suggestedLists, setSuggestedLists] = useState<any[]>([]);
  const [selectedListsData, setSelectedListsData] = useState<any[]>([]);
  const [clusterTitleError, setClusterTitleError] = useState<boolean>(false);
  const clusterTitleInputRef = useRef<HTMLInputElement>(null);
  const [pagesBasedKeywords, setPagesBasedKeywords] = useState<any>([]);
  const [masterPrompt, setMasterPrompt] = useState<any>("");
  const [newCluster, setNewCluster] = useState<any>(null);
  const [isClusterCreated, setIsClusterCreated] = useState<boolean>(false);
  const [siteMetaData, setSiteMetaData] = useState<any>(null);
  // Pagination and sorting states
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  // Scroll to input when there's an error
  useEffect(() => {
    if (clusterTitleError && clusterTitleInputRef.current) {
      clusterTitleInputRef.current.scrollIntoView({ behavior: 'smooth' });
      clusterTitleInputRef.current.focus();
    }
  }, [clusterTitleError]);
  
  const saveContentCluster = async (payload: any, isNavigate: boolean = true) => {
    await APIService.createContentCluster(payload).then((clusterDetail) => {
      console.log("Content Cluster created:", clusterDetail);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
      setNewCluster(clusterDetail);
      if(isNavigate){
        navigateToClusterDetails(clusterDetail);
      }
    }).catch((error) => {
      console.error("Error creating content cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
    });
  };

  const updateCluster = async (payload: any, isNavigate: boolean = true) => {
    await APIService.updateCluster(payload).then((clusterDetail) => {
      console.log("Content Cluster updated:", clusterDetail);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
      setNewCluster(clusterDetail);
      if(isNavigate){
        navigateToClusterDetails(clusterDetail);
      }
    }).catch((error) => {
      console.error("Error updating content cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
    });
  }

  const navigateToClusterDetails = (clusterDetails: any) => {
    const newPath = location.pathname.replace(/\/create$/, "");
    const pagesObj = {
      contentPages: clusterDetails.contentPages,
      landingPages: clusterDetails.landingPages,
    };
    navigate(`${newPath}/${clusterDetails.clusterId}`, {
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

    // Fetch site metadata
    APIService.getSiteMetaData(selectedTenant.refNum)
      .then((response) => {
        setSiteMetaData(response?.data?.data);
      })
      .catch((err) => console.error("Error getting site metadata", err));
  }, []);

  useEffect(() => {
    // Fetch content clusters
    setClustersLoader(true);
    const payload = {
      refNum: selectedTenant.refNum,
      locale: locale,
      siteVariant: "external",
      isNeededAllDetails: false,
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

  useEffect(() => {
    if (!newCluster?.clusterId) return;

    const deleteCurrentCluster = async () => {
      console.log("Checking if draft cluster needs deletion");
      try {
        const draft: boolean = await APIService.getDraftStatus(newCluster.clusterId);
        if (draft) {
          console.log("Deleting draft cluster:", newCluster.clusterId);
          await APIService.deleteCluster({
            clusterIds: [newCluster.clusterId],
            refNum: selectedTenant.refNum,
          });
        }
      } catch (error) {
        console.error('Error deleting draft cluster:', error);
      }
    };

    const handleBeforeUnload = () => {
      APIService.deleteCluster({
        clusterIds: [newCluster.clusterId],
        refNum: selectedTenant.refNum,
      }).catch(console.error);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      deleteCurrentCluster();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [newCluster?.clusterId, selectedTenant.refNum]);

  // Sort clusters based on selected sort option
  const sortedClustersList = useMemo(() => {
    return [...contentClustersList].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);

      if (selectedSort === "newest") {
        return dateB.getTime() - dateA.getTime(); // Newest first
      } else {
        return dateA.getTime() - dateB.getTime(); // Oldest first
      }
    });
  }, [contentClustersList, selectedSort]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Utility function to scroll to clusters section
  const scrollToClusters = () => {
    setTimeout(() => {
      const clustersSection = document.querySelector('.clusters-section');
      if (clustersSection) {
        clustersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }, 100);
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

  // Pagination logic
  const { totalPages, currentPageClusters, filteredClusters, startIndex, endIndex } = useMemo(() => {
    // Filter clusters based on search term
    const filtered = sortedClustersList.filter((cluster) => {
      if (!clusterSearchTerm.trim()) return true;
      
      const searchTerm = clusterSearchTerm.toLowerCase();
      const clusterTitle = (cluster.clusterTitle || '').toLowerCase();
      const clusterName = (cluster.clusterName || '').toLowerCase();
      const contentTypes = contentTypesForCluster(cluster).join(' ').toLowerCase();
      
      return clusterTitle.includes(searchTerm) || 
             clusterName.includes(searchTerm) || 
             contentTypes.includes(searchTerm);
    });
    
    const total = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, filtered.length);
    const pageData = filtered.slice(startIdx, endIdx);
    
    return {
      totalPages: total,
      currentPageClusters: pageData,
      filteredClusters: filtered,
      startIndex: startIdx + 1, // 1-based for display
      endIndex: endIdx
    };
  }, [sortedClustersList, currentPage, itemsPerPage, clusterSearchTerm]);

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., last-3, last-2, last-1, last
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to clusters section when changing pages
    scrollToClusters();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to clusters section when going to previous page
      scrollToClusters();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to clusters section when going to next page
      scrollToClusters();
    }
  };

  const handleSortSelect = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortDropdown(false);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getSelectedSortLabel = () => {
    return sortOptions.find(option => option.value === selectedSort)?.label || "Newest First";
  };

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


  const fetchAllCmsEmailTemplates = () => {
    return APIService.getAllCmsEmailTemplates({
      refNum: selectedTenant.refNum,
      type: "custom"
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

  const generateClusterName = (clusterPayload: any) => {
    return APIService.generateClusterName(clusterPayload)
  }

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

  const createClusterV2 = (contentTypes: CMSPageType[], emailTemplateId?: string | null) => {
    return APIService.createAIPagesV2({
      clusterId: newCluster?.clusterId,
      companyName: selectedTenant.tenantName,
      defaultUrl: siteMetaData?.domain ? "https://" + siteMetaData.domain + "/" : "",
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
      contentTypes: contentTypes,
      ...(emailTemplateId ? { [SUPPORTED_CONTENT_TYPES.EMAIL_TEMPLATE]: emailTemplateId } : {}),
      isCmsEmailEnabled
    });
  };
  const enhancePrompt = () => {
    if (!promptInput && !jobLink) return Promise.resolve();
    setShowSaveOrDiscardModal(true);
    setShowLoader(true);
    const supportingMaterial = [
      {
        type: "jobsPage",
        urlList: jobLink ? [jobLink] : []
      }
    ];
    return APIService.enhancePrompt({
      isEnhancePrompt: true,
      prompt: promptInput,
      deviceType: "desktop",
      language: locale,
      refNum: selectedTenant.refNum,
      supportingMaterial,
    }).then((response) => {
      setShowSaveOrDiscardModal(false); 
      
      // Check if the response starts with "NOT VALID"
      if (response?.enhancedPrompt && response.enhancedPrompt.startsWith("NOT VALID")) {
        // Extract error reason from {{}}
        const errorMatch = response.enhancedPrompt.match(/\{\{(.+?)\}\}/);
        const errorReason = errorMatch ? errorMatch[1] : "Invalid URL";
        
        setJobLinkError(true);
        setJobLinkErrorMessage(errorReason);
        setShowLoader(false);
        console.error("URL validation failed:", errorReason);
        return Promise.reject(new Error(errorReason));
      }
      
      // Update the prompt input with the enhanced version
      if (response?.enhancedPrompt) {
        setPromptInput(response.enhancedPrompt);
        setJobLinkError(false);
        setJobLinkErrorMessage("");
      }
      setShowLoader(false);
      console.log("Enhanced prompt:", response);
      return response;
    }).catch((error) => {
      setShowSaveOrDiscardModal(false);
      console.error("Error enhancing prompt:", error);
      setShowLoader(false);
      throw error;
    });
  }

  const handleListSearch = (searchTerm: string) => {
    getListItems(searchTerm);
  };

  const handlePromptSubmit = async (isRegenerate?: boolean) => {
    const isJobLinkValid = jobLink && isValidJobLink ? true : false;
    if (promptInput || (jobLink && isValidJobLink)) {
      setShowSaveOrDiscardModal(true);
      setFetchedPages(null);
      // handleClusterCreation();
      await handlePromptBasedSuggestions(isJobLinkValid, isRegenerate || false);
      setSelectedCards(new Map());
      setGeneratePages(generatePages+1);
    }
  };

  const handlePromptBasedSuggestions = async (isJobLinkValid: boolean, isRegenerate?: boolean) => {
    setShowLoader(true);
    const payload =  [
        {
            "type": "jobLink",
            "urlList": [jobLink]
        }
    ];
    
    try {
      let clusterNameResponse;
      
      if (isJobLinkValid) {
        const enhancedPromptResponse = await enhancePrompt();
        const clusterPayload = {
          refNum: selectedTenant.refNum,
          prompt: enhancedPromptResponse.enhancedPrompt,
          deviceType: "desktop",
          language: locale,
          isRegenerate: isRegenerate || false,
        };
        clusterNameResponse = await generateClusterName(clusterPayload);
      } else {
        const clusterPayload = {
          refNum: selectedTenant.refNum,
          prompt: promptInput,
          deviceType: "desktop",
          language: locale,
          isRegenerate: isRegenerate || false,
        };
        clusterNameResponse = await generateClusterName(clusterPayload);
      }
      
      // Handle prompt based suggestions response
      // if (promptResponse?.masterPrompt && jobLink) {
      //   setPromptInput(promptResponse.masterPrompt);
      // }
      // setMasterPrompt(promptResponse?.masterPrompt);
      // setPagesBasedKeywords(promptResponse?.pageTitleAndDescription || []);
      // Set fetched pages with content from response
      // const fetchedPagesData = {
      //   contentPages: promptResponse?.contentPages || [],
      //   landingPages: promptResponse?.landingPages || [],
      //   blogs: promptResponse?.blogDetails || []
      // };
      // setFetchedPages(fetchedPagesData);
      
      // Update content types based on response
      // if (promptResponse.data?.contentTypes) {
      //   const contentTypeNames = promptResponse.contentTypes.map((type: any) => type.displayName);
      //   setSelectedContentTypes(contentTypeNames);
      // }
      
      const clusterTitleName = (clusterNameResponse?.clusterName ?? "").replace(/"/g, "");
      const intentAnalysisJson = (clusterNameResponse?.intentAnalysisJson ?? "");
      // let suggestedTagsData = promptResponse.contentTypes || [];
      // setSuggestedTags(suggestedTagsData);
      
      // Set default selectedTags and selectedContentId to first two content types
      // if (suggestedTagsData.length >= 2) {
      //   const defaultTags = suggestedTagsData.slice(0, 2).map((type: any) => type.displayName);
      //   const defaultContentIds = suggestedTagsData.slice(0, 2).map((type: any) => type.contentId);
      //   setSelectedTags(defaultTags);
      //   setSelectedContentId(defaultContentIds);
      // } else if (suggestedTagsData.length === 1) {
      //   // If only one content type, select just that one
      //   setSelectedTags([suggestedTagsData[0].displayName]);
      //   setSelectedContentId([suggestedTagsData[0].contentId]);
      // }
      
      // Handle suggested lists response
      // console.log("Suggested Lists Response:", suggestedListsResponse);
      // setSuggestedLists(suggestedListsResponse?.data?.result || []);
      
      setEditClusterTitle(true);
      setClusterTitle(clusterTitleName);
      if (!clusterTitleName.trim()) {
        setUpdateClusterTitle(true);
      }
      if(!isClusterCreated){
        await clusterCreation(clusterTitleName, intentAnalysisJson);
      } else {
        updateClusterWithIntentAnalysisJson(intentAnalysisJson);
      }
      setShowLoader(false);
      setIsPromptSubmitted(true);
      setShowSaveOrDiscardModal(false);
      setShowClustersList(true);
      setShowPromptSuggestions(true);
        
      // console.log("Prompt Based Suggestions", promptResponse);
    } catch (err) {
      console.error("Error fetching data:", err);
      setShowSaveOrDiscardModal(false);
      setShowLoader(false);
      setShowPromptSuggestions(false);
      setShowClustersList(false);
      setIsPromptSubmitted(false);
    }
  }
  const handleClusterCreate = async () => {
    // Simple validation: check if title is empty when in edit mode
    const isTitleEmpty = !clusterTitle.trim();
    const isInEditMode = editClusterTitle;
    
    if (isInEditMode && isTitleEmpty) {
      setClusterTitleError(true);
      setUpdateClusterTitle(true); // Navigate to edit section
      // Focus on the cluster title input when validation fails
      if (clusterTitleInputRef.current) {
        clusterTitleInputRef.current.focus();
      }
      return;
    }
    
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
      console.log("selectedCards", selectedCards);
      // Extract content types from selectedCards Map
      const contentTypes: CMSPageType[] = [];
      let emailTemplateId: string | null = "";
      
      selectedCards.forEach((ids: { id: string; imageUrl: string }[], type: string) => {
        if (type === SUPPORTED_CONTENT_TYPES.EMAIL_TEMPLATE) {
          // For email templates, store the template ID separately
          emailTemplateId = ids[0]?.id || ""; // Extract the id from the object
        } else {
          // For other content types, add to contentTypes array
          contentTypes.push(type as CMSPageType);
        }
      });
      const res = await createClusterV2(contentTypes, emailTemplateId);
      console.log("res", res);
      
      // Handle case where res might not have the expected structure
      let responseData = res;
      if (res && typeof res === 'object' && res.data && Array.isArray(res.data)) {
        responseData = res.data;
      } else if (!Array.isArray(res)) {
        console.warn("Unexpected response format:", res);
        responseData = [];
      }
      
      // Process the response to extract successful content
      const successfulContent = responseData.filter((item: any) => item.success);
      const failedContent = responseData.filter((item: any) => !item.success);
      
      // Log any failed content for debugging
      if (failedContent.length > 0) {
        console.warn("Some content failed to create:", failedContent);
      }
      
      // Extract successful content by type
      const successfulBlog = successfulContent.find((item: any) => item.contentType === "blog");
      let successfulContentPage = successfulContent.find((item: any) => item.contentType === "content-page");
      const successfulEmailTemplate = successfulContent.find((item: any) => item.contentType === "email-template");
      let aiLandingPage = successfulContent.find((item: any) => item.contentType === "landing-page");
      
      // Prepare cluster data for saving
      let createdBlogDetail = null;
      if (successfulBlog) {
        const allBlogs = await fetchAllBlogsDetails();
        createdBlogDetail = allBlogs["all"]?.find((blog: any) => blog.articleId === successfulBlog.data?.articleId);
      }
      
      let createdEmailTemplateData = null;
      //successfulEmailTemplate?.data?.response?.templateId
      if (isCmsEmailEnabled) {
        if (successfulEmailTemplate?.data?.response?.data?.id) {
          var allEmailTemplates = await fetchAllCmsEmailTemplates();
          createdEmailTemplateData = allEmailTemplates.find((template: any) => template.templateId === successfulEmailTemplate.data.response.data.id);

        }

      } else {
        if (successfulEmailTemplate?.data?.response?.templateId) {
          var allEmailTemplates = await fetchAllEmailTemplates();
          createdEmailTemplateData = allEmailTemplates.find((template: any) => template._id === successfulEmailTemplate.data.response.templateId);

        }

      }
      // if (successfulEmailTemplate?.data?.response?.data?.id) {
      //   var allEmailTemplates;
      //   if (isCmsEmailEnabled) {
      //     allEmailTemplates = await fetchAllCmsEmailTemplates();
      //   } else {
      //     allEmailTemplates = await fetchAllEmailTemplates();
      //   }
      //   createdEmailTemplateData = allEmailTemplates.find((template: any) => template.templateId === successfulEmailTemplate.data.response.data.id);
      // }
      successfulContentPage = successfulContentPage && Object.keys(successfulContentPage.data?.data || {}).length > 0
      ? [successfulContentPage.data.data]
      : [];
      aiLandingPage = aiLandingPage && Object.keys(aiLandingPage.data?.data || {}).length > 0
      ? [aiLandingPage.data.data]
      : [];
        // Set avatarUrl for content types that have selected cards
        selectedCards.forEach((ids: { id: string; imageUrl: string }[], type: string) => {
          if (type === SUPPORTED_CONTENT_TYPES.LANDING_PAGE && aiLandingPage && aiLandingPage.length > 0) {
            aiLandingPage[0]["avatarUrl"] = ids[0]?.imageUrl || "";
          }
          if (type === SUPPORTED_CONTENT_TYPES.CONTENT_PAGE && successfulContentPage && successfulContentPage.length > 0) {
            successfulContentPage[0]["avatarUrl"] = ids[0]?.imageUrl || "";
          }
          if (type === SUPPORTED_CONTENT_TYPES.BLOG && createdBlogDetail) {
            createdBlogDetail["avatarUrl"] = ids[0]?.imageUrl || "";
            createdBlogDetail["previewUrl"] = successfulBlog.data?.previewUrl;
          }
          if (type === SUPPORTED_CONTENT_TYPES.EMAIL_TEMPLATE && createdEmailTemplateData && isCmsEmailEnabled) {
            // For email templates, store the template ID separately
            createdEmailTemplateData["previewUrl"] = ids[0]?.imageUrl || ""; 
          }
        });

    
      const clusterData = {
        clusterId: newCluster?.clusterId,
        refNum: selectedTenant.refNum,
        locale,
        siteVariant: "external",
        contentPages: selectedCards.get(SUPPORTED_CONTENT_TYPES.CONTENT_PAGE) ? fetchedPages?.contentPages : [], 
        landingPages: selectedCards.get(SUPPORTED_CONTENT_TYPES.LANDING_PAGE) ? fetchedPages?.landingPages : [],
        blogs: selectedCards.get(SUPPORTED_CONTENT_TYPES.BLOG) ? fetchedPages?.blogs : [],
        aiCreatedLandingPage: aiLandingPage && Object.keys(aiLandingPage || {}).length > 0
        ? aiLandingPage
        : [],
      
        aiCreatedBlog: createdBlogDetail ? [createdBlogDetail] : [],
        aiCreatedContentPage: successfulContentPage && Object.keys(successfulContentPage || {}).length > 0
        ? successfulContentPage
        : [],
        emailTemplates: [],
        createdEmailTemplate: createdEmailTemplateData ? [createdEmailTemplateData] : [],
        clusterTitle: promptInput,
        clusterName: clusterTitle,
        selectedLists: selectedListsData,
        draft: false
      };
      
      // update the cluster
      updateCluster(clusterData);
    } catch (error) {
      console.error("Error creating cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
    }
  }

  const updateClusterWithIntentAnalysisJson = async (intentAnalysisJson: string) => {
    const payload = {
      clusterId: newCluster.clusterId,
      draft: true,
      intentAnalysisJson: intentAnalysisJson
    };
    await updateCluster(payload);
  };

  const clusterCreation = async (clusterTitleName: string, intentAnalysisJson: string) => {
    // Simple validation: check if title is empty when in edit mode
    const isTitleEmpty = !clusterTitle.trim();
    const isInEditMode = editClusterTitle;
    
    if (isInEditMode && isTitleEmpty) {
      setClusterTitleError(true);
      setUpdateClusterTitle(true); // Navigate to edit section
      // Focus on the cluster title input when validation fails
      if (clusterTitleInputRef.current) {
        clusterTitleInputRef.current.focus();
      }
      return;
    }
    
    setShowLoader(true);
    setShowSaveOrDiscardModal(true);
    setClusterTitleError(false);
    
    // Validate cluster name first
    try {
      const clusterData = {
        refNum: selectedTenant.refNum,
        locale,
        siteVariant: "external",
        contentPages: fetchedPages?.contentPages, 
        landingPages: fetchedPages?.landingPages,
        blogs: fetchedPages?.blogs,
        clusterTitle: promptInput,
        clusterName: "Create Content Cluster",
        selectedLists: selectedListsData,
        draft: true,
        intentAnalysisJson: intentAnalysisJson
      };
      
      // Save the cluster
      await saveContentCluster(clusterData, false);
      setIsClusterCreated(true);
    } catch (error) {
      console.error("Error creating cluster:", error);
      setShowLoader(false);
      setShowSaveOrDiscardModal(false);
      setIsClusterCreated(false);
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

  const handleClusterClick = (cluster: any) => {
    console.log("Clicked", cluster);
    const newPath = location.pathname.replace(/\/create$/, "");
      navigate(`${newPath}/${cluster.clusterId}`);
  };



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

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return true;
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleJobLinkChange = (value: string) => {
    setJobLink(value);
    if (value.trim() && !isValidUrl(value)) {
      setJobLinkError(true);
      setJobLinkErrorMessage("Please enter a valid URL (must start with http:// or https://)");
    } else {
      setJobLinkError(false);
      setJobLinkErrorMessage("");
    }
  };

  const isValidJobLink = jobLink.trim() === '' || isValidUrl(jobLink);

  return (
    <>
      {/* {showLoader ? (
        <Loader title="Generating Content Cluster.." />
      ) : ( */}
      <div className="create-content-cluster-container">
        <div className="create-content-cluster-header">
          {updateClusterTitle?(
            <input 
              ref={clusterTitleInputRef}
              className={clusterTitleError ? "create-content-cluster-header-title-input-error" : "create-content-cluster-header-title-input"}  
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setUpdateClusterTitle(false);
                  setClusterTitleError(false);
                  if(!isClusterCreated){
                    clusterCreation(clusterTitle);
                  }
                }
              }}
              onClick={() => {
                setClusterTitleError(false);
              }}
              type="text" 
              value={clusterTitle} 
              onChange={(e) => {setClusterTitle(e.target.value); setClusterTitleError(false);}} 
              placeholder="Please enter content cluster title"
            />
          ):(
            <span className={`create-content-cluster-header-title${clusterTitleError ? " error" : ""}`}>{clusterTitle || "Content Clusters"}</span>
          )}
          {/* <span className="create-content-cluster-header-title">{clusterTitle}</span> */}
          {editClusterTitle && !updateClusterTitle && (
            <img onClick={() => setUpdateClusterTitle(true)} src={pencilIcon} alt="edit-cluster-title" />
          )}
          {updateClusterTitle && (
            <button className="done-btn" onClick={() => {
              if (!clusterTitle.trim()) {
                setClusterTitleError(true);
                return;
              }
              setUpdateClusterTitle(false);
              setClusterTitleError(false);
              if(!isClusterCreated){
                clusterCreation(clusterTitle);
              }
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
                        handlePromptSubmit(true);
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
                    <button className={`prompt-enhance-btn${(!promptInput && !jobLink) || !isValidJobLink ? " disabled" : ""}`} type="button" tabIndex={-1} disabled={(!promptInput && !jobLink) || !isValidJobLink} onClick={enhancePrompt}>
                      <img src={(!promptInput && !jobLink) || !isValidJobLink ? disabledSparkleIcon : sparkleIcon} alt="Enhance prompt with AI." style={{ marginRight: 6 }} />
                      Enhance prompt
                    </button>
                    <button
                      className={`prompt-arrow-btn${(!promptInput && !jobLink) || !isValidJobLink ? " disabled" : ""}`}
                      onClick={() => handlePromptSubmit()}
                      disabled={(!promptInput && !jobLink) || !isValidJobLink}
                      type="button"
                      aria-label="Submit prompt"
                    >
                      <img src={(!promptInput && !jobLink) || !isValidJobLink ? disabledArrowUpIcon : arrowUpIcon} alt="Submit" />
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
                className={`job-link-input${jobLinkError ? " error" : ""}`}
                placeholder="Paste job link here"
                value={jobLink}
                onChange={(e) => handleJobLinkChange(e.target.value)}
              />
            </div>
            {jobLinkError && jobLinkErrorMessage && (
              <div className="job-link-error-message">{jobLinkErrorMessage}</div>
            )}
          </div>)}
        </div>
        {showPromptSuggestions && (
          <div>
            {false && (
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
            )}
            <PreviewPages selectedCards={selectedCards} setSelectedCards={setSelectedCards} key={generatePages} pagesBasedKeywords={pagesBasedKeywords} promptInput={promptInput} showSaveOrDiscardModal={showSaveOrDiscardModal} newCluster={newCluster}/>
              {/* <div className="prompt-suggestions content-format-section">
            <PreviewPages key={generatePages} pagesBasedKeywords={pagesBasedKeywords} promptInput={masterPrompt} showSaveOrDiscardModal={showSaveOrDiscardModal}/>
            <div className="prompt-suggestions content-format-section">
              <div className="prompt-suggestions-heading">Recommended content formats</div>
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
            </div> */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                className={`generate-cluster-btn${selectedCards.size === 0 ? " disabled" : ""}`} 
                onClick={handleClusterCreate}
                disabled={selectedCards.size === 0}
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
                  onChange={(e) => {
                    setClusterSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </div>
              <div className="sort-dropdown" ref={sortDropdownRef}>
                <button 
                  className="sort-dropdown-button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <span className="sort-dropdown-button-text">
                    Sort: {getSelectedSortLabel()}
                  </span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: showSortDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <path 
                      d="M4 6L8 10L12 6" 
                      stroke="#637085" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {showSortDropdown && (
                  <div className="sort-dropdown-menu">
                    {sortOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`sort-dropdown-item ${selectedSort === option.value ? 'active' : ''}`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        <span className="sort-dropdown-item-text">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="clusters-list">
            {clustersLoader ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader title="Loading clusters..." />
              </div>
            ) : contentClustersList.length > 0 ? (
              currentPageClusters.map((cluster: any, idx: number) => {
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
                    {/* <div className="cluster-divider" />
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
                    </div> */}
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
          
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing {startIndex} - {endIndex} of {filteredClusters.length}
              </div>
              
              <div className="pagination-container">
                <button 
                  className="pagination-btn pagination-arrow" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="pagination-pages">
                  {generatePageNumbers().map((page, index) => (
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                <button 
                  className="pagination-btn pagination-arrow" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
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
