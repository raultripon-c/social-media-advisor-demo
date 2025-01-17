// TrackerContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import Tracker from "@openreplay/tracker";

// Create TrackerContext
const TrackerContext = createContext<Tracker | null>(null);

// Custom hook to use the tracker instance
export const useTracker = () => {
  const tracker = useContext(TrackerContext);
  if (!tracker) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return tracker;
};
interface TrackerProviderProps {
  children: any;
}

// TrackerProvider to provide the tracker instance
export const TrackerProvider: React.FC<TrackerProviderProps> = ({ children }) => {
  const [tracker, setTracker] = useState<Tracker | null>(null);

  const sessionTrackerProjectKey = `${(window as any)._env_.SESSION_TRACKER_PROJECT_KEY || ""}`;
  const sessionTrackerIngestPoint = `${(window as any)._env_.SESSION_TRACKER_INGEST_POINT || ""}`;
  const userId = window?.keycloakInstance?.tokenParsed?.userDetails?.userName;

  useEffect(() => {
    const newTracker = new Tracker({
      projectKey: sessionTrackerProjectKey,
      ingestPoint: sessionTrackerIngestPoint,
      network: {
        capturePayload: true,
        sessionTokenHeader: "",
        failuresOnly: false,
        ignoreHeaders: false,
        captureInIframes: false,
      },
    });
    newTracker.setUserID(userId);
    newTracker.setMetadata("user-org", window?.orgInfo?.code);
    newTracker.setMetadata("user-type", window?.orgInfo?.type);
    newTracker.setMetadata("environment", (window as any)?._env_.APP_ENV);
    let entitlements = window.keycloakInstance?.tokenParsed?.entitlements;
    newTracker.setMetadata("user-entitlement", entitlements && entitlements.length > 0 ? entitlements[0] : "");
    newTracker.start();
    newTracker.event("App Loaded", "successfully");
    setTracker(newTracker);
    (window as any).__OPENREPLAY__ = newTracker;

    return () => {
      newTracker.stop();
    };
  }, [userId, sessionTrackerProjectKey, sessionTrackerIngestPoint]);

  return <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>;
};
