import React from "react";

import { EmployeeAdvocacyWorkspace } from "../EmployeeAdvocacy/EmployeeAdvocacyWorkspace";
import { useAdvocacyDemoView } from "./useAdvocacyDemoView";

/** Renders full-screen employee workspace (no admin chrome). Use at Layout level. */
export const CampaignStudioEmployeeFullscreen: React.FC = () => {
  return <EmployeeAdvocacyWorkspace />;
};

/** @deprecated Use Layout-level fullscreen + useAdvocacyDemoView instead */
export const CampaignStudioAdvocacyDemoGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showEmployeeWorkspace } = useAdvocacyDemoView();

  if (showEmployeeWorkspace) {
    return <EmployeeAdvocacyWorkspace />;
  }

  return <>{children}</>;
};
