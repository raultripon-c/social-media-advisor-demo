/** Demo brand rename helpers — rewrite legacy Duke Health copy in persisted data. */

const BRAND_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Duke University Health System/gi, "One Health"],
  [/Duke Health's/gi, "One Health's"],
  [/Duke Health/gi, "One Health"],
  [/duke-health/gi, "one-health"],
  [/dukehealth/gi, "onehealth"],
  [/DukeHealthCareers/gi, "OneHealthCareers"],
  [/DukeHealth/gi, "OneHealth"],
  [/TeamDuke/gi, "TeamOneHealth"],
  [/Duke Today/gi, "One Health Today"],
  [/\bat Duke\b/gi, "at One Health"],
];

export const rebrandDemoText = (value: string): string => {
  let next = value;
  for (const [pattern, replacement] of BRAND_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return next.replace(/One Health Health/gi, "One Health");
};

export const rebrandDemoValue = <T,>(value: T): T => {
  if (typeof value === "string") return rebrandDemoText(value) as T;
  if (Array.isArray(value)) return value.map((item) => rebrandDemoValue(item)) as T;
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = rebrandDemoValue(nested);
    }
    return next as T;
  }
  return value;
};

export const DEMO_EMPLOYER_NAME = "One Health";

export const rebrandTenantName = (name?: string | null): string => {
  const raw = String(name || "").trim();
  if (!raw) return DEMO_EMPLOYER_NAME;
  if (/duke/i.test(raw) || /^phenom$/i.test(raw)) return DEMO_EMPLOYER_NAME;
  return rebrandDemoText(raw);
};

export const ensureDemoSelectedTenant = () => {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
    const next = {
      ...current,
      tenantName: DEMO_EMPLOYER_NAME,
      customerName: current?.customerName && !/duke|phenom/i.test(String(current.customerName))
        ? rebrandDemoText(String(current.customerName))
        : DEMO_EMPLOYER_NAME,
      customerCode: current?.customerCode || "onehealth",
      refNum: current?.refNum || "demo",
    };
    localStorage.setItem("selectedTenant", JSON.stringify(next));
    (window as any).txeTenant = next;
  } catch {
    const fallback = {
      tenantName: DEMO_EMPLOYER_NAME,
      customerName: DEMO_EMPLOYER_NAME,
      customerCode: "onehealth",
      refNum: "demo",
    };
    localStorage.setItem("selectedTenant", JSON.stringify(fallback));
    (window as any).txeTenant = fallback;
  }
};
