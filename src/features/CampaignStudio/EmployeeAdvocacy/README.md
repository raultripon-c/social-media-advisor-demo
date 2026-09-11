# Employee advocacy workspace

The workspace is the employee-facing manual-sharing experience. Local Campaign
Studio preview routes render it directly; the tenant route
`/:customerCode/:refnum/campaign-studio/employee-advocacy` renders it through
the normal authenticated shell.

## Product boundary

- Employees can download approved assets, copy approved text, and copy tracked
  destination links without connecting a personal social account.
- `Mark as shared` is explicitly self-reported. The workspace never treats it
  as proof of an external publication.
- Campaign results are supplied only for campaigns in which the current
  employee is assigned or has participated.
- Suggestions always begin in `pending` status and do not become shareable
  until an administrator publishes and assigns approved content.
- Employee segments and tags are read-only eligibility metadata.

## Data boundary

`employeeAdvocacyAdapter` is the demo implementation of the workspace data
contract. It persists local interactions under
`txe.employee-advocacy.workspace.v1`. Replace the adapter methods with
permission-filtered APIs while preserving the `WorkspaceData` contract.

The UI handles loading, top-level error, empty collections, delayed metrics,
unavailable metrics, pending approval, changes requested, expired, withdrawn,
and action confirmation states.

## Product analytics

`trackAdvocacyEvent` emits a `txeEmployeeAdvocacyEvent` browser event and
forwards to the available OpenReplay and Phenom trackers. Every event includes
`externalPublicationVerified: false`.

Events emitted:

- `workspace_opened`
- `sharepack_viewed`
- `asset_downloaded`
- `caption_copied`
- `utm_link_copied`
- `sharepack_marked_shared`
- `leaderboard_opened`
- `campaign_analytics_opened`
- `campaign_filter_changed`
- `reporting_period_changed`
- `suggestion_started`
- `suggestion_submitted`
- `suggestion_submission_failed`

These events measure adoption and workflow completion only. They must not be
used as external publication verification.
