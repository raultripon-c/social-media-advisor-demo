import { SharePack } from "../Amplify/amplifyTypes";
import {
  loadEmployeeWorkspaceSync,
  saveEmployeeWorkspaceSync,
} from "../EmployeeAdvocacy/employeeAdvocacyData";
import { PostSuggestion, Sharepack } from "../EmployeeAdvocacy/types";

export const ADVOCACY_BRIDGE_EVENT = "txeAdvocacyBridgeUpdate";
const UNREAD_STORIES_KEY = "txe.advocacy-demo.unread-story-ids";

const inferTopic = (pack: SharePack): string => {
  const haystack = `${pack.title} ${pack.subtitle} ${pack.sourceLabel}`.toLowerCase();
  if (haystack.includes("nurs")) return "Employee stories";
  if (haystack.includes("engineer") || haystack.includes("hiring") || haystack.includes("role")) {
    return "Hiring";
  }
  if (haystack.includes("benefit") || haystack.includes("culture")) return "Culture";
  if (haystack.includes("event")) return "Events";
  return "Campaigns";
};

const buildUtmUrl = (destination: string, campaign: string) => {
  try {
    const url = new URL(destination);
    url.searchParams.set("utm_source", "employee_advocacy");
    url.searchParams.set("utm_medium", "social");
    url.searchParams.set("utm_campaign", campaign);
    url.searchParams.set("utm_content", "employee-1024");
    return url.toString();
  } catch {
    return destination;
  }
};

export const mapAdminPackToEmployeeStory = (
  pack: SharePack,
  storyId: string,
): Sharepack => {
  const asset = pack.assets?.[0];
  const caption =
    pack.captions.find((item) => item.text.trim())?.text ||
    pack.employeeNote ||
    pack.subtitle ||
    pack.title;
  const assignedAt = pack.sentAt || pack.createdAt;
  const expiresAt = new Date(assignedAt);
  expiresAt.setDate(expiresAt.getDate() + 30);

  return {
    id: storyId,
    title: pack.title,
    campaignName: pack.sourceLabel || pack.audienceLabel || "Employee Advocacy",
    description: pack.subtitle || pack.employeeNote || pack.title,
    caption,
    destinationLabel: pack.ctaLabel || "Learn more",
    destinationUrl: pack.ctaDestination,
    utmUrl: buildUtmUrl(pack.ctaDestination, pack.id),
    assignedAt,
    expiresAt: expiresAt.toISOString(),
    status: "new",
    image: pack.thumbnailUrl,
    assetName: asset?.label || "sharepack.jpg",
    assetType: asset?.kind === "video" ? "MP4" : "JPG · 1600 × 900",
    topic: inferTopic(pack),
    shareCount: 0,
    platforms: ["linkedin", "facebook"],
  };
};

export const dispatchAdvocacyBridgeUpdate = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADVOCACY_BRIDGE_EVENT));
};

const readUnreadStoryIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(UNREAD_STORIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const writeUnreadStoryIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(UNREAD_STORIES_KEY, JSON.stringify(ids));
};

export const getUnreadEmployeeStoryCount = (): number => readUnreadStoryIds().length;

export const clearUnreadEmployeeStories = () => {
  writeUnreadStoryIds([]);
  dispatchAdvocacyBridgeUpdate();
};

const markStoryUnread = (storyId: string) => {
  const ids = readUnreadStoryIds();
  if (!ids.includes(storyId)) {
    writeUnreadStoryIds([storyId, ...ids]);
  }
};

export const assignAdminSharePackToEmployeeWorkspace = (pack: SharePack) => {
  if (pack.status !== "sent") return;

  const workspace = loadEmployeeWorkspaceSync();
  const storyId = `employee-${pack.id}`;
  const story = mapAdminPackToEmployeeStory(pack, storyId);
  const existingIndex = workspace.sharepacks.findIndex((item) => item.id === storyId);

  const nextSharepacks = [...workspace.sharepacks];
  if (existingIndex >= 0) {
    nextSharepacks[existingIndex] = story;
    nextSharepacks.unshift(nextSharepacks.splice(existingIndex, 1)[0]);
  } else {
    nextSharepacks.unshift(story);
  }

  saveEmployeeWorkspaceSync({
    ...workspace,
    sharepacks: nextSharepacks,
  });
  markStoryUnread(storyId);
  dispatchAdvocacyBridgeUpdate();
};

export const getPendingSuggestionCount = (): number =>
  loadEmployeeWorkspaceSync().suggestions.filter(
    (suggestion) => suggestion.status === "pending",
  ).length;

export const listPendingSuggestions = (): PostSuggestion[] =>
  loadEmployeeWorkspaceSync()
    .suggestions.filter((suggestion) => suggestion.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );

export const approveEmployeeSuggestion = (suggestionId: string) => {
  const workspace = loadEmployeeWorkspaceSync();
  saveEmployeeWorkspaceSync({
    ...workspace,
    suggestions: workspace.suggestions.map((suggestion) =>
      suggestion.id === suggestionId
        ? {
            ...suggestion,
            status: "approved",
            feedback: "Approved by administrator.",
          }
        : suggestion,
    ),
  });
  dispatchAdvocacyBridgeUpdate();
};

export const getEmployeeSuggestionById = (
  suggestionId: string,
): PostSuggestion | undefined =>
  loadEmployeeWorkspaceSync().suggestions.find(
    (suggestion) => suggestion.id === suggestionId,
  );
