import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./ContentClusterDetails.css";
import ClusterDetailCard from "./ClusterDetailCard/ClusterDetailCard";
import ClusterAnalyticsCard from "./ClusterAnalyticsCard/ClusterAnalyticsCard";
import PreviewView from "./PreviewView/PreviewView";
import { APIService } from "../../../src/utils/api.service";
import InlineLoader from "../../components/loader/InlineLoader";
import { usePreview } from "../../hooks/usePreview";


import backIcon from "../../assets/svg/leftArrow.svg";
import arrowUp from '../../assets/svg/arrow-head.svg';
import sparkleIcon from '../../assets/svg/black-sparkle.svg';
import penIcon from '../../assets/svg/pen.svg';

interface ClusterDetailsProps {
  data: any;
}

// This component is responsible for just showing details of the cluster
// No API Call is supposed to be made here
const ClusterDetails: React.FC<ClusterDetailsProps> = ({ data }) => {
  const location = useLocation();
  const { clusterId } = useParams();
  const navigate = useNavigate();
  let { pages, blogs, aiBlog, aiContentPage, emailTemplates, createdEmailTemplate, clusterName, clusterTitle, aiLandingPage } = location.state || {};

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [contentSourceFilter, setContentSourceFilter] = useState<string>("all");
  const [showContentSourceDropdown, setShowContentSourceDropdown] = useState(false);
  const [crmUserInfo, setCrmUserInfo] = useState<any>({});
  const [pagePublishStates, setPagePublishStates] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const sectionKeys = [
    'aiGenerated',
    'contentPages',
    'landingPages',
    'aiContentPage',
    'aiBlog',
    'blogs',
    'emailTemplates',
    'createdEmailTemplate',
    'aiLandingPage',
  ];
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    sectionKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const locale = JSON.parse(sessionStorage.getItem("locale") || '"en_us"') || "en_us";

  const tabs = ["All", "Pages", "Blogs", "Email Templates"];

  const currentPage = location.state?.currentPage;
  const {
    previewDiv,
    selectedPageData,
    setPreviewDiv,
    setSelectedPageData,
    isCheckingTaskProgress,
    handlePreviewOpen: handlePreviewOpenTask,
    handlePreviewClose: handlePreviewCloseTask,
  } = usePreview();
  // Content source options
  const contentSourceOptions = [
    { value: "all", label: "All", icon: null },
    { value: "ai", label: "AI", icon: sparkleIcon },
    { value: "manual", label: "Manual", icon: penIcon },
  ];

  // Function to calculate counts for each tab
  const getTabCounts = () => {
    let allCount = 0;
    let pagesCount = 0;
    let blogsCount = 0;
    let emailTemplatesCount = 0;
    let draftCount = 0;
    let publishedCount = 0;

    // Helper function to check if content should be shown based on status filter
    const shouldShowByStatus = (status: string) => {
      if (statusFilter === "all") return true;
      return statusFilter === status.toLowerCase();
    };

    // Count AI generated content (only if filter allows AI or all)
    if (contentSourceFilter === "all" || contentSourceFilter === "ai") {
      if (aiContentPage) {
        const status = aiContentPage.status?.toLowerCase() || "published";
        if (shouldShowByStatus(status)) {
          allCount++;
          pagesCount++;
          if (status === "draft") draftCount++;
          else if (status === "published") publishedCount++;
        }
      }
      if (aiBlog) {
        const status = aiBlog.status?.toLowerCase() || "published";
        if (shouldShowByStatus(status)) {
          allCount++;
          blogsCount++;
          if (status === "draft") draftCount++;
          else if (status === "published") publishedCount++;
        }
      }
      if (aiLandingPage) {
        const status = aiLandingPage.status?.toLowerCase() || "published";
        if (shouldShowByStatus(status)) {
          allCount++;
          pagesCount++;
          if (status === "draft") draftCount++;
          else if (status === "published") publishedCount++;
        }
      }
      if (createdEmailTemplate) {
        const status = createdEmailTemplate.status?.toLowerCase() || "published";
        if (shouldShowByStatus(status)) {
          allCount++;
          emailTemplatesCount++;
          if (status === "draft") draftCount++;
          else if (status === "published") publishedCount++;
        }
      }
    }

    // Count regular content pages (only if filter allows manual or all)
    if (contentSourceFilter === "all" || contentSourceFilter === "manual") {
      if (pages?.contentPages) {
        pages.contentPages.forEach((page: any) => {
          const status = page.status?.toLowerCase() || "published";
          if (shouldShowByStatus(status)) {
            allCount++;
            pagesCount++;
            if (status === "draft") draftCount++;
            else if (status === "published") publishedCount++;
          }
        });
      }
      if (pages?.landingPages) {
        pages.landingPages.forEach((page: any) => {
          const status = page.status?.toLowerCase() || "published";
          if (shouldShowByStatus(status)) {
            allCount++;
            pagesCount++;
            if (status === "draft") draftCount++;
            else if (status === "published") publishedCount++;
          }
        });
      }

      // Count blogs
      if (blogs) {
        blogs.forEach((blog: any) => {
          const status = blog.status?.toLowerCase() || "published";
          if (shouldShowByStatus(status)) {
            allCount++;
            blogsCount++;
            if (status === "draft") draftCount++;
            else if (status === "published") publishedCount++;
          }
        });
      }

      // Count email templates
      if (emailTemplates) {
        emailTemplates.forEach((emailTemplate: any) => {
          const status = emailTemplate.status?.toLowerCase() || "published";
          if (shouldShowByStatus(status)) {
            allCount++;
            emailTemplatesCount++;
            if (status === "draft") draftCount++;
            else if (status === "published") publishedCount++;
          }
        });
      }
    }

    return { allCount, pagesCount, blogsCount, emailTemplatesCount, draftCount, publishedCount };
  };

  // Function to calculate total counts (always returns total counts regardless of filters)
  const getTotalCounts = () => {
    let totalDraftCount = 0;
    let totalPublishedCount = 0;

    // Count AI generated content (only if filter allows AI or all)
    if (contentSourceFilter === "all" || contentSourceFilter === "ai") {
      if (aiContentPage) {
        const status = aiContentPage.status?.toLowerCase() || "published";
        if (status === "draft") totalDraftCount++;
        else if (status === "published") totalPublishedCount++;
      }
      if (aiBlog) {
        const status = aiBlog.status?.toLowerCase() || "published";
        if (status === "draft") totalDraftCount++;
        else if (status === "published") totalPublishedCount++;
      }
      if (aiLandingPage) {
        const status = aiLandingPage.status?.toLowerCase() || "published";
        if (status === "draft") totalDraftCount++;
        else if (status === "published") totalPublishedCount++;
      }
      if (createdEmailTemplate) {
        const status = createdEmailTemplate.status?.toLowerCase() || "published";
        if (status === "draft") totalDraftCount++;
        else if (status === "published") totalPublishedCount++;
      }
    }

    // Count regular content pages (only if filter allows manual or all)
    if (contentSourceFilter === "all" || contentSourceFilter === "manual") {
      if (pages?.contentPages) {
        pages.contentPages.forEach((page: any) => {
          const status = page.status?.toLowerCase() || "published";
          if (status === "draft") totalDraftCount++;
          else if (status === "published") totalPublishedCount++;
        });
      }
      if (pages?.landingPages) {
        pages.landingPages.forEach((page: any) => {
          const status = page.status?.toLowerCase() || "published";
          if (status === "draft") totalDraftCount++;
          else if (status === "published") totalPublishedCount++;
        });
      }

      // Count blogs
      if (blogs) {
        blogs.forEach((blog: any) => {
          const status = blog.status?.toLowerCase() || "published";
          if (status === "draft") totalDraftCount++;
          else if (status === "published") totalPublishedCount++;
        });
      }

      // Count email templates
      if (emailTemplates) {
        emailTemplates.forEach((emailTemplate: any) => {
          const status = emailTemplate.status?.toLowerCase() || "published";
          if (status === "draft") totalDraftCount++;
          else if (status === "published") totalPublishedCount++;
        });
      }
    }

    return { totalDraftCount, totalPublishedCount };
  };

  // Function to calculate counts for specific tabs
  const getTabSpecificCounts = () => {
    let tabDraftCount = 0;
    let tabPublishedCount = 0;

    switch (activeTab) {
      case 0: // All tab - show all content
        return getTotalCounts();

      case 1: // Pages tab - show only pages
        // Count AI pages
        if (contentSourceFilter === "all" || contentSourceFilter === "ai") {
          if (aiContentPage) {
            const status = aiContentPage.status?.toLowerCase() || "published";
            if (status === "draft") tabDraftCount++;
            else if (status === "published") tabPublishedCount++;
          }
          if (aiLandingPage) {
            const status = aiLandingPage.status?.toLowerCase() || "published";
            if (status === "draft") tabDraftCount++;
            else if (status === "published") tabPublishedCount++;
          }
        }
        // Count regular pages
        if (contentSourceFilter === "all" || contentSourceFilter === "manual") {
          if (pages?.contentPages) {
            pages.contentPages.forEach((page: any) => {
              const status = page.status?.toLowerCase() || "published";
              if (status === "draft") tabDraftCount++;
              else if (status === "published") tabPublishedCount++;
            });
          }
          if (pages?.landingPages) {
            pages.landingPages.forEach((page: any) => {
              const status = page.status?.toLowerCase() || "published";
              if (status === "draft") tabDraftCount++;
              else if (status === "published") tabPublishedCount++;
            });
          }
        }
        break;

      case 2: // Blogs tab - show only blogs
        // Count AI blogs
        if (contentSourceFilter === "all" || contentSourceFilter === "ai") {
          if (aiBlog) {
            const status = aiBlog.status?.toLowerCase() || "published";
            if (status === "draft") tabDraftCount++;
            else if (status === "published") tabPublishedCount++;
          }
        }
        // Count regular blogs
        if (contentSourceFilter === "all" || contentSourceFilter === "manual") {
          if (blogs) {
            blogs.forEach((blog: any) => {
              const status = blog.status?.toLowerCase() || "published";
              if (status === "draft") tabDraftCount++;
              else if (status === "published") tabPublishedCount++;
            });
          }
        }
        break;

      case 3: // Email Templates tab - show only email templates
        // Count AI email templates
        if (contentSourceFilter === "all" || contentSourceFilter === "ai") {
          if (createdEmailTemplate) {
            const status = createdEmailTemplate.status?.toLowerCase() || "published";
            if (status === "draft") tabDraftCount++;
            else if (status === "published") tabPublishedCount++;
          }
        }
        // Count regular email templates
        if (contentSourceFilter === "all" || contentSourceFilter === "manual") {
          if (emailTemplates) {
            emailTemplates.forEach((emailTemplate: any) => {
              const status = emailTemplate.status?.toLowerCase() || "published";
              if (status === "draft") tabDraftCount++;
              else if (status === "published") tabPublishedCount++;
            });
          }
        }
        break;

      default:
        return getTotalCounts();
    }

    return { totalDraftCount: tabDraftCount, totalPublishedCount: tabPublishedCount };
  };

  const tabCounts = getTabCounts();
  const tabSpecificCounts = getTabSpecificCounts();

  const handleBackNavigation = () => {
    if (currentPage === "content-clusters") {
      navigate("/content-clusters");
    } else if (currentPage === "content-cluster/create") {
      navigate("/content-cluster/create");
    }
    else {
      navigate("/content-clusters");
    }
  };

  const handlePreviewOpen = (pageData: any, contentType: string = "") => {
    setSelectedPageData(pageData);
    setSelectedContentType(contentType);
    setPreviewDiv(true);
    handlePreviewOpenTask(pageData, contentType)
  };

  const handlePreviewClose = () => {
    localStorage.removeItem("blogId");
    setPreviewDiv(false);
    setSelectedPageData(null);
    setSelectedContentType("");
    handlePreviewCloseTask()
  };

  const handleContentSourceFilterChange = (value: string) => {
    setContentSourceFilter(value);
    setShowContentSourceDropdown(false);
  };

  const handleStatusFilterChange = (value: string) => {
    // If clicking the same filter, unfilter it (set to "all")
    if (statusFilter === value) {
      setStatusFilter("all");
    } else {
      setStatusFilter(value);
    }
  };

  // Helper to toggle section
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to check if content should be shown based on status
  const shouldShowByStatus = (status: string) => {
    if (statusFilter === "all") return true;
    return statusFilter === status.toLowerCase();
  };

  // Helper to check if content should be shown based on both content source and status
  const shouldShowContent = (contentType: 'ai' | 'manual') => {
    if (contentSourceFilter === "all") return true;
    return contentSourceFilter === contentType;
  };

  // Helper functions to check if sections have content to show
  const hasAIContent = () => {
    const hasAI = (aiContentPage || aiBlog || aiLandingPage || createdEmailTemplate) && shouldShowContent('ai');
    if (!hasAI) return false;

    // Check if any AI content matches the status filter
    const aiItems = [aiContentPage, aiBlog, aiLandingPage, createdEmailTemplate].filter(Boolean);
    return aiItems.some(item => shouldShowByStatus(item.status?.toLowerCase() || "published"));
  };

  const hasContentPages = () => {
    if (!pages?.contentPages || pages.contentPages.length === 0 || !shouldShowContent('manual')) return false;
    return pages.contentPages.some((page: any) => shouldShowByStatus(page.status?.toLowerCase() || "published"));
  };

  const hasLandingPages = () => {
    if (!pages?.landingPages || pages.landingPages.length === 0 || !shouldShowContent('manual')) return false;
    return pages.landingPages.some((page: any) => shouldShowByStatus(page.status?.toLowerCase() || "published"));
  };

  const hasBlogs = () => {
    if (!blogs || blogs.length === 0 || !shouldShowContent('manual')) return false;
    return blogs.some((blog: any) => shouldShowByStatus(blog.status?.toLowerCase() || "published"));
  };

  const hasEmailTemplates = () => {
    if (!emailTemplates || emailTemplates.length === 0 || !shouldShowContent('manual')) return false;
    return emailTemplates.some((emailTemplate: any) => shouldShowByStatus(emailTemplate.status?.toLowerCase() || "published"));
  };

  const hasAIPages = () => {
    const hasAI = (aiContentPage || aiLandingPage) && shouldShowContent('ai');
    if (!hasAI) return false;

    const aiItems = [aiContentPage, aiLandingPage].filter(Boolean);
    return aiItems.some(item => shouldShowByStatus(item.status?.toLowerCase() || "published"));
  };

  const hasAIBlogs = () => {
    return aiBlog && shouldShowContent('ai') && shouldShowByStatus(aiBlog.status?.toLowerCase() || "published");
  };

  const hasAIEmailTemplates = () => {
    return createdEmailTemplate && shouldShowContent('ai') && shouldShowByStatus(createdEmailTemplate.status?.toLowerCase() || "published");
  };

  // Helper to get the selected option label
  const getSelectedOptionLabel = () => {
    const selectedOption = contentSourceOptions.find(option => option.value === contentSourceFilter);
    if (contentSourceFilter === "all") {
      return "Content source";
    }
    return selectedOption ? selectedOption.label : "Content source";
  };

  useEffect(() => {
    if (!pages && !blogs && !aiBlog && !aiContentPage && !emailTemplates && !createdEmailTemplate) {
      setIsLoading(true);
  
      APIService.getClusterById(clusterId).then((cluster: any) => {
        cluster = cluster[0];
        if (cluster) {
          pages = { contentPages: cluster?.contentPages, landingPages: cluster?.landingPages };
          blogs = cluster?.blogs;
          aiBlog = cluster?.aiCreatedBlog?.[0];
          aiContentPage = cluster?.aiCreatedContentPage?.[0];
          emailTemplates = cluster?.emailTemplates;
          createdEmailTemplate = cluster?.createdEmailTemplate?.[0];
          aiLandingPage = cluster?.aiCreatedLandingPage?.[0];
          clusterTitle = cluster?.clusterTitle;
          clusterName = cluster?.clusterName;
        }
        location.state = { pages, blogs, aiBlog, clusterTitle, clusterName, aiContentPage, emailTemplates, createdEmailTemplate, aiLandingPage };
        fetchPagePublishStates().then(() => {
          setIsLoading(false);
        }).catch((error) => {
          console.error("Error fetching page publish states:", error);
          setIsLoading(false);
        });
      }).catch((error) => {
        console.error("Error fetching cluster data:", error);
        setIsLoading(false);
      });
    }
    else {
      setIsLoading(true);
      fetchPagePublishStates().then(() => {
        setIsLoading(false);
      }).catch((error) => {
        console.error("Error fetching page publish states:", error);
        setIsLoading(false);
      });
    }
  }, []);

  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = new Date(timestamp).toLocaleDateString("en-US", options);
    return formattedDate;
  };

  const getContentStatus = (status: string) => {
    if (status === "1") {
      return "Published";
    } else if (status === "3") {
      return "Draft";
    } else if (status === "2") {
      return "Unpublished";
    }
    else {
      return "Published";
    }
  }

  const fetchPagePublishStates = async () => {
    try {
      // Collect all page IDs from different content types
      const pageIds: string[] = [];

      // Get current state values
      const currentPages = location.state?.pages || pages;
      const currentBlogs = location.state?.blogs || blogs;
      const currentAiBlog = location.state?.aiBlog || aiBlog;
      const currentAiContentPage = location.state?.aiContentPage || aiContentPage;
      const currentAiLandingPage = location.state?.aiLandingPage || aiLandingPage;
      const currentEmailTemplates = location.state?.emailTemplates || emailTemplates;
      const currentCreatedEmailTemplate = location.state?.createdEmailTemplate || createdEmailTemplate;

      // Add content pages
      if (currentPages?.contentPages) {
        currentPages.contentPages.forEach((page: any) => {
          if (page.pageId) pageIds.push(page.pageId);
        });
      }

      // Add landing pages
      if (currentPages?.landingPages) {
        currentPages.landingPages.forEach((page: any) => {
          if (page.pageId) pageIds.push(page.pageId);
        });
      }

      // Add AI content pages
      if (currentAiContentPage?.pageId) {
        pageIds.push(currentAiContentPage.pageId);
      } else if (currentAiContentPage?.id) {
        pageIds.push(currentAiContentPage.id);
      } else if (currentAiContentPage?.articleId) {
        pageIds.push(currentAiContentPage.articleId);
      }

      // Add AI landing pages
      if (currentAiLandingPage?.pageId) {
        pageIds.push(currentAiLandingPage.pageId);
      } else if (currentAiLandingPage?.id) {
        pageIds.push(currentAiLandingPage.id);
      } else if (currentAiLandingPage?.articleId) {
        pageIds.push(currentAiLandingPage.articleId);
      }

      // // Add blogs
      // if (currentBlogs) {
      //   currentBlogs.forEach((blog: any) => {
      //     if (blog.articleId) pageIds.push(blog.articleId);
      //   });
      // }

      // // Add AI blogs
      // if (currentAiBlog?.articleId) {
      //   pageIds.push(currentAiBlog.articleId);
      // } else if (currentAiBlog?.id) {
      //   pageIds.push(currentAiBlog.id);
      // } else if (currentAiBlog?.pageId) {
      //   pageIds.push(currentAiBlog.pageId);
      // }

      // Add email templates
      // if (currentEmailTemplates) {
      //   currentEmailTemplates.forEach((emailTemplate: any) => {
      //     if (emailTemplate._id) pageIds.push(emailTemplate._id);
      //   });
      // }

      // // Add created email template
      // if (currentCreatedEmailTemplate?._id) {
      //   pageIds.push(currentCreatedEmailTemplate._id);
      // }

      // Only make API call if we have page IDs
      if (pageIds.length > 0) {
        const payload = {
          refNum: selectedTenant.refNum,
          locale: locale,
          pageIds: pageIds
        };

        // Call all APIs in parallel using Promise.all
        const [publishStates, blogsPublishStates, emailTemplatesPublishStates] = await Promise.all([
          APIService.getPagePublishStates(payload),
          APIService.getAllBlogsDetails({
            refNum: selectedTenant.refNum,
            locale,
            siteVariant: "external",
            applyFilters: false,
          }),
          APIService.getAllEmailTemplates({
            recruiterUserId: window?.keycloakInstance?.tokenParsed?.userDetails.id,
            refNum: selectedTenant.refNum,
          })
        ]);

        publishStates.data.push(...blogsPublishStates.all);
        publishStates.data.push(...emailTemplatesPublishStates);
        setPagePublishStates(publishStates.data || []);

        // Create a map of pageId to publish state for easy lookup
        const publishStateMap = new Map();
        if (publishStates.data && Array.isArray(publishStates.data)) {
          publishStates.data.forEach((state: any) => {
            if(state.pageId){
              publishStateMap.set(state.pageId, {
                status: getContentStatus(state.status),
                createdDate: formatDate(state.timestamp)
              });
            }
            else if (state.articleId){
              publishStateMap.set(state.articleId, {
                status: state.type.toLowerCase() === "draft" ? "Draft" : "Published",
                createdDate: formatDate(state.updatedDate)
              });
            }
            else if (state._id){
              publishStateMap.set(state._id, {
                status: state.isDraft ? "Draft" : "Published",
                createdDate: formatDate(state.createdDate)
              });
            }
          });
        }

        // Update content pages with status and createdDate
        if (currentPages?.contentPages) {
          currentPages.contentPages.forEach((page: any) => {
            const pageId = page.pageId;
            if (pageId && publishStateMap.has(pageId)) {
              const state = publishStateMap.get(pageId);
              page.status = state.status;
              page.createdDate = state.createdDate;
            }
          });
        }

        // Update landing pages with status and createdDate
        if (currentPages?.landingPages) {
          currentPages.landingPages.forEach((page: any) => {
            const pageId = page.pageId;
            if (pageId && publishStateMap.has(pageId)) {
              const state = publishStateMap.get(pageId);
              page.status = state.status;
              page.createdDate = state.createdDate;
            }
          });
        }

        // Update AI content page with status and createdDate
        if (currentAiContentPage) {
          const pageId = currentAiContentPage.pageId || currentAiContentPage.id || currentAiContentPage.articleId;
          if (pageId && publishStateMap.has(pageId)) {
            const state = publishStateMap.get(pageId);
            currentAiContentPage.status = state.status;
            currentAiContentPage.createdDate = state.createdDate;
          }
        }

        // Update AI landing page with status and createdDate
        if (currentAiLandingPage) {
          const pageId = currentAiLandingPage.pageId || currentAiLandingPage.id || currentAiLandingPage.articleId;
          if (pageId && publishStateMap.has(pageId)) {
            const state = publishStateMap.get(pageId);
            currentAiLandingPage.status = state.status;
            currentAiLandingPage.createdDate = state.createdDate;
          }
        }

        // Update blogs with status and createdDate
        if (currentBlogs) {
          currentBlogs.forEach((blog: any) => {
            const pageId = blog.articleId;
            if (pageId && publishStateMap.has(pageId)) {
              const state = publishStateMap.get(pageId);
              blog.status = state.status;
              blog.createdDate = state.createdDate;
            }
          });
        }

        // Update AI blog with status and createdDate
        if (currentAiBlog) {
          const pageId = currentAiBlog.articleId || currentAiBlog.id || currentAiBlog.pageId;
          if (pageId && publishStateMap.has(pageId)) {
            const state = publishStateMap.get(pageId);
            currentAiBlog.status = state.status;
            currentAiBlog.createdDate = state.createdDate;
          }
        }

        // Update email templates with status and createdDate

        // Update created email template with status and createdDate
        if (currentCreatedEmailTemplate) {
          const pageId = currentCreatedEmailTemplate._id;
          if (pageId && publishStateMap.has(pageId)) {
            const state = publishStateMap.get(pageId);
            currentCreatedEmailTemplate.status = state.status;
            currentCreatedEmailTemplate.createdDate = state.createdDate;
          }
        }

          // Update the local variables that are used in the component
        pages = currentPages;
        blogs = currentBlogs;
        aiBlog = currentAiBlog;
        aiContentPage = currentAiContentPage;
        aiLandingPage = currentAiLandingPage;
        emailTemplates = currentEmailTemplates;
        createdEmailTemplate = currentCreatedEmailTemplate;
      }
    } catch (error) {
      console.error("Error fetching page publish states:", error);
      setIsLoading(false);
      setPagePublishStates([]);
    }
  };

  useEffect(() => {
    // setShowPromptSuggestions(true)
    APIService.getCRMUserInfo()
      .then((userInfo) => {
        if (userInfo?.userDetails?.id) {
          setCrmUserInfo(userInfo);
        } else {
          setCrmUserInfo(window?.keycloakInstance?.tokenParsed);
        }
      })
      .catch((err) => console.error("Error getting CRM user info", err));
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowContentSourceDropdown(false);
      }
    };

    if (showContentSourceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContentSourceDropdown]);

  return (
    <>
      {previewDiv ? (
        <PreviewView
          pageData={selectedPageData}
          onBack={handlePreviewClose}
          crmUserInfo={crmUserInfo}
          isCheckingTaskProgress={isCheckingTaskProgress}
          contentType={selectedContentType}
        />
      ) : (
        <div className="cluster-details-wrapper">
          <div className="cluster-details-header">
            <div className="cluster-details-back-btn" onClick={handleBackNavigation}>
              <img src={backIcon} alt="back" />
              <span>Back</span>
            </div>
          </div>
          <div className="cluster-details-container">
            <div className="cluster-details-title" title={(clusterName || "").replace(/"/g, "") || (clusterTitle || "").replace(/"/g, "")}>{(clusterName || "").replace(/"/g, "") || (clusterTitle || "").replace(/"/g, "")}</div>
            <div className="cluster-details-tabs">
              {tabs.map((tab: string, index: number) => {
                const count = index === 0 ? tabCounts.allCount :
                  index === 1 ? tabCounts.pagesCount :
                    index === 2 ? tabCounts.blogsCount :
                      tabCounts.emailTemplatesCount;

                return (
                  <button
                    key={tab}
                    className={`cluster-tab ${activeTab === index ? "cluster-tab-active" : ""}`}
                    onClick={() => setActiveTab(index)}
                  >
                    <span>{tab}</span>
                    {count > 0 && (
                      <span
                        className="cluster-tab-count"
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>


          </div>

          {isLoading && (
            <InlineLoader loadingMessage="Please wait, loading cluster details..." />
          )}

          {/* <div className="cluster-analytics">
        <ClusterAnalyticsCard title="Avg. Content Impressions" count={0} />
        <ClusterAnalyticsCard title="Content Interactions" count={0} />
        <ClusterAnalyticsCard title="Content Performance" count={0} />
      </div> */}
          {!isLoading && (() => {
            switch (activeTab) {
              case 0:
                return (
                  <div className="cluster-tab-data">
                    {/* Content Source Filter */}
                    <div className="cluster-details-filter-container">
                      <div className="cluster-details-filter-1">
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "draft" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("draft")}
                        >
                          Draft <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalDraftCount}</span>
                        </button>
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "published" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("published")}
                        >
                          Published <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalPublishedCount}</span>
                        </button>
                      </div>
                      <div className="cluster-details-filter">
                        <div className="filter-dropdown">
                          <button
                            className="filter-dropdown-button"
                            onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
                          >
                            <span className="filter-dropdown-button-text">{getSelectedOptionLabel()}</span>
                            <img
                              src={arrowUp}
                              alt="dropdown"
                              style={{
                                width: 16,
                                height: 16,
                                transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                          {showContentSourceDropdown && (
                            <div className="filter-dropdown-menu">
                              {contentSourceOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                                  onClick={() => handleContentSourceFilterChange(option.value)}
                                >
                                  {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                                  <span className="filter-dropdown-item-text">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* AI Generated Section - All AI content in one row */}
                    {hasAIContent() && (
                      <div className="cluster-tab-data-container ai-generated">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">AI Generated</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['aiGenerated'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('aiGenerated')}
                          />
                        </div>
                        {openSections['aiGenerated'] !== false && (
                          <div className="cluster-detail-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {aiContentPage && shouldShowByStatus(aiContentPage.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiContentPage={aiContentPage}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                            {aiBlog && shouldShowByStatus(aiBlog.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiBlog={aiBlog}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                            {aiLandingPage && shouldShowByStatus(aiLandingPage.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiLandingPage={aiLandingPage}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                            {createdEmailTemplate && shouldShowByStatus(createdEmailTemplate.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                createdEmailTemplate={createdEmailTemplate}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Content Pages */}
                    {hasContentPages() && (
                      <>
                        {pages.contentPages && (
                          <div className="cluster-tab-data-container">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p className="cluster-tab-data-subheading">Content Page</p>
                              <img
                                src={arrowUp}
                                alt="Toggle"
                                style={{
                                  width: 24,
                                  height: 24,
                                  transform: openSections['contentPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => toggleSection('contentPages')}
                              />
                            </div>
                            {openSections['contentPages'] === true && (
                              <div className="cluster-detail-card-container">
                                {pages.contentPages.map((page: any) => (
                                  shouldShowByStatus(page.status?.toLowerCase() || "published") && (
                                    <ClusterDetailCard
                                      contentPage={page}
                                      setPreviewDiv={handlePreviewOpen}
                                    />
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Regular Landing Pages */}
                    {hasLandingPages() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Landing Page</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['landingPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('landingPages')}
                          />
                        </div>
                        {openSections['landingPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.landingPages.map((page: any) => (
                              shouldShowByStatus(page.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  landingPage={page}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Blog Articles */}
                    {hasBlogs() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Blog Article</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['blogs'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('blogs')}
                          />
                        </div>
                        {openSections['blogs'] === true && (
                          <div className="cluster-detail-card-container">
                            {blogs.map((blog: any) => (
                              shouldShowByStatus(blog.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  blog={blog}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Email Templates */}
                    {hasEmailTemplates() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Email Template</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['emailTemplates'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('emailTemplates')}
                          />
                        </div>
                        {openSections['emailTemplates'] === true && (
                          <div className="cluster-detail-card-container">
                            {emailTemplates.map((emailTemplate: any) => (
                              shouldShowByStatus(emailTemplate.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  emailTemplate={emailTemplate}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(!hasAIContent() && !hasContentPages() && !hasLandingPages() && !hasBlogs() && !hasEmailTemplates()) && (
                      <div className="no-data-container">No Data</div>
                    )}
                  </div>
                );
              case 1:
                return (
                  <div className="cluster-tab-data">
                    {/* Content Source Filter */}
                    <div className="cluster-details-filter-container">
                      <div className="cluster-details-filter-1">
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "draft" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("draft")}
                        >
                          Draft <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalDraftCount}</span>
                        </button>
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "published" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("published")}
                        >
                          Published <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalPublishedCount}</span>
                        </button>
                      </div>
                      <div className="cluster-details-filter">
                        <div className="filter-dropdown">
                          <button
                            className="filter-dropdown-button"
                            onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
                          >
                            <span className="filter-dropdown-button-text">{getSelectedOptionLabel()}</span>
                            <img
                              src={arrowUp}
                              alt="dropdown"
                              style={{
                                width: 16,
                                height: 16,
                                transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                          {showContentSourceDropdown && (
                            <div className="filter-dropdown-menu">
                              {contentSourceOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                                  onClick={() => handleContentSourceFilterChange(option.value)}
                                >
                                  {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                                  <span className="filter-dropdown-item-text">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* AI Generated Pages Section */}
                    {hasAIPages() && (
                      <div className="cluster-tab-data-container ai-generated">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">AI Generated</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['aiContentPage'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('aiContentPage')}
                          />
                        </div>
                        {openSections['aiContentPage'] !== false && (
                          <div className="cluster-detail-card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {aiContentPage && shouldShowByStatus(aiContentPage.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiContentPage={aiContentPage}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                            {aiLandingPage && shouldShowByStatus(aiLandingPage.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiLandingPage={aiLandingPage}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Pages */}
                    {hasContentPages() && (
                      <>
                        {pages.contentPages && (
                          <div className="cluster-tab-data-container">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p className="cluster-tab-data-subheading">Content Page</p>
                              <img
                                src={arrowUp}
                                alt="Toggle"
                                style={{
                                  width: 24,
                                  height: 24,
                                  transform: openSections['contentPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => toggleSection('contentPages')}
                              />
                            </div>
                            {openSections['contentPages'] === true && (
                              <div className="cluster-detail-card-container">
                                {pages.contentPages.map((page: any) => (
                                  shouldShowByStatus(page.status?.toLowerCase() || "published") && (
                                    <ClusterDetailCard
                                      contentPage={page}
                                      setPreviewDiv={handlePreviewOpen}
                                    />
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Regular Landing Pages */}
                    {hasLandingPages() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Landing Page</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['landingPages'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('landingPages')}
                          />
                        </div>
                        {openSections['landingPages'] === true && (
                          <div className="cluster-detail-card-container">
                            {pages.landingPages.map((page: any) => (
                              shouldShowByStatus(page.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  landingPage={page}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(!hasContentPages() && !hasLandingPages()) && (
                      <div className="no-data-container">No Pages Data</div>
                    )}
                  </div>
                );
              case 2:
                return (
                  <div className="cluster-tab-data">
                    {/* Content Source Filter */}
                    <div className="cluster-details-filter-container">
                      <div className="cluster-details-filter-1">
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "draft" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("draft")}
                        >
                          Draft <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalDraftCount}</span>
                        </button>
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "published" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("published")}
                        >
                          Published <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalPublishedCount}</span>
                        </button>
                      </div>
                      <div className="cluster-details-filter">
                        <div className="filter-dropdown">
                          <button
                            className="filter-dropdown-button"
                            onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
                          >
                            <span className="filter-dropdown-button-text">{getSelectedOptionLabel()}</span>
                            <img
                              src={arrowUp}
                              alt="dropdown"
                              style={{
                                width: 16,
                                height: 16,
                                transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                          {showContentSourceDropdown && (
                            <div className="filter-dropdown-menu">
                              {contentSourceOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                                  onClick={() => handleContentSourceFilterChange(option.value)}
                                >
                                  {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                                  <span className="filter-dropdown-item-text">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* AI Generated Blogs Section */}
                    {hasAIBlogs() && (
                      <div className="cluster-tab-data-container ai-generated">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">AI Generated</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['aiBlog'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('aiBlog')}
                          />
                        </div>
                        {openSections['aiBlog'] !== false && (
                          <div className="cluster-detail-card-container">
                            {aiBlog && shouldShowByStatus(aiBlog.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                aiBlog={aiBlog}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Blog Articles */}
                    {hasBlogs() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Blog Article</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['blogs'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('blogs')}
                          />
                        </div>
                        {openSections['blogs'] === true && (
                          <div className="cluster-detail-card-container">
                            {blogs.map((blog: any) => (
                              shouldShowByStatus(blog.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  blog={blog}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(!hasAIBlogs() && !hasBlogs()) && (
                      <div className="no-data-container">No Blogs Data</div>
                    )}
                  </div>
                );
              case 3:
                return (
                  <div className="cluster-tab-data">
                    {/* Content Source Filter */}
                    <div className="cluster-details-filter-container">
                      <div className="cluster-details-filter-1">
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "draft" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("draft")}
                        >
                          Draft <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalDraftCount}</span>
                        </button>
                        <button
                          className={`cluster-details-filter-status-btn ${statusFilter === "published" ? "active" : ""}`}
                          onClick={() => handleStatusFilterChange("published")}
                        >
                          Published <span className="cluster-details-filter-status-btn-count">{tabSpecificCounts.totalPublishedCount}</span>
                        </button>
                      </div>
                      <div className="cluster-details-filter">
                        <div className="filter-dropdown">
                          <button
                            className="filter-dropdown-button"
                            onClick={() => setShowContentSourceDropdown(!showContentSourceDropdown)}
                          >
                            <span className="filter-dropdown-button-text">{getSelectedOptionLabel()}</span>
                            <img
                              src={arrowUp}
                              alt="dropdown"
                              style={{
                                width: 16,
                                height: 16,
                                transform: showContentSourceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                          {showContentSourceDropdown && (
                            <div className="filter-dropdown-menu">
                              {contentSourceOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className={`filter-dropdown-item ${contentSourceFilter === option.value ? 'active' : ''}`}
                                  onClick={() => handleContentSourceFilterChange(option.value)}
                                >
                                  {option.icon && <img src={option.icon} alt={option.label} style={{ width: 16, height: 16, marginRight: 8 }} />}
                                  <span className="filter-dropdown-item-text">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* AI Generated Email Templates Section */}
                    {hasAIEmailTemplates() && (
                      <div className="cluster-tab-data-container ai-generated">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">AI Generated</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['createdEmailTemplate'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('createdEmailTemplate')}
                          />
                        </div>
                        {openSections['createdEmailTemplate'] !== false && (
                          <div className="cluster-detail-card-container">
                            {createdEmailTemplate && shouldShowByStatus(createdEmailTemplate.status?.toLowerCase() || "published") && (
                              <ClusterDetailCard
                                createdEmailTemplate={createdEmailTemplate}
                                setPreviewDiv={handlePreviewOpen}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Email Templates */}
                    {hasEmailTemplates() && (
                      <div className="cluster-tab-data-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p className="cluster-tab-data-subheading">Email Template</p>
                          <img
                            src={arrowUp}
                            alt="Toggle"
                            style={{
                              width: 24,
                              height: 24,
                              transform: openSections['emailTemplates'] === true ? 'rotate(0deg)' : 'rotate(180deg)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => toggleSection('emailTemplates')}
                          />
                        </div>
                        {openSections['emailTemplates'] === true && (
                          <div className="cluster-detail-card-container">
                            {emailTemplates.map((emailTemplate: any) => (
                              shouldShowByStatus(emailTemplate.status?.toLowerCase() || "published") && (
                                <ClusterDetailCard
                                  emailTemplate={emailTemplate}
                                  setPreviewDiv={handlePreviewOpen}
                                />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(!hasAIEmailTemplates() && !hasEmailTemplates()) && (
                      <div className="no-data-container">No Email Templates Data</div>
                    )}
                  </div>
                );
              default:
                return <div className="cluster-tab-data">All</div>;
            }
          })()}
        </div>
      )}
    </>
  );
};

export default ClusterDetails;
