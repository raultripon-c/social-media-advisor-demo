export const isSmaDemoOnly = process.env.SMA_DEMO_ONLY === "true";

export const isCampaignStudioPreviewPath = (pathname: string) =>
  isSmaDemoOnly || /\/campaign-studio/i.test(pathname);

/** Show Admin/Employee demo switcher on SMA builds and Campaign Studio routes. */
export const isAdvocacyDemoSwitcherRoute = (pathname: string) =>
  isCampaignStudioPreviewPath(pathname);
