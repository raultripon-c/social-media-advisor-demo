# Campaign Studio

Local Campaign Studio feature module for the TXE shell.

## Entry Points

- `CampaignStudioList`
- `CampaignStudioCreate`
- `CampaignStudioDashboard`
- `CampaignStudioWorkspace`

## Data Boundary

The UI talks to `CampaignStudioAdapter` from `types.ts`. The current implementation in
`campaignStudioData.ts` uses localStorage demo data and can be replaced by real API calls
without changing route wrappers.

## Routes

- `/:customerCode/:refnum/campaign-studio/campaigns`
- `/:customerCode/:refnum/campaign-studio/campaigns/new`
- `/:customerCode/:refnum/campaign-studio/campaigns/workspace/:campaignWorkspaceId`
- `/:customerCode/:refnum/campaign-studio/campaigns/:campaignId/dashboard`
