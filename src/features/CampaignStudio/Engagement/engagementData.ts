import type { AdminEngagementData } from "./engagementTypes";

const TYPE_COLORS: Record<string, string> = {
  Clicks: "var(--secondary-blue-bb-200, #4d3ee0)",
  Comments: "var(--secondary-blue-bb-100, #6b5ce7)",
  Likes: "var(--secondary-blue-bb-50, #a89ef0)",
  Shares: "var(--secondary-blue-bb-25, #d4cff8)",
  Saved: "var(--secondary-teal-te-200, #00a3a3)",
  Replies: "var(--secondary-purple-pu-200, #7c3aed)",
  Dislikes: "var(--neutrals-nn-200, #8b95a5)",
  "Subscribers Gained": "var(--secondary-green-gr-200, #16a34a)",
  "Subscribers Lost": "var(--secondary-red-re-200, #dc2626)",
  "Videos Added to Playlist": "var(--secondary-orange-or-200, #ea580c)",
  "Videos Removed from Playlist": "var(--secondary-yellow-ye-200, #ca8a04)",
};

const NETWORK_COLORS: Record<string, string> = {
  LinkedIn: "var(--secondary-blue-bb-100, #6b5ce7)",
  Instagram: "var(--secondary-pink-pk-200, #db2777)",
  Facebook: "var(--secondary-blue-bb-300, #2d24b8)",
  "X (Twitter)": "var(--secondary-yellow-ye-200, #ca8a04)",
  TikTok: "var(--secondary-purple-pu-200, #7c3aed)",
  YouTube: "var(--secondary-teal-te-200, #00a3a3)",
};

export const adminEngagementSeed: AdminEngagementData = {
  overviewKpis: [
    {
      id: "posts",
      label: "Posts",
      value: 951,
      changePercent: 42,
      trend: "up",
      // Early bump → calm mid stretch → rounded late peak
      sparkline: [28, 46, 52, 44, 40, 42, 45, 43, 41, 44, 48, 46, 50, 55, 62, 78, 86, 80, 74, 70],
    },
    {
      id: "impressions",
      label: "Impressions",
      value: 423000,
      formattedValue: "423K",
      changePercent: 18,
      trend: "up",
      // High volatility with frequent peaks and troughs
      sparkline: [42, 68, 36, 74, 40, 82, 48, 70, 34, 76, 44, 88, 52, 66, 38, 80, 46, 72, 50, 64],
    },
    {
      id: "applications",
      label: "Applications",
      value: 1284,
      changePercent: 12,
      trend: "up",
      // Early activity → broad elevated plateau
      sparkline: [30, 48, 36, 55, 42, 38, 50, 62, 78, 84, 86, 88, 85, 87, 86, 84, 88, 86, 85, 87],
    },
    {
      id: "hires",
      label: "Hires",
      value: 86,
      changePercent: 8,
      trend: "up",
      // Moderate start → twin late peaks with a deep valley
      sparkline: [34, 42, 38, 48, 44, 52, 46, 40, 55, 70, 88, 62, 32, 28, 58, 82, 92, 76, 60, 54],
    },
  ],
  engagementsByType: [
    {
      month: "Jul 2026",
      segments: [
        { label: "Clicks", value: 4200, color: TYPE_COLORS.Clicks },
        { label: "Comments", value: 1800, color: TYPE_COLORS.Comments },
        { label: "Likes", value: 6200, color: TYPE_COLORS.Likes },
        { label: "Shares", value: 1400, color: TYPE_COLORS.Shares },
        { label: "Saved", value: 600, color: TYPE_COLORS.Saved },
        { label: "Replies", value: 400, color: TYPE_COLORS.Replies },
      ],
    },
    {
      month: "Aug 2026",
      segments: [
        { label: "Clicks", value: 5100, color: TYPE_COLORS.Clicks },
        { label: "Comments", value: 2200, color: TYPE_COLORS.Comments },
        { label: "Likes", value: 7800, color: TYPE_COLORS.Likes },
        { label: "Shares", value: 1900, color: TYPE_COLORS.Shares },
        { label: "Saved", value: 800, color: TYPE_COLORS.Saved },
        { label: "Replies", value: 500, color: TYPE_COLORS.Replies },
      ],
    },
    {
      month: "Sep 2026",
      segments: [
        { label: "Clicks", value: 4800, color: TYPE_COLORS.Clicks },
        { label: "Comments", value: 2000, color: TYPE_COLORS.Comments },
        { label: "Likes", value: 7100, color: TYPE_COLORS.Likes },
        { label: "Shares", value: 1700, color: TYPE_COLORS.Shares },
        { label: "Saved", value: 700, color: TYPE_COLORS.Saved },
        { label: "Replies", value: 450, color: TYPE_COLORS.Replies },
      ],
    },
  ],
  engagementTypeLegend: [
    "Clicks",
    "Comments",
    "Likes",
    "Shares",
    "Saved",
    "Replies",
    "Dislikes",
    "Subscribers Gained",
    "Subscribers Lost",
    "Videos Added to Playlist",
    "Videos Removed from Playlist",
  ],
  topProfiles: [
    {
      id: "p1",
      name: "Duke Health",
      platform: "linkedin",
      engagements: 13973,
      engagementRate: 6.65,
    },
    {
      id: "p2",
      name: "Duke Health Careers",
      platform: "instagram",
      engagements: 817,
      engagementRate: 5.55,
    },
    {
      id: "p3",
      name: "Elena Vasquez",
      platform: "linkedin",
      engagements: 392,
      engagementRate: 2.22,
    },
    {
      id: "p4",
      name: "Marcus Chen",
      platform: "linkedin",
      engagements: 335,
      engagementRate: 2.6,
    },
    {
      id: "p5",
      name: "Priya Patel",
      platform: "linkedin",
      engagements: 245,
      engagementRate: 2.77,
    },
    {
      id: "p6",
      name: "Sam Okonkwo",
      platform: "linkedin",
      engagements: 190,
      engagementRate: 2.27,
    },
    {
      id: "p7",
      name: "Jordan Blake",
      platform: "linkedin",
      engagements: 168,
      engagementRate: 1.95,
    },
  ],
  topProfilesTotal: 36,
  engagementsByNetwork: [
    { label: "LinkedIn", value: 48200, color: NETWORK_COLORS.LinkedIn },
    { label: "Instagram", value: 3200, color: NETWORK_COLORS.Instagram },
    { label: "Facebook", value: 980, color: NETWORK_COLORS.Facebook },
    { label: "X (Twitter)", value: 520, color: NETWORK_COLORS["X (Twitter)"] },
    { label: "TikTok", value: 180, color: NETWORK_COLORS.TikTok },
    { label: "YouTube", value: 120, color: NETWORK_COLORS.YouTube },
  ],
  networkEngagementsTotal: {
    value: "53.2K",
    label: "Engagements",
  },
  topCampaigns: [
    { id: "c1", name: "Nursing Career Stories", engagements: 10845, color: NETWORK_COLORS.LinkedIn },
    { id: "c2", name: "Atlanta Engineering Hiring", engagements: 8139, color: NETWORK_COLORS.Facebook },
    { id: "c3", name: "Duke Health Nursing Hiring Event", engagements: 5193, color: NETWORK_COLORS.TikTok },
    { id: "c4", name: "Employee Advocacy Share Pack", engagements: 4819, color: NETWORK_COLORS.Instagram },
    { id: "c5", name: "Earth Day at Duke Health", engagements: 4414, color: NETWORK_COLORS.YouTube },
    { id: "c6", name: "Clinical Excellence Week", engagements: 4009, color: "var(--secondary-orange-or-200, #ea580c)" },
    { id: "c7", name: "Sales & Service Career Fair", engagements: 3506, color: NETWORK_COLORS["X (Twitter)"] },
  ],
  topCampaignsTotal: 27,
  engagementsByDayOfWeek: [
    { day: "Sun", values: { Facebook: 800, Instagram: 600, LinkedIn: 3200, TikTok: 100, "X (Twitter)": 200, YouTube: 80 } },
    { day: "Mon", values: { Facebook: 1200, Instagram: 900, LinkedIn: 9200, TikTok: 150, "X (Twitter)": 350, YouTube: 120 } },
    { day: "Tue", values: { Facebook: 1100, Instagram: 850, LinkedIn: 8800, TikTok: 140, "X (Twitter)": 320, YouTube: 110 } },
    { day: "Wed", values: { Facebook: 1300, Instagram: 950, LinkedIn: 10500, TikTok: 160, "X (Twitter)": 380, YouTube: 130 } },
    { day: "Thu", values: { Facebook: 1500, Instagram: 1100, LinkedIn: 20500, TikTok: 200, "X (Twitter)": 450, YouTube: 150 } },
    { day: "Fri", values: { Facebook: 1000, Instagram: 750, LinkedIn: 5800, TikTok: 120, "X (Twitter)": 280, YouTube: 100 } },
    { day: "Sat", values: { Facebook: 900, Instagram: 650, LinkedIn: 5200, TikTok: 110, "X (Twitter)": 240, YouTube: 90 } },
  ],
  dayOfWeekNetworks: ["Facebook", "Instagram", "LinkedIn", "TikTok", "X (Twitter)", "YouTube"],
  engagementByTimeOfDay: buildHeatmapSeed(),
};

function buildHeatmapSeed() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells: Array<{ day: string; hour: number; value: number; tone?: "primary" | "yellow" | "green" }> = [];

  const toneOverrides: Record<string, "primary" | "yellow" | "green"> = {
    "Mon-11": "yellow",
    "Thu-5": "green",
    "Thu-7": "green",
    "Sat-8": "green",
  };

  days.forEach((day, dayIndex) => {
    for (let hour = 0; hour < 24; hour += 1) {
      const isWeekday = dayIndex >= 1 && dayIndex <= 5;
      const isBusinessHour = hour >= 8 && hour <= 22;
      const isOvernight = hour <= 5;

      let value = 0;
      if (isOvernight) {
        value = 4 + (hour % 3) * 2;
      } else if (hour === 14) {
        value = 88 + (dayIndex % 3) * 4;
      } else if (day === "Mon" && hour === 8) {
        value = 82;
      } else if (day === "Tue" && hour === 14) {
        value = 96;
      } else if (day === "Wed" && (hour === 9 || hour === 12)) {
        value = hour === 9 ? 68 : 74;
      } else if (isWeekday && isBusinessHour) {
        value = 22 + ((hour + dayIndex) % 6) * 6;
      } else if (!isWeekday && hour >= 10 && hour <= 18) {
        value = 14 + ((hour + dayIndex) % 4) * 5;
      } else {
        value = 8 + (hour % 4) * 3;
      }

      const key = `${day}-${hour}`;
      cells.push({
        day,
        hour,
        value: Math.min(100, value),
        tone: toneOverrides[key],
      });
    }
  });

  return cells;
}

export function getAdminEngagementData(): AdminEngagementData {
  return adminEngagementSeed;
}

export function getEngagementTypeColor(label: string): string {
  return TYPE_COLORS[label] ?? "var(--neutrals-nn-200, #8b95a5)";
}

export function getNetworkColor(label: string): string {
  return NETWORK_COLORS[label] ?? "var(--neutrals-nn-200, #8b95a5)";
}
