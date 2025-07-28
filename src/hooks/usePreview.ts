import { useState, useCallback } from 'react';
import { previewTaskManager } from '../utils/previewUtils';

interface UsePreviewReturn {
  previewDiv: boolean;
  selectedPageData: any;
  isCheckingTaskProgress: boolean;
  handlePreviewOpen: (pageDataOrObject: any, pageType?: string) => Promise<void>;
  handlePreviewClose: () => void;
  setIsCheckingTaskProgress: (loading: boolean) => void;
  setPreviewDiv: (previewDiv: boolean) => void;
  setSelectedPageData: (selectedPageData: any) => void;
}

export const usePreview = (): UsePreviewReturn => {
  const [previewDiv, setPreviewDiv] = useState(false);
  const [selectedPageData, setSelectedPageData] = useState<any>(null);
  const [isCheckingTaskProgress, setIsCheckingTaskProgress] = useState(false);

  const handlePreviewOpen = useCallback(async (pageDataOrObject: any, pageType?: string) => {
    // Handle the new parameter structure from ClusterDetailCard
    let pageData, finalPageType;
    if (pageDataOrObject && typeof pageDataOrObject === 'object' && pageDataOrObject.pageData) {
      pageData = pageDataOrObject.pageData;
      finalPageType = pageDataOrObject.pageType;
    } else {
      pageData = pageDataOrObject;
      finalPageType = pageType;
    }

    if (
      finalPageType &&
      (
        finalPageType === 'Content Page' ||
        finalPageType === 'Landing Page'
      )
    ) {
      // Show loading state while checking task progress
      setIsCheckingTaskProgress(true);
      try {
        const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
        
        // Handle task progress for content pages and landing pages
        // Wait for the task progress to complete before opening preview
        await previewTaskManager.handleTaskProgressAndUpdateUrl(
          pageData,
          selectedTenant,
          (updatedPageData) => {
            setSelectedPageData(updatedPageData);
          }
        );
      } catch (error) {
        console.error('Error during task progress check:', error);
      } finally {
        setIsCheckingTaskProgress(false);
      }
    }
    
    setSelectedPageData(pageData);
    setPreviewDiv(true);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewDiv(false);
    setSelectedPageData(null);
    previewTaskManager.cleanup();
  }, []);

  return {
    previewDiv,
    selectedPageData,
    isCheckingTaskProgress,
    handlePreviewOpen,
    handlePreviewClose,
    setIsCheckingTaskProgress,
    setPreviewDiv,
    setSelectedPageData,
  };
}; 