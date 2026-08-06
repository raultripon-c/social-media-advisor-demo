import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { getCampaignStudioPaths } from "../../features/CampaignStudio/ContentBoard/CampaignStudioSubNav";

/** Legacy /amplify URLs redirect to Employee Advocacy. */
const CampaignStudioAmplifyRedirect: React.FC = () => {
  const { customerCode, refnum } = useParams();
  return <Navigate to={getCampaignStudioPaths(customerCode, refnum).employeeAdvocacy} replace />;
};

export default CampaignStudioAmplifyRedirect;
