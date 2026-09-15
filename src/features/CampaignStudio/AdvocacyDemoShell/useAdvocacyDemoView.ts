import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { isAdvocacyDemoSwitcherRoute } from "../../../utils/smaDemo";

const STORAGE_KEY = "txe.advocacy-demo-view";
export const ADVOCACY_DEMO_VIEW_EVENT = "txeAdvocacyDemoViewChange";

export type AdvocacyDemoView = "employee" | "admin";

function readStoredView(): AdvocacyDemoView {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === "admin" || stored === "employee") return stored;
  return "admin";
}

export function useAdvocacyDemoView() {
  const location = useLocation();
  const isCampaignStudio = /\/campaign-studio/i.test(location.pathname);
  const [view, setView] = useState<AdvocacyDemoView>(readStoredView);

  const switchView = useCallback((next: AdvocacyDemoView) => {
    setView(next);
    sessionStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(
      new CustomEvent(ADVOCACY_DEMO_VIEW_EVENT, { detail: next }),
    );
  }, []);

  useEffect(() => {
    const onViewChange = (event: Event) => {
      const detail = (event as CustomEvent<AdvocacyDemoView>).detail;
      if (detail === "admin" || detail === "employee") {
        setView(detail);
      }
    };

    window.addEventListener(ADVOCACY_DEMO_VIEW_EVENT, onViewChange);
    return () => window.removeEventListener(ADVOCACY_DEMO_VIEW_EVENT, onViewChange);
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

  const isAdvocacyDemoRoute = isAdvocacyDemoSwitcherRoute(location.pathname);
  const showEmployeeWorkspace = isAdvocacyDemoRoute && view === "employee";
  const showSwitcher = isAdvocacyDemoRoute;

  return {
    view,
    isCampaignStudio,
    showEmployeeWorkspace,
    showSwitcher,
    switchView,
  };
}
