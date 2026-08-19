import { demoSharePacks } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

const STORAGE_KEY = "campaign-studio-share-packs";

export const loadSharePacks = (): SharePack[] => {
  if (typeof window === "undefined") return [...demoSharePacks];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [...demoSharePacks];
    const parsed = JSON.parse(raw) as SharePack[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...demoSharePacks];
  } catch {
    return [...demoSharePacks];
  }
};

export const saveSharePacks = (packs: SharePack[]) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
};

export const getSharePackById = (packId: string): SharePack | undefined =>
  loadSharePacks().find((pack) => pack.id === packId);

export const updateSharePack = (packId: string, updater: (pack: SharePack) => SharePack): SharePack | undefined => {
  const packs = loadSharePacks();
  const index = packs.findIndex((pack) => pack.id === packId);
  if (index === -1) return undefined;
  const next = [...packs];
  next[index] = updater(next[index]);
  saveSharePacks(next);
  return next[index];
};
