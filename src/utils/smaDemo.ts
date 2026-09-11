export const isSmaDemoOnly = process.env.SMA_DEMO_ONLY === "true";

export const isCampaignStudioPreviewPath = (pathname: string) =>
  isSmaDemoOnly || pathname.includes("/campaign-studio/");
