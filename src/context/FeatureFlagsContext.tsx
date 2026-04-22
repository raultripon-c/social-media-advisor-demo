import React, { createContext, useContext } from "react";

export type FeatureFlags = {
  autoGenerateCandidateJourneysOnSidebarNav: boolean;
};

const defaultFlags: FeatureFlags = {
  autoGenerateCandidateJourneysOnSidebarNav: true,
};

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagsProvider: React.FC<{
  value: FeatureFlags;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
);

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}

/** Location state passed when navigating to Candidate Journeys with auto-generate intent */
export type CandidateJourneysNavState = {
  autoGenerateCandidateJourneys?: boolean;
};
