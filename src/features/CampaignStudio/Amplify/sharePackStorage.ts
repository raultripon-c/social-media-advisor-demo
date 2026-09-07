import { demoSharePacks, demoVideoRequests, withDemoVideoSubmissions } from "./amplifyData";
import { SharePack, VideoSubmission } from "./amplifyTypes";

const STORAGE_KEY = "campaign-studio-share-packs";

const hydrateVideoRequest = (pack: SharePack) => (pack.videoRequest ? withDemoVideoSubmissions(pack) : pack);

const withDemoVideoRequests = (packs: SharePack[]) => {
  const missing = demoVideoRequests.filter((demo) => !packs.some((pack) => pack.id === demo.id));
  const merged = missing.length ? [...missing, ...packs] : packs;
  return merged.map(hydrateVideoRequest);
};

export const loadSharePacks = (): SharePack[] => {
  if (typeof window === "undefined") return withDemoVideoRequests([...demoSharePacks]);
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return withDemoVideoRequests([...demoSharePacks]);
    const parsed = JSON.parse(raw) as SharePack[];
    const packs = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...demoSharePacks];
    return withDemoVideoRequests(packs);
  } catch {
    return withDemoVideoRequests([...demoSharePacks]);
  }
};

export const saveSharePacks = (packs: SharePack[]) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
};

export const getSharePackById = (packId: string): SharePack | undefined => {
  const pack = loadSharePacks().find((item) => item.id === packId);
  return pack ? hydrateVideoRequest(pack) : undefined;
};

export const updateSharePack = (packId: string, updater: (pack: SharePack) => SharePack): SharePack | undefined => {
  const packs = loadSharePacks();
  const index = packs.findIndex((pack) => pack.id === packId);
  if (index === -1) return undefined;
  const next = [...packs];
  next[index] = updater(next[index]);
  saveSharePacks(next);
  return hydrateVideoRequest(next[index]);
};

export const updateVideoSubmission = (
  packId: string,
  submissionId: string,
  updater: (submission: VideoSubmission) => VideoSubmission,
): SharePack | undefined =>
  updateSharePack(packId, (pack) => ({
    ...pack,
    submissions: (pack.submissions || []).map((submission) =>
      submission.id === submissionId ? updater(submission) : submission,
    ),
  }));

export const deleteVideoSubmission = (packId: string, submissionId: string): SharePack | undefined =>
  updateSharePack(packId, (pack) => ({
    ...pack,
    submissions: (pack.submissions || []).filter((submission) => submission.id !== submissionId),
  }));
