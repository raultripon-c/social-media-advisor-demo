import React from "react";

import { rebrandTenantName } from "../demoBrand";
import "./SmaDemoAppHeader.css";

type SmaDemoAppHeaderProps = {
  tenantName?: string;
};

export const SmaDemoAppHeader: React.FC<SmaDemoAppHeaderProps> = ({
  tenantName = "One Health",
}) => (
  <header className="sma-demo-app-header" aria-label="Application header">
    <div className="sma-demo-app-header__left">
      <p className="sma-demo-app-header__tenant">
        {rebrandTenantName(tenantName)}
      </p>
    </div>
  </header>
);
