/**
 * Pholly (pholly-web-sdk) runtime config from window._env_ and Keycloak.
 * Aligns environment codes with Phenom collector routing.
 */

export type PhollyEnvRecord = Record<string, string | undefined>;

const DEFAULT_TRACE_PROPAGATION = [
  /^https:\/\/([a-z0-9-]+\.)?(phenom|phenompro|phenompeople)\.com(?:\/.*)?$/i,
];

function trimStr(s: string): string {
  return s.replace(/^\s+|\s+$/g, "");
}

function parseJsonPatterns(raw: string | undefined): RegExp[] | null {
  if (!raw || !trimStr(raw)) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((s) => new RegExp(s));
  } catch {
    return null;
  }
}

function parseIgnoreUrls(raw: string | undefined): (string | RegExp)[] | undefined {
  if (!raw || !trimStr(raw)) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter(
      (x): x is string | RegExp =>
        typeof x === "string" || x instanceof RegExp
    ) as (string | RegExp)[];
  } catch {
    return undefined;
  }
}

/**
 * Map deployment env strings to Pholly collector environment codes.
 */
export function resolvePhollyEnvironment(env: PhollyEnvRecord): string {
  const explicit =
    env.REACT_APP_PHOLLY_ENVIRONMENT ||
    env.PHOLLY_ENVIRONMENT ||
    env.REACT_APP_ENVIRONMENT;
  if (explicit && trimStr(explicit)) {
    return normalizeEnvCode(trimStr(explicit));
  }
  const coarse = env.APP_ENV || env.REACT_APP_ENV;
  if (coarse && trimStr(coarse)) {
    const mapped = mapCoarseEnv(trimStr(coarse));
    if (mapped) return mapped;
  }
  return "INTQA";
}

function normalizeEnvCode(raw: string): string {
  const compact = raw.toUpperCase().replace(/[-\s]/g, "");
  const aliases: Record<string, string> = {
    INTQA: "INTQA",
    INTDEV: "INTDEV",
    STG: "STG",
    STGCA: "STGCA",
    STGIR: "STGIR",
    STGIN: "STGIN",
    PROD: "PROD",
    PRODCA: "PRODCA",
    PRODIR: "PRODIR",
    PRODIN: "PRODIN",
    PRODCR: "PRODCR",
  };
  if (aliases[compact]) return aliases[compact];
  return compact || "INTQA";
}

function mapCoarseEnv(raw: string): string | null {
  const v = raw.toLowerCase();
  if (v.includes("intqa") || v === "qa") return "INTQA";
  if (v.includes("intdev") || v === "dev") return "INTDEV";
  if (v.includes("stg") || v.includes("staging")) {
    if (v.includes("ca")) return "STGCA";
    if (v.includes("ir")) return "STGIR";
    if (v.includes("in") || v.includes("mb")) return "STGIN";
    return "STG";
  }
  if (v.includes("prod") || v === "production") {
    if (v.includes("ca")) return "PRODCA";
    if (v.includes("ir")) return "PRODIR";
    if (v.includes("in") || v.includes("mb")) return "PRODIN";
    if (v.includes("cr")) return "PRODCR";
    return "PROD";
  }
  return null;
}

export function getPhollyTracePropagationTargets(env: PhollyEnvRecord): (string | RegExp)[] {
  const fromEnv = parseJsonPatterns(env.REACT_APP_PHOLLY_TRACE_PROPAGATION_PATTERNS);
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return [...DEFAULT_TRACE_PROPAGATION];
}

export function getPhollyMultiRegionEnabled(env: PhollyEnvRecord): boolean {
  const v = env.REACT_APP_PHOLLY_MULTI_REGION;
  if (!v) return false;
  return String(v).toLowerCase() === "true";
}

export function resolveRefNumForPholly(
  sessionRefNum: string | undefined,
  tenantRefNum: string | undefined,
  pathRefNum: string | undefined
): string | undefined {
  return sessionRefNum || tenantRefNum || pathRefNum;
}

function refNumFromPathname(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  return parts[1] || undefined;
}

export { refNumFromPathname };

type KeycloakTokenShape = {
  tokenParsed?: {
    name?: string;
    userDetails?: {
      id?: string;
      legacyUserId?: string;
      userName?: string;
    };
  };
};

/**
 * Builds the object passed to initPholly. Uses REACT_APP_CLIENT when set, else APP_CLIENT_ID.
 */
export function buildPhollyInitConfig({
  env,
  keycloak,
}: {
  env: PhollyEnvRecord;
  keycloak: KeycloakTokenShape | null | undefined;
}): Record<string, unknown> {
  const ud = keycloak?.tokenParsed?.userDetails;
  const userId = ud?.legacyUserId ?? ud?.id;
  const serviceName =
    trimStr(env.REACT_APP_CLIENT || "") ||
    trimStr(env.APP_CLIENT_ID || "") ||
    "txe-ui";

  const cfg: Record<string, unknown> = {
    serviceName,
    environment: resolvePhollyEnvironment(env),
    userId,
    userEmail: ud?.userName,
    userName: keycloak?.tokenParsed?.name,
    release: env.REACT_APP_RELEASE_FIX_VERSION || undefined,
    version: env.REACT_APP_DEPLOYMENT_TAG || undefined,
    namespace: env.REACT_APP_K8S_NAMESPACE || undefined,
    tracePropagationTargets: getPhollyTracePropagationTargets(env),
    refNum: undefined,
  };

  const ignoreUrls = parseIgnoreUrls(env.REACT_APP_PHOLLY_IGNORE_URLS);
  if (ignoreUrls?.length) {
    cfg.ignoreUrls = ignoreUrls;
  }

  const childName = env.REACT_APP_PHOLLY_CHILD_SERVICE_NAME;
  if (childName && trimStr(childName)) {
    cfg.childServiceName = trimStr(childName);
  }

  if (getPhollyMultiRegionEnabled(env)) {
    cfg.enableMultiRegionRouting = true;
  }

  return cfg;
}
