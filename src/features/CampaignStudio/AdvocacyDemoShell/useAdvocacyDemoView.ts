import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "txe.advocacy-demo-view";

export type AdvocacyDemoView = "employee" | "admin";

function readStoredView(): AdvocacyDemoView {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === "admin" || stored === "employee") return stored;
  return "admin";
}

export function useAdvocacyDemoView() {
  const location = useLocation();
  const isCampaignStudio = location.pathname.includes("/campaign-studio/");
  const [view, setView] = useState<AdvocacyDemoView>(readStoredView);

  const switchView = useCallback((next: AdvocacyDemoView) => {
    setView(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return;

      if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        switchView("admin");
      }

      if (event.key === "e" || event.key === "E") {
        event.preventDefault();
        switchView("employee");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [switchView]);

  const showEmployeeWorkspace = isCampaignStudio && view === "employee";

  return {
    view,
    isCampaignStudio,
    showEmployeeWorkspace,
    switchView,
  };
}
