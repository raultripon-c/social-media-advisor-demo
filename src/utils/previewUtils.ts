import { APIService } from "./api.service";

export interface TaskProgressPayload {
  refNum: string;
  type: string;
  pageId: string;
}

export interface TaskProgressResponse {
  status: string;
  data?: {
    progress?: number;
    status?: string;
    taskInfo?: {
      url?: string;
    };
    message?: string;
  };
  errorMsg?: string;
}

export class PreviewTaskManager {
  private progressIntervalRef: NodeJS.Timeout | null = null;
  private readonly timeoutDuration = 5 * 60 * 1000; // 5 minutes
  private readonly pollInterval = 3000; // 3 seconds

  constructor() {}

  /**
   * Check task progress for a page, first checking AI page creation then publish page progress
   */
  async handleTaskProgressAndUpdateUrl(
    pageData: any,
    selectedTenant: any,
    onProgressUpdate?: (pageData: any) => void
  ): Promise<void> {
    // Clear any existing interval
    this.clearProgressInterval();

    try {
      // First, check AI page creation progress
      console.log('=== Starting AI Page Creation Progress Check ===');
      await this.checkTaskProgress(
        pageData,
        selectedTenant,
        "aiPageCreation",
        "AI page creation"
      );
      
      // Add a small delay to ensure AI page creation is fully processed
      console.log('Waiting 2 seconds for AI page creation to be fully processed...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then check publish page progress
      console.log('=== Starting Publish Page Progress Check ===');
      await this.checkTaskProgress(
        pageData,
        selectedTenant,
        "publishPage",
        "Publish page",
        onProgressUpdate
      );
    } catch (error) {
      console.error('Error in task progress check:', error);
      // Even if there's an error, resolve to allow preview to open
    }
  }

  /**
   * Generic method to check task progress for any task type
   */
  private async checkTaskProgress(
    pageData: any,
    selectedTenant: any,
    taskType: string,
    taskName: string,
    onProgressUpdate?: (pageData: any) => void
  ): Promise<void> {
    const payload: TaskProgressPayload = {
      refNum: selectedTenant.refNum,
      type: taskType,
      pageId: pageData.id || pageData.pageId
    };

    console.log(`Starting ${taskName.toLowerCase()} progress check for page:`, pageData.id || pageData.pageId);

    // First, check if task exists
    try {
      const initialResponse = await APIService.getTaskProgress(payload);
      const initialData: TaskProgressResponse = initialResponse.data;
      
      if (initialData.status === "failed" && initialData.errorMsg?.includes("No task is running")) {
        console.log(`No ${taskName.toLowerCase()} task is running, may already be completed or not ready`);
        return;
      }
    } catch (error) {
      console.error(`Error checking initial ${taskName.toLowerCase()} status:`, error);
      return;
    }

    // Poll for task completion
    await this.pollForTaskCompletion(payload, taskName, pageData, onProgressUpdate);
  }

  /**
   * Generic method to poll for task completion
   */
  private pollForTaskCompletion(
    payload: TaskProgressPayload,
    taskName: string,
    pageData?: any,
    onProgressUpdate?: (pageData: any) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let pollCount = 0;

      const progressHandler = setInterval(async () => {
        try {
          pollCount++;
          const elapsedTime = Date.now() - startTime;
          
          if (elapsedTime >= this.timeoutDuration) {
            console.log(`${taskName} progress check timed out after 5 minutes`);
            clearInterval(progressHandler);
            resolve();
            return;
          }

          const response = await APIService.getTaskProgress(payload);
          const data: TaskProgressResponse = response.data;
          
          console.log(`${taskName} progress response:`, data, 'Poll count:', pollCount);
          
          if (data.status === "success") {
            const progress = data.data?.progress || 0;
            const taskStatus = data.data?.status || data.status;
            
            console.log(`${taskName} progress:`, progress, 'Status:', taskStatus);
            
            if (taskStatus === "success" && progress === 100) {
              console.log(`${taskName} completed successfully`);
              clearInterval(progressHandler);
              
              // Update the preview URL if available (only for publish page)
              if (taskName === "Publish page" && data.data?.taskInfo?.url && pageData && onProgressUpdate) {
                console.log('Updating preview URL to:', data.data.taskInfo.url);
                pageData.previewUrl = data.data.taskInfo.url;
                onProgressUpdate({ ...pageData });
              }
              resolve();
            } else if (taskStatus === "failed") {
              console.log(`${taskName} failed`);
              clearInterval(progressHandler);
              resolve();
            } else if (taskStatus === "in_progress" || taskStatus === "pending" || taskStatus === "inprogress") {
              console.log(`${taskName} still in progress, continuing to poll...`);
            } else {
              console.log(`${taskName} status unknown, stopping poll`);
              clearInterval(progressHandler);
              resolve();
            }
          } else {
            clearInterval(progressHandler);
            console.error(`${taskName} progress check failed:`, data.errorMsg);
            resolve();
          }
        } catch (error) {
          clearInterval(progressHandler);
          console.error(`Error checking ${taskName.toLowerCase()} progress:`, error);
          resolve();
        }
      }, this.pollInterval);
    });
  }

  /**
   * Clear the progress interval
   */
  clearProgressInterval(): void {
    if (this.progressIntervalRef) {
      clearInterval(this.progressIntervalRef);
      this.progressIntervalRef = null;
    }
  }

  /**
   * Cleanup method to be called when component unmounts
   */
  cleanup(): void {
    this.clearProgressInterval();
  }
}

// Export a singleton instance for easy use
export const previewTaskManager = new PreviewTaskManager(); 