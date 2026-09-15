import React from "react";
import { createPortal } from "react-dom";

import "../CampaignStudio.css";
import {
  AdvocacyDemoView,
  useAdvocacyDemoView,
} from "./useAdvocacyDemoView";
import "./AdvocacyDemoViewSwitcher.css";

const OPTIONS: Array<{ id: AdvocacyDemoView; label: string }> = [
  { id: "admin", label: "Admin" },
  { id: "employee", label: "Employee" },
];

export const AdvocacyDemoViewSwitcher: React.FC = () => {
  const { view, switchView, showSwitcher } = useAdvocacyDemoView();

  if (!showSwitcher || typeof document === "undefined") return null;

  return createPortal(
    <div className="advocacy-demo-view-switcher-overlay">
      <div
        className="advocacy-demo-view-switcher cs-switch-button"
        role="tablist"
        aria-label="Social Media Advisor experience"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={view === option.id}
            className={view === option.id ? "is-active" : ""}
            onClick={() => switchView(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
};
