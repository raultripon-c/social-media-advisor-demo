import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

import enhanceIcon from "../../assets/svg/enhanceIcon.svg";
import generateIcon from "../../assets/svg/arrow-up-plain.svg";
import tickIcon from "../../assets/svg/tick-icon.svg";
import calendarIcon from "../../assets/svg/calendar.svg";
import copyIcon from "../../assets/svg/copy.svg";
import downloadIcon from "../../assets/svg/download.svg";
import infoIcon from "../../assets/svg/info.svg";
import trashIcon from "../../assets/svg/trash-can.svg";
import searchIcon from "../../assets/images/search-grey.svg";
import heartIcon from "../../assets/svg/social/heart.svg";
import commentIcon from "../../assets/svg/social/comment.svg";
import retweetIcon from "../../assets/svg/social/retweet.svg";
import paperPlaneIcon from "../../assets/svg/social/paper-plane.svg";
import shareIcon from "../../assets/svg/social/share-nodes.svg";
import bookmarkIcon from "../../assets/svg/social/bookmark.svg";
import chartIcon from "../../assets/svg/social/chart-simple.svg";
import facebookLikeOutlineIcon from "../../assets/svg/social/facebook-like-outline.svg";
import facebookCommentOutlineIcon from "../../assets/svg/social/facebook-comment-outline.svg";
import facebookShareOutlineIcon from "../../assets/svg/social/facebook-share-outline.svg";
import linkedinLikeOutlineIcon from "../../assets/svg/social/linkedin-like-outline.svg";
import linkedinCommentOutlineIcon from "../../assets/svg/social/linkedin-comment-outline.svg";
import linkedinShareOutlineIcon from "../../assets/svg/social/linkedin-share-outline.svg";
import xShareOutlineIcon from "../../assets/svg/social/x-share-outline.svg";
import facebookReactionLikeIcon from "../../assets/svg/social/facebook-reaction-like.svg";
import facebookReactionLoveIcon from "../../assets/svg/social/facebook-reaction-love.svg";
import linkedinLogo from "../../assets/svg/social/linkedin-logo.svg";
import instagramLogo from "../../assets/svg/social/instagram-logo.svg";
import facebookLogo from "../../assets/svg/social/facebook-logo.svg";
import xLogo from "../../assets/svg/social/x-logo.svg";
import dukeHealthLogo from "../../assets/campaign-studio/duke-health-logo-avatar.png";
import facebookLifestyleImage from "../../assets/campaign-studio/reference/facebook-nursing-lifestyle.png";
import instagramLifestyleImage from "../../assets/campaign-studio/reference/instagram-nursing-lifestyle.png";
import linkedinLifestyleImage from "../../assets/campaign-studio/reference/linkedin-nursing-lifestyle.png";
import xLifestyleImage from "../../assets/campaign-studio/reference/x-nursing-lifestyle.png";

import {
  campaignStudioAdapter,
  channelOptions,
  createCampaignFromBrief,
  generationSteps,
  getRefNum,
  getSelectedTenantName,
  makeCampaignName,
  parseBrief,
  templateCards,
  toneOptions,
} from "./campaignStudioData";
import { Campaign, CampaignMetrics, CampaignPlatformName, CampaignPlatformOutput } from "./types";
import "./CampaignStudio.css";

const defaultPrompt =
  "Create a campaign for Registered Nurses in Durham, NC. Target experienced nurses with a warm and professional tone.";

const getCampaignStudioListPath = (customerCode?: string, refnum?: string) =>
  customerCode && refnum ? `/${customerCode}/${refnum}/campaign-studio/campaigns` : "/campaign-studio/campaigns";

type GenerateCampaignDraft = {
  prompt: string;
  campaignName: string;
  tone: string;
  channels: CampaignPlatformName[];
  dueDate: string;
};

const platformMeta: Record<CampaignPlatformName, { handle: string; actions: string[] }> = {
  LinkedIn: { handle: "2d · Hiring update", actions: ["Like", "Comment", "Repost", "Send"] },
  Instagram: { handle: "@tenant · Careers", actions: ["Like", "Comment", "Repost", "Share", "Save"] },
  Facebook: { handle: "2h · Public", actions: ["Like", "Comment", "Share"] },
  X: { handle: "@tenant · 2h", actions: ["Reply", "Repost", "Like", "Views", "Share"] },
};

const actionIconMap: Record<string, string> = {
  Like: heartIcon,
  Comment: commentIcon,
  Reply: commentIcon,
  Repost: retweetIcon,
  Send: paperPlaneIcon,
  Share: shareIcon,
  Save: bookmarkIcon,
  Views: chartIcon,
};

const channelLogoMap: Record<CampaignPlatformName, string> = {
  LinkedIn: linkedinLogo,
  Instagram: instagramLogo,
  Facebook: facebookLogo,
  X: xLogo,
};

const getChannelSelectionLabel = (channel: CampaignPlatformName) => (channel === "X" ? "X (Formerly Twitter)" : channel);

const campaignTableChannelOrder: CampaignPlatformName[] = ["LinkedIn", "Facebook", "X", "Instagram"];
const getOrderedCampaignPlatforms = (platforms: CampaignPlatformOutput[]) =>
  [...platforms].sort(
    (a, b) => campaignTableChannelOrder.indexOf(a.platform) - campaignTableChannelOrder.indexOf(b.platform)
  );

const cmsDestinationPages = [
  {
    label: "Duke Health homepage",
    value: "https://www.dukehealth.org/",
    subpages: [
      { label: "Find a doctor", value: "https://www.dukehealth.org/find-doctors-physicians" },
      { label: "Locations", value: "https://www.dukehealth.org/locations" },
    ],
  },
  {
    label: "Careers homepage",
    value: "https://careers.dukehealth.org/",
    subpages: [
      { label: "Nursing careers", value: "https://careers.dukehealth.org/nursing" },
      { label: "Benefits and culture", value: "https://careers.dukehealth.org/benefits" },
      { label: "All open jobs", value: "https://careers.dukehealth.org/search-jobs" },
    ],
  },
  {
    label: "Nursing careers",
    value: "https://careers.dukehealth.org/nursing",
    subpages: [
      { label: "Registered Nurse jobs", value: "https://careers.dukehealth.org/search-jobs/registered%20nurse" },
      { label: "New graduate nurses", value: "https://careers.dukehealth.org/nursing/new-graduate-nurses" },
    ],
  },
  {
    label: "Benefits and culture",
    value: "https://careers.dukehealth.org/benefits",
    subpages: [
      { label: "Diversity and inclusion", value: "https://careers.dukehealth.org/diversity-and-inclusion" },
      { label: "Career areas", value: "https://careers.dukehealth.org/career-areas" },
    ],
  },
];

const ctaLocaleOptions = [
  { label: "English (US)", value: "en-US" },
  { label: "Spanish (US)", value: "es-US" },
];
const ctaPersonaOptions = [
  { label: "Candidate", value: "candidate" },
  { label: "Nursing talent", value: "nursing" },
  { label: "Clinical talent", value: "clinical" },
];
const ctaJobOptions = [
  { label: "Registered Nurse, PICU", value: "https://careers.dukehealth.org/job/durham/registered-nurse-picu/38342/64290942096" },
  { label: "Nurse Practitioner", value: "https://careers.dukehealth.org/job/durham/nurse-practitioner/38342/64290942112" },
  { label: "Medical Assistant", value: "https://careers.dukehealth.org/job/durham/medical-assistant/38342/64290942128" },
];

const getCmsDestinationMatch = (destination: string) => {
  const fallbackPage = cmsDestinationPages[1];
  const page =
    cmsDestinationPages.find((item) => item.value === destination || item.subpages.some((subpage) => subpage.value === destination)) ||
    fallbackPage;
  const subpage = page.subpages.find((item) => item.value === destination);

  return { page, subpage };
};

const imageOptions = [
  { label: "Nursing care team", src: linkedinLifestyleImage },
  { label: "Nursing team moment", src: instagramLifestyleImage },
  { label: "Clinical care setting", src: facebookLifestyleImage },
  { label: "Candidate lifestyle", src: xLifestyleImage },
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const scrollPageToTop = () => {
  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document
      .querySelectorAll<HTMLElement>(".tools-body-container, .app-layout__content, .app-content, .root-main-page, main")
      .forEach((element) => {
        element.scrollTop = 0;
        element.scrollTo?.({ top: 0, left: 0 });
      });
  };

  resetScroll();
  window.requestAnimationFrame(resetScroll);
  window.setTimeout(resetScroll, 0);
  window.setTimeout(resetScroll, 50);
};

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "campaign";

const crc32Table = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

const getCrc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  data.forEach((byte) => {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const pushUint16 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff);
};

const pushUint32 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
};

const createStoredZipBlob = (files: Array<{ name: string; content: string | Uint8Array }>) => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const crc = getCrc32(data);
    const localHeader: number[] = [];

    pushUint32(localHeader, 0x04034b50);
    pushUint16(localHeader, 20);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint32(localHeader, crc);
    pushUint32(localHeader, data.length);
    pushUint32(localHeader, data.length);
    pushUint16(localHeader, name.length);
    pushUint16(localHeader, 0);

    chunks.push(new Uint8Array(localHeader), name, data);

    const centralHeader: number[] = [];
    pushUint32(centralHeader, 0x02014b50);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, crc);
    pushUint32(centralHeader, data.length);
    pushUint32(centralHeader, data.length);
    pushUint16(centralHeader, name.length);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, 0);
    pushUint32(centralHeader, offset);

    centralDirectory.push(new Uint8Array(centralHeader), name);
    offset += localHeader.length + name.length + data.length;
  });

  const centralDirectorySize = centralDirectory.reduce((sum, chunk) => sum + chunk.length, 0);
  const endRecord: number[] = [];
  pushUint32(endRecord, 0x06054b50);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, files.length);
  pushUint16(endRecord, files.length);
  pushUint32(endRecord, centralDirectorySize);
  pushUint32(endRecord, offset);
  pushUint16(endRecord, 0);

  return new Blob([...chunks, ...centralDirectory, new Uint8Array(endRecord)], { type: "application/zip" });
};

const escapePdfText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const wrapPdfLine = (value: string, maxLength = 88) => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

const createCampaignContentPdf = (campaign: Campaign) => {
  const encoder = new TextEncoder();
  const pageWidth = 612;
  const pageHeight = 792;
  const pageMargin = 54;
  const lineHeight = 16;
  const lines: string[] = [
    campaign.name,
    `Publish date: ${formatDisplayDate(campaign.postDate) || campaign.postDate}`,
    "",
  ];

  campaign.platforms.forEach((platform, index) => {
    lines.push(`${index + 1}. ${platform.platform}`);
    lines.push(`CTA link: ${platform.utmLink || platform.ctaDestination}`);
    lines.push("Post text:");
    stripGeneratedLinksFromCopy(platform.copy)
      .split(/\n+/)
      .flatMap((line) => wrapPdfLine(line.trim()))
      .forEach((line) => lines.push(line));
    lines.push("");
  });

  const pages: string[][] = [[]];
  let currentY = pageHeight - pageMargin;
  lines.forEach((line) => {
    const wrappedLines = line ? wrapPdfLine(line) : [""];
    wrappedLines.forEach((wrappedLine) => {
      if (currentY < pageMargin) {
        pages.push([]);
        currentY = pageHeight - pageMargin;
      }
      pages[pages.length - 1].push(wrappedLine);
      currentY -= lineHeight;
    });
  });

  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };
  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];

  pages.forEach((pageLines) => {
    const textCommands = pageLines
      .map((line, index) => `1 0 0 1 ${pageMargin} ${pageHeight - pageMargin - index * lineHeight} Tm (${escapePdfText(line)}) Tj`)
      .join("\n");
    const stream = `BT\n/F1 10 Tf\n${textCommands}\nET`;
    const contentId = addObject(`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const pdfParts = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdfParts.join("")).length);
    pdfParts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const xrefOffset = encoder.encode(pdfParts.join("")).length;
  pdfParts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offsetValue) => {
    pdfParts.push(`${String(offsetValue).padStart(10, "0")} 00000 n \n`);
  });
  pdfParts.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return encoder.encode(pdfParts.join(""));
};

const getImageExtension = (imageUrl: string) => {
  const cleanUrl = imageUrl.split("?")[0];
  const extension = cleanUrl.match(/\.(png|jpe?g|webp|gif)$/i)?.[1]?.toLowerCase();
  if (!extension) return "png";
  return extension === "jpeg" ? "jpg" : extension;
};

const downloadCampaignContentZip = async (campaign: Campaign) => {
  const files: Array<{ name: string; content: string | Uint8Array }> = [
    {
      name: `${sanitizeFileName(campaign.name)}-channel-content.pdf`,
      content: createCampaignContentPdf(campaign),
    },
  ];

  const imageFiles = await Promise.all(
    campaign.platforms.map(async (platform, index) => {
      const fileBaseName = `image-assets/${String(index + 1).padStart(2, "0")}-${sanitizeFileName(platform.platform)}-image`;
      try {
        const response = await fetch(platform.image);
        if (!response.ok) {
          return {
            name: `${fileBaseName}-download-link.txt`,
            content: platform.image,
          };
        }
        const imageData = new Uint8Array(await response.arrayBuffer());
        return {
          name: `${fileBaseName}.${getImageExtension(platform.image)}`,
          content: imageData,
        };
      } catch {
        return {
          name: `${fileBaseName}-download-link.txt`,
          content: platform.image,
        };
      }
    })
  );

  files.push(...imageFiles);
  const zipBlob = createStoredZipBlob(files);
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(campaign.name)}-content.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const getCampaignTableStatus = (campaign: Campaign) => {
  const postDate = new Date(campaign.postDate);
  const today = new Date();

  postDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(postDate.getTime()) && postDate > today
    ? { label: "Upcoming", className: "upcoming" }
    : { label: "Published", className: "published" };
};

const getConversion = (campaign: Campaign) => {
  if (!campaign.metrics.clicks) return "0%";
  return `${Math.round((campaign.metrics.applications / campaign.metrics.clicks) * 100)}%`;
};

const getPlatformConversion = (platform: CampaignPlatformOutput) => {
  if (!platform.metrics.clicks) return 0;
  return Math.round((platform.metrics.applications / platform.metrics.clicks) * 100);
};

const getTopConversionChannel = (campaign: Campaign) => {
  const sorted = [...campaign.platforms].sort((a, b) => getPlatformConversion(b) - getPlatformConversion(a));
  const top = sorted[0];
  return {
    platform: top?.platform || "LinkedIn",
    percent: top ? getPlatformConversion(top) : 0,
  };
};

const getTopChannel = (campaign: Campaign, metric: keyof Campaign["metrics"] = "clicks") => {
  const sorted = [...campaign.platforms].sort((a, b) => b.metrics[metric] - a.metrics[metric]);
  const top = sorted[0];
  const total = campaign.platforms.reduce((sum, platform) => sum + platform.metrics[metric], 0);
  return {
    platform: top?.platform || "LinkedIn",
    percent: total ? Math.round((top.metrics[metric] / total) * 100) : 0,
  };
};

const getMetricBreakdown = (campaign: Campaign, metric: keyof Campaign["metrics"]) => {
  const total = campaign.platforms.reduce((sum, platform) => sum + platform.metrics[metric], 0);
  return campaign.platforms
    .map((platform) => ({
      platform: platform.platform,
      percent: total ? Math.round((platform.metrics[metric] / total) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent || campaignTableChannelOrder.indexOf(a.platform) - campaignTableChannelOrder.indexOf(b.platform));
};

const getConversionBreakdown = (campaign: Campaign) =>
  campaign.platforms
    .map((platform) => ({
      platform: platform.platform,
      percent: getPlatformConversion(platform),
    }))
    .sort((a, b) => b.percent - a.percent || campaignTableChannelOrder.indexOf(a.platform) - campaignTableChannelOrder.indexOf(b.platform));

const MetricInfoPopover = ({
  title,
  items,
}: {
  title: string;
  items: Array<{ platform: CampaignPlatformName; percent: number }>;
}) => (
  <span className="cs-metric-info">
    <button type="button" className="cs-metric-info__trigger" aria-label={`Show ${title} by channel`}>
      <img src={infoIcon} alt="" />
    </button>
    <span className="cs-metric-info__popover" role="tooltip">
      <strong>{title}</strong>
      {items.map((item) => (
        <span className="cs-metric-info__row" key={item.platform}>
          <span>
            <img src={channelLogoMap[item.platform]} alt="" />
            {item.platform}
          </span>
          <b>{item.percent}%</b>
        </span>
      ))}
    </span>
  </span>
);

const CampaignSankeyDiagram = ({ campaign }: { campaign: Campaign }) => {
  const [activeChannel, setActiveChannel] = useState<CampaignPlatformName | null>(null);
  const sankeyRef = useRef<HTMLDivElement | null>(null);
  const [sankeyWidth, setSankeyWidth] = useState(1280);
  const sankeyAccentMap: Record<CampaignPlatformName, string> = {
    LinkedIn: "#12355f",
    Facebook: "#1877f2",
    Instagram: "#c13584",
    X: "#111827",
  };
  const stages: Array<{ key: keyof CampaignMetrics; label: string }> = [
    { key: "clicks", label: "Clicked" },
    { key: "applicationStarts", label: "Click to apply" },
    { key: "applications", label: "Applied" },
  ];
  useEffect(() => {
    const node = sankeyRef.current;
    if (!node) return undefined;

    const updateWidth = () => {
      setSankeyWidth(Math.max(560, Math.round(node.getBoundingClientRect().width)));
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  const vbWidth = sankeyWidth;
  const headerHeight = 86;
  const nodeWidth = 34;
  const fixedGap = 1;
  const channelCount = campaign.platforms.length;
  const chartSidePadding = vbWidth < 760 ? 32 : 48;
  const stageHeaderWidth = 190;
  const sideLabelReserve = Math.max(nodeWidth, stageHeaderWidth);
  const firstColumnX = chartSidePadding + sideLabelReserve / 2;
  const lastColumnX = Math.max(firstColumnX + 320, vbWidth - chartSidePadding - sideLabelReserve / 2 - nodeWidth);
  const colX = [firstColumnX, firstColumnX + (lastColumnX - firstColumnX) / 2, lastColumnX];
  const stageValue = (platform: CampaignPlatformOutput, stageIndex: number) => {
    if (stageIndex === 0) return platform.metrics.clicks;
    if (stageIndex === 1) return Math.min(platform.metrics.applicationStarts, platform.metrics.clicks);
    return Math.min(platform.metrics.applications, platform.metrics.applicationStarts, platform.metrics.clicks);
  };
  const totalsByStage = stages.map((_, stageIndex) => campaign.platforms.reduce((sum, platform) => sum + stageValue(platform, stageIndex), 0));
  const totalClicks = Math.max(totalsByStage[0], 1);
  const toK = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString());
  const pct = (value: number, total: number) => (total ? `${((value / total) * 100).toFixed(1)}%` : "0%");
  const stagePct = (platform: CampaignPlatformOutput, stageIndex: number) => {
    if (stageIndex === 0) return pct(stageValue(platform, 0), totalsByStage[0]);
    return pct(stageValue(platform, stageIndex), stageValue(platform, stageIndex - 1));
  };
  const nodeOpacity = (platform: CampaignPlatformName) => (!activeChannel || activeChannel === platform ? 1 : 0.18);
  const flowOpacity = (platform: CampaignPlatformName) => (!activeChannel ? 0.7 : activeChannel === platform ? 0.82 : 0.08);
  const clickedTotalHeight = 210;
  const minFlowHeight = 32;
  const clickedHeights = campaign.platforms.map((platform) => Math.max(minFlowHeight, (stageValue(platform, 0) / totalClicks) * clickedTotalHeight));
  const stageHeights = stages.map((stage, stageIndex) =>
    campaign.platforms.map((platform, platformIndex) => {
      if (stageIndex === 0) return clickedHeights[platformIndex];

      const stepRatio = stageValue(platform, stageIndex) / Math.max(stageValue(platform, 0), 1);
      return Math.max(minFlowHeight, clickedHeights[platformIndex] * stepRatio);
    })
  );
  const blockHeight = (heights: number[]) => heights.reduce((sum, height) => sum + height, 0) + fixedGap * Math.max(channelCount - 1, 0);
  const maxBlockHeight = Math.max(...stageHeights.map(blockHeight));
  const height = headerHeight + maxBlockHeight + 24;
  const distributeY = (heights: number[]) => {
    const total = blockHeight(heights);
    let y = headerHeight + (maxBlockHeight - total) / 2;
    return heights.map((itemHeight) => {
      const currentY = y;
      y += itemHeight + fixedGap;
      return currentY;
    });
  };
  const stageNodes = stages.map((_, stageIndex) => {
    const ys = distributeY(stageHeights[stageIndex]);
    return campaign.platforms.map((platform, index) => ({ x: colX[stageIndex], y: ys[index], h: stageHeights[stageIndex][index], platform }));
  });
  const bandPath = (fromX: number, fromY: number, fromH: number, toX: number, toY: number, toH: number) => {
    const mx = (fromX + toX) / 2;
    return `M${fromX},${fromY} C${mx},${fromY} ${mx},${toY} ${toX},${toY} L${toX},${toY + toH} C${mx},${toY + toH} ${mx},${fromY + fromH} ${fromX},${fromY + fromH} Z`;
  };

  return (
    <section className="cs-overview-sankey">
      <div className="cs-overview-sankey__header">
        <div>
          <h2>Channel performance flow</h2>
        </div>
      </div>
      <div className="cs-sankey" ref={sankeyRef}>
        <svg viewBox={`0 0 ${vbWidth} ${height}`} role="img" aria-label="Campaign channel performance Sankey diagram">
          {colX.map((x, index) => (
            <line
              key={`step-guide-${stages[index].key}`}
              x1={x}
              y1={headerHeight - 12}
              x2={x}
              y2={height - 16}
              className="cs-sankey__step-guide"
            />
          ))}
          {stages.map((stage, index) => (
            <g key={stage.key}>
              <text x={colX[index]} y="14" className="cs-sankey__stage-label">{`${stage.label} (${toK(totalsByStage[index])})`}</text>
              <text x={colX[index]} y="42" className="cs-sankey__stage-total">{pct(totalsByStage[index], totalsByStage[0])}</text>
            </g>
          ))}
          {campaign.platforms.flatMap((platform, platformIndex) =>
            stages.slice(1).map((stage, stageIndex) => {
              const from = stageNodes[stageIndex][platformIndex];
              const to = stageNodes[stageIndex + 1][platformIndex];
              const value = stageValue(platform, stageIndex + 1);
              const labelX = (from.x + nodeWidth + to.x) / 2;
              const labelY = (from.y + from.h / 2 + to.y + to.h / 2) / 2;
              return (
                <g
                  key={`${platform.platform}-${stage.key}`}
                  opacity={flowOpacity(platform.platform)}
                  onMouseEnter={() => setActiveChannel(platform.platform)}
                  onMouseLeave={() => setActiveChannel(null)}
                >
                  <path
                    d={bandPath(from.x + nodeWidth, from.y, from.h, to.x, to.y, to.h)}
                    fill={sankeyAccentMap[platform.platform]}
                    className="cs-sankey__band"
                  >
                    <title>{`${platform.platform} ${stage.label}: ${value.toLocaleString()}`}</title>
                  </path>
                  <text x={labelX} y={labelY + 3} className="cs-sankey__transition-pct">{stagePct(platform, stageIndex + 1)}</text>
                </g>
              );
            })
          )}
          {campaign.platforms.flatMap((platform, platformIndex) =>
            stages.map((stage, stageIndex) => {
              const node = stageNodes[stageIndex][platformIndex];
              const value = stageValue(platform, stageIndex);
              return (
                <g
                  key={`${platform.platform}-${stage.key}-node`}
                  opacity={nodeOpacity(platform.platform)}
                  className="cs-sankey__node"
                  onMouseEnter={() => setActiveChannel(platform.platform)}
                  onMouseLeave={() => setActiveChannel(null)}
                >
                  <rect x={node.x} y={node.y} width={nodeWidth} height={node.h} fill={sankeyAccentMap[platform.platform]} />
                  <text x={node.x + nodeWidth / 2} y={node.y + node.h / 2 + 3} className="cs-sankey__metric-inside">{toK(value)}</text>
                </g>
              );
            })
          )}
        </svg>
        <div className="cs-sankey__history" aria-label="Channel history">
          {campaign.platforms.map((platform) => (
            <div
              key={platform.platform}
              className={activeChannel === platform.platform ? "is-active" : ""}
              onMouseEnter={() => setActiveChannel(platform.platform)}
              onMouseLeave={() => setActiveChannel(null)}
            >
              <span style={{ backgroundColor: sankeyAccentMap[platform.platform] }} aria-hidden="true" />
              {platform.platform}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MetricCell = ({ campaign, metric }: { campaign: Campaign; metric: keyof Campaign["metrics"] }) => {
  const top = getTopChannel(campaign, metric);
  const metricLabels: Record<keyof Campaign["metrics"], string> = {
    clicks: "Clicks by channel",
    applicationStarts: "Application starts by channel",
    applications: "Applications by channel",
  };
  return (
    <div className="cs-table-metric">
      <span className="cs-table-metric__value-row">
        <span className="cs-table-metric__value">{campaign.metrics[metric].toLocaleString()}</span>
        <MetricInfoPopover title={metricLabels[metric]} items={getMetricBreakdown(campaign, metric)} />
      </span>
      {campaign.platforms.length > 1 && <small>{top.platform} {top.percent}%</small>}
    </div>
  );
};

const ConversionCell = ({ campaign }: { campaign: Campaign }) => {
  const top = getTopConversionChannel(campaign);
  return (
    <div className="cs-table-metric">
      <span className="cs-table-metric__value-row">
        <span className="cs-table-metric__value">{getConversion(campaign)}</span>
        <MetricInfoPopover title="Conversion by channel" items={getConversionBreakdown(campaign)} />
      </span>
      {campaign.platforms.length > 1 && <small>{top.platform} {top.percent}%</small>}
    </div>
  );
};

const getDuplicateCampaignName = (campaignName: string, campaigns: Campaign[]) => {
  const baseName = campaignName.replace(/\s\(\d+\)$/, "");
  let index = 1;
  while (campaigns.some((item) => item.name === `${baseName} (${index})`)) index += 1;
  return `${baseName} (${index})`;
};

const getCampaignPrompt = (campaign: Campaign) => {
  const location = campaign.location && campaign.location !== "target markets" ? ` in ${campaign.location}` : "";
  return `Create a campaign for ${campaign.role}${location}. Target ${campaign.audience} with a ${campaign.tone.toLowerCase()} tone.`;
};

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: string) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const stripGeneratedLinksFromCopy = (copy: string) =>
  copy
    .replace(/\s*(?:Learn more:\s*)?https?:\/\/\S+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

const OverlayPortal = ({ children }: { children: React.ReactNode }) => {
  if (typeof document === "undefined") return <>{children}</>;
  return createPortal(children, document.body);
};

const Modal = ({
  title,
  children,
  onClose,
  size = "md",
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
  className?: string;
}) => (
  <OverlayPortal>
    <div className={`cs-modal-backdrop ${className ? `${className}__backdrop` : ""}`} role="dialog" aria-modal="true">
      <div className={`cs-modal cs-modal--${size} ${className}`}>
        <div className="cs-modal__header">
          <h2>{title}</h2>
          <button className="cs-icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  </OverlayPortal>
);

const Button = ({
  children,
  variant = "secondary",
  disabled,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) => (
  <button type={type} className={`cs-btn cs-btn--${variant} ${className}`} disabled={disabled} onClick={onClick}>
    {children}
  </button>
);

const BackEditLink = ({ onClick }: { onClick?: () => void }) => (
  <button className="cs-back-edit" onClick={onClick}>
    <span aria-hidden="true">‹</span> Go Back and Edit
  </button>
);

const BackToCampaignStudioLink = ({ onClick }: { onClick?: () => void }) => (
  <button className="cs-back-edit" onClick={onClick}>
    <span aria-hidden="true">‹</span> Back to Campaigns Studio
  </button>
);

const TemplateIcon = ({ type }: { type: string }) => {
  if (type === "user") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 8.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.2 14c.5-2.5 2.3-4 4.8-4s4.3 1.5 4.8 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M4.5 2v2.2M11.5 2v2.2M3 5.5h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
        <path d="M3.2 3.5h9.6c.7 0 1.2.5 1.2 1.2v7.6c0 .7-.5 1.2-1.2 1.2H3.2c-.7 0-1.2-.5-1.2-1.2V4.7c0-.7.5-1.2 1.2-1.2Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "bolt") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8.9 1.8 3.8 8.7h3.4l-.3 5.5 5.3-7.2H8.8l.1-5.2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "sparkle") {
    return (
      <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 1.8 9.4 6 13.6 8l-4.2 2L8 14.2 6.6 10 2.4 8l4.2-2L8 1.8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg className="cs-template-card__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M6.4 7.4a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.2 13.5c.4-2.4 1.9-3.8 4.2-3.8s3.8 1.4 4.2 3.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      <path d="M11 7.4a2.1 2.1 0 0 0 0-4M11.8 9.9c1.2.5 1.9 1.7 2.1 3.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
};

const roleOptions = [
  "Registered Nurses",
  "Nurse Practitioners",
  "Medical Assistants",
  "Radiology Technicians",
  "Respiratory Therapists",
  "Pharmacy Technicians",
  "Patient Care Technicians",
  "Software Engineers",
];
const jobCategoryOptions = [
  "Nursing",
  "Allied Health",
  "Clinical Support",
  "Administrative",
  "Technology",
  "Operations",
];
const eventOptions = [
  "Duke Health Nursing Hiring Event",
  "Clinical Careers Open House",
  "Virtual Nurse Recruitment Webinar",
  "Healthcare Career Fair",
  "Patient Care Networking Event",
];
const ctaEventOptions = eventOptions.map((eventName) => ({
  label: eventName,
  value: `https://careers.dukehealth.org/events/${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
}));

type DropdownOption = { value: string; label: string };
type GooglePlacePrediction = {
  description: string;
  place_id: string;
};

const GOOGLE_PLACES_SCRIPT_ID = "google-places-autocomplete";
const getGooglePlacesApiKey = () =>
  ((window as any)?._env_?.GOOGLE_MAPS_API_KEY ||
    (window as any)?._env_?.REACT_APP_GOOGLE_MAPS_API_KEY ||
    (typeof process !== "undefined" ? (process as any)?.env?.REACT_APP_GOOGLE_MAPS_API_KEY : "") ||
    "") as string;

const loadGooglePlacesScript = () => {
  if ((window as any).google?.maps?.places) return Promise.resolve(true);

  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) return Promise.resolve(false);

  const existingScript = document.getElementById(GOOGLE_PLACES_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise<boolean>((resolve) => {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.id = GOOGLE_PLACES_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const SingleSelectDropdown = ({
  value,
  options,
  onChange,
  placeholder = "Placeholder",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || dropdownRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div className="cs-ds-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`cs-ds-dropdown__control ${isOpen ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={selectedOption ? "" : "is-placeholder"}>{selectedOption?.label || placeholder}</span>
      </button>
      {isOpen && (
        <div className="cs-ds-dropdown__menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={option.value === value ? "is-selected" : ""}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const buildStructuredBrief = ({
  brief,
  jobCategory,
  role,
  location,
  eventName,
  eventDate,
  eventFormat,
}: {
  brief: string;
  jobCategory: string;
  role: string;
  location: string;
  eventName: string;
  eventDate: string;
  eventFormat: string;
}) => {
  const details: string[] = [];

  if (jobCategory.trim()) details.push(`Job category: ${jobCategory.trim()}.`);
  if (role.trim()) details.push(`Target role or roles: ${role.trim()}.`);
  if (location.trim()) details.push(`Location or work model: ${location.trim()}.`);
  if (eventName.trim()) details.push(`Event: ${eventName.trim()}.`);
  if (eventDate.trim()) details.push(`Event date: ${formatDisplayDate(eventDate)}.`);
  if (eventFormat.trim()) details.push(`Event format: ${eventFormat.trim()}.`);

  return [brief.trim(), ...details].filter(Boolean).join(" ");
};

const CampaignSummary = ({
  details,
  eventName,
  eventDate,
  eventFormat,
}: {
  details: ReturnType<typeof parseBrief>;
  eventName?: string;
  eventDate?: string;
  eventFormat?: string;
}) => (
  <div className="cs-summary-readonly">
    <p>
      I’m going to create a campaign for <strong>{details.role}</strong> in <strong>{details.location}</strong>,
      targeting <strong>{details.audience}</strong> with a <strong>{details.tone}</strong> tone.
      {eventName ? <> This will support <strong>{eventName}</strong>{eventDate ? <> on <strong>{formatDisplayDate(eventDate)}</strong></> : ""}{eventFormat ? <> as a <strong>{eventFormat}</strong> event</> : ""}.</> : ""}
    </p>
  </div>
);

const DatePickerField = ({ value, onChange }: { value: string; onChange: (date: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => (value ? new Date(`${value}T00:00:00`) : new Date()));
  const datePickerRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long" }).format(visibleMonth);
  const yearLabel = visibleMonth.getFullYear();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || datePickerRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const shiftMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const setToday = () => {
    const today = new Date();
    onChange(formatInputDate(today));
    setVisibleMonth(today);
    setIsOpen(false);
  };

  return (
    <div className="cs-date-picker" ref={datePickerRef}>
      <button type="button" className={`cs-date-input ${isOpen ? "is-open" : ""} ${!value ? "is-placeholder" : ""}`} onClick={() => setIsOpen((current) => !current)}>
        <span>{value ? formatDisplayDate(value) : "Select date"}</span>
        <img src={calendarIcon} alt="" />
      </button>
      {isOpen && (
        <div className="cs-date-popover">
          <div className="cs-date-popover__header">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
            <strong>{monthLabel}</strong>
            <strong>{yearLabel}</strong>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
          </div>
          <div className="cs-date-popover__weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="cs-date-popover__days">
            {getCalendarDays(visibleMonth).map((date) => {
              const inputDate = formatInputDate(date);
              const isMuted = date.getMonth() !== visibleMonth.getMonth();
              const isSelected = selectedDate && inputDate === formatInputDate(selectedDate);
              return (
                <button
                  type="button"
                  key={inputDate}
                  className={`${isMuted ? "is-muted" : ""} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    onChange(inputDate);
                    setIsOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="cs-date-popover__footer">
            <button type="button" onClick={setToday}>Today</button>
            <button type="button" onClick={() => { onChange(""); setIsOpen(false); }}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CampaignWizardProgress = ({ activeStep }: { activeStep: 1 | 2 }) => (
  <div className="cs-wizard-steps" aria-label="Generate campaign steps">
    <span className={activeStep === 1 ? "is-active" : ""}><em>1</em><strong>Details</strong></span>
    <span className={activeStep === 2 ? "is-active" : ""}><em>2</em><strong>Preview & publish</strong></span>
  </div>
);

const CampaignWizardHeader = ({ activeStep }: { activeStep: 1 | 2 }) => (
  <div className="cs-wizard-header__content">
    <div className="cs-wizard-title">
      <h1>Generate campaign</h1>
      <p>Review campaign details, generate channel assets, and prepare content for publishing.</p>
    </div>
    <CampaignWizardProgress activeStep={activeStep} />
  </div>
);

const GenerateCampaignModal = ({
  prompt,
  initialCampaignName,
  initialTone,
  initialChannels,
  initialDueDate,
  onBack,
  onStart,
}: {
  prompt: string;
  initialCampaignName?: string;
  initialTone?: string;
  initialChannels?: CampaignPlatformName[];
  initialDueDate?: string;
  onBack: () => void;
  onStart: (campaign: Campaign) => void;
}) => {
  const initialDetails = parseBrief(prompt, initialTone);
  const initialCtaMatch = getCmsDestinationMatch(cmsDestinationPages[1].value);
  const [brief, setBrief] = useState(prompt);
  const [tone, setTone] = useState(initialTone || parseBrief(prompt).tone);
  const [campaignName, setCampaignName] = useState(initialCampaignName || makeCampaignName(prompt));
  const [selectedChannels, setSelectedChannels] = useState<CampaignPlatformName[]>(initialChannels || ["Facebook", "Instagram", "X", "LinkedIn"]);
  const [dueDate, setDueDate] = useState(initialDueDate || "");
  const [jobCategory, setJobCategory] = useState(jobCategoryOptions[0]);
  const [roleDetails, setRoleDetails] = useState(initialDetails.role === "priority roles" ? "" : initialDetails.role);
  const [locationDetails, setLocationDetails] = useState(initialDetails.location === "target markets" ? "" : initialDetails.location);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [googleLocationOptions, setGoogleLocationOptions] = useState<GooglePlacePrediction[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCtaPageValue, setSelectedCtaPageValue] = useState(initialCtaMatch.page.value);
  const [, setSelectedCtaSubpageValue] = useState(initialCtaMatch.subpage?.value || "");
  const [ctaDestinationType, setCtaDestinationType] = useState<"page" | "job" | "event">("page");
  const [selectedCtaLocale, setSelectedCtaLocale] = useState(ctaLocaleOptions[0].value);
  const [selectedCtaPersona, setSelectedCtaPersona] = useState(ctaPersonaOptions[0].value);
  const [selectedCtaJob, setSelectedCtaJob] = useState(ctaJobOptions[0].value);
  const [selectedCtaEvent, setSelectedCtaEvent] = useState(ctaEventOptions[0].value);
  const selectedCtaPage = cmsDestinationPages.find((page) => page.value === selectedCtaPageValue) || cmsDestinationPages[1];
  const selectedCtaDestination =
    ctaDestinationType === "job" ? selectedCtaJob : ctaDestinationType === "event" ? selectedCtaEvent : selectedCtaPage.value;
  const selectedCtaEventLabel = ctaEventOptions.find((event) => event.value === selectedCtaEvent)?.label || "";
  const eventTemplatePrompt = templateCards.find((template) => template.icon === "calendar")?.prompt.toLowerCase() || "";
  const isEventTemplateSelected = eventTemplatePrompt ? brief.toLowerCase().includes(eventTemplatePrompt) : false;
  const shouldShowEventContext = isEventTemplateSelected || ctaDestinationType === "event";
  const effectiveBrief = buildStructuredBrief({
    brief,
    jobCategory,
    role: roleDetails,
    location: locationDetails,
    eventName: shouldShowEventContext ? selectedCtaEventLabel : "",
    eventDate: "",
    eventFormat: "",
  });
  useEffect(() => {
    if (!initialCampaignName) setCampaignName(makeCampaignName(effectiveBrief));
  }, [effectiveBrief, initialCampaignName]);

  useEffect(() => {
    if (!isRoleDropdownOpen && !isLocationDropdownOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (roleDropdownRef.current?.contains(event.target) || locationDropdownRef.current?.contains(event.target)) return;
      setIsRoleDropdownOpen(false);
      setIsLocationDropdownOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isRoleDropdownOpen, isLocationDropdownOpen]);

  useEffect(() => {
    const query = locationSearch.trim();
    if (!isLocationDropdownOpen || query.length < 2) {
      setGoogleLocationOptions([]);
      setIsLoadingLocations(false);
      return undefined;
    }

    let isActive = true;
    setIsLoadingLocations(true);

    const timeoutId = window.setTimeout(() => {
      loadGooglePlacesScript().then((isLoaded) => {
        const googlePlaces = (window as any).google?.maps?.places;
        if (!isActive || !isLoaded || !googlePlaces?.AutocompleteService) {
          if (isActive) {
            setGoogleLocationOptions([]);
            setIsLoadingLocations(false);
          }
          return;
        }

        const autocompleteService = new googlePlaces.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: query,
          },
          (predictions: GooglePlacePrediction[] | null) => {
            if (!isActive) return;
            setGoogleLocationOptions(predictions || []);
            setIsLoadingLocations(false);
          }
        );
      });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [isLocationDropdownOpen, locationSearch]);

  const toggleChannel = (channel: CampaignPlatformName) => {
    setSelectedChannels((current) =>
      current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]
    );
  };
  const selectedRoles = roleDetails.split(",").map((role) => role.trim()).filter(Boolean);
  const updateSelectedRoles = (roles: string[]) => setRoleDetails(roles.join(", "));
  const toggleRole = (role: string) => {
    updateSelectedRoles(selectedRoles.includes(role) ? selectedRoles.filter((item) => item !== role) : [...selectedRoles, role]);
  };
  const removeRole = (role: string) => updateSelectedRoles(selectedRoles.filter((item) => item !== role));
  const visibleRoles = selectedRoles.slice(0, 2);
  const additionalRoleCount = Math.max(selectedRoles.length - visibleRoles.length, 0);
  const filteredRoleOptions = roleOptions.filter((role) => role.toLowerCase().includes(roleSearch.trim().toLowerCase()));
  const selectedLocations = locationDetails.split(";").map((location) => location.trim()).filter(Boolean);
  const updateSelectedLocations = (locations: string[]) => setLocationDetails(locations.join("; "));
  const toggleLocation = (location: string) => {
    updateSelectedLocations(selectedLocations.includes(location) ? selectedLocations.filter((item) => item !== location) : [...selectedLocations, location]);
    setLocationSearch("");
  };
  const removeLocation = (location: string) => updateSelectedLocations(selectedLocations.filter((item) => item !== location));
  const visibleLocations = selectedLocations.slice(0, 2);
  const additionalLocationCount = Math.max(selectedLocations.length - visibleLocations.length, 0);
  const googleLocationLabels = googleLocationOptions.map((location) => location.description);
  const availableLocationOptions = Array.from(new Set([...googleLocationLabels, ...selectedLocations]));
  const filteredLocationOptions = availableLocationOptions.filter((location) => location.toLowerCase().includes(locationSearch.trim().toLowerCase()));
  const canUseTypedLocation =
    locationSearch.trim().length > 1 &&
    !filteredLocationOptions.some((location) => location.toLowerCase() === locationSearch.trim().toLowerCase());
  const canContinue = Boolean(campaignName.trim() && dueDate && selectedChannels.length && selectedCtaDestination);

  return (
    <main className="campaign-studio campaign-studio--wizard">
      <header className="cs-wizard-header">
        <div>
          <button className="cs-back-edit" onClick={onBack}>
            <span aria-hidden="true">‹</span> Back to Campaigns Studio
          </button>
        </div>
        <CampaignWizardHeader activeStep={1} />
      </header>
      <section className="cs-wizard-page">
        <section className="cs-wizard-section cs-details-step">
            <div className="cs-details-step__intro">
              <h2>Campaign details</h2>
              <p>Review and adjust the auto-filled fields before continuing.</p>
            </div>
            <div className="cs-details-form">
              <div className="cs-field">
                <label>Campaign title <span className="cs-required">*</span><span className="cs-ai-badge">AI filled</span></label>
                <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} />
              </div>
              <div className="cs-field cs-date-field">
                <label>Expected publish date <span className="cs-required">*</span></label>
                <DatePickerField value={dueDate} onChange={setDueDate} />
              </div>
              <div className="cs-field">
                <label>Tone of voice <span className="cs-required">*</span><span className="cs-ai-badge">AI filled</span></label>
                <SingleSelectDropdown
                  value={tone}
                  options={toneOptions.map((option) => ({ value: option, label: option }))}
                  onChange={setTone}
                  placeholder="Select tone"
                />
              </div>
              <div className="cs-field cs-prompt-connector-field">
                <label>Prompt</label>
                <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={5} />
              </div>
              <div className="cs-extracted-card">
                <div className="cs-extracted-card__header">
                  <strong><span aria-hidden="true">✦</span> Additional details - extracted from prompt</strong>
                </div>
                <div className="cs-extracted-card__body">
                  <div className="cs-field">
                    <label>Job category <span className="cs-ai-badge">AI filled</span></label>
                    <SingleSelectDropdown
                      value={jobCategory}
                      options={jobCategoryOptions.map((option) => ({ value: option, label: option }))}
                      onChange={setJobCategory}
                      placeholder="Select job category"
                    />
                  </div>
                  <div className="cs-field cs-role-select" ref={roleDropdownRef}>
                    <label>Role(s) <span className="cs-ai-badge">AI filled</span></label>
                    <div
                      className={`cs-role-select__control ${isRoleDropdownOpen ? "is-open" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      aria-expanded={isRoleDropdownOpen}
                      onClick={() => {
                        setIsLocationDropdownOpen(false);
                        setIsRoleDropdownOpen((current) => !current);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setIsLocationDropdownOpen(false);
                          setIsRoleDropdownOpen((current) => !current);
                        }
                      }}
                    >
                      {selectedRoles.length ? (
                        <span className="cs-role-tags">
                          {visibleRoles.map((role) => (
                            <span className="cs-role-tag" key={role}>
                              <span>{role}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${role}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeRole(role);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {additionalRoleCount > 0 && <span className="cs-role-tag cs-role-tag--count">+{additionalRoleCount}</span>}
                        </span>
                      ) : (
                        <span className="cs-role-select__placeholder">Select roles</span>
                      )}
                      {selectedRoles.length > 0 && (
                        <button
                          type="button"
                          className="cs-role-select__clear"
                          aria-label="Clear selected roles"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateSelectedRoles([]);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {isRoleDropdownOpen && (
                      <div className="cs-role-select__menu" role="listbox" aria-multiselectable="true">
                        <div className="cs-role-select__search">
                          <span aria-hidden="true" />
                          <input
                            value={roleSearch}
                            placeholder="Search"
                            onChange={(event) => setRoleSearch(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </div>
                        {filteredRoleOptions.map((role) => (
                          <button
                            type="button"
                            key={role}
                            className={selectedRoles.includes(role) ? "is-selected" : ""}
                            role="option"
                            aria-selected={selectedRoles.includes(role)}
                            onClick={() => toggleRole(role)}
                          >
                            <span className="cs-role-select__checkbox" aria-hidden="true" />
                            <span>{role}</span>
                          </button>
                        ))}
                        {!filteredRoleOptions.length && <div className="cs-role-select__empty">No roles found</div>}
                      </div>
                    )}
                  </div>
                  <div className="cs-field cs-role-select cs-location-field" ref={locationDropdownRef}>
                    <label>Location <span className="cs-ai-badge">AI filled</span></label>
                    <div className={`cs-location-searchbox ${isLocationDropdownOpen ? "is-open" : ""}`}>
                      <img className="cs-location-searchbox__icon" src={searchIcon} alt="" />
                      {selectedLocations.length > 0 && (
                        <span className="cs-role-tags">
                          {visibleLocations.map((location) => (
                            <span className="cs-role-tag" key={location}>
                              <span>{location}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${location}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeLocation(location);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {additionalLocationCount > 0 && <span className="cs-role-tag cs-role-tag--count">+{additionalLocationCount}</span>}
                        </span>
                      )}
                      <input
                        value={locationSearch}
                        placeholder={selectedLocations.length ? "Add location" : "Search any location"}
                        aria-label="Search locations"
                        aria-haspopup="listbox"
                        aria-expanded={isLocationDropdownOpen}
                        onFocus={() => {
                          setIsRoleDropdownOpen(false);
                          setIsLocationDropdownOpen(true);
                        }}
                        onChange={(event) => {
                          setLocationSearch(event.target.value);
                          setIsLocationDropdownOpen(true);
                        }}
                      />
                      {selectedLocations.length > 0 && (
                        <button
                          type="button"
                          className="cs-location-searchbox__clear"
                          aria-label="Clear selected locations"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateSelectedLocations([]);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {isLocationDropdownOpen && (
                      <div className="cs-role-select__menu" role="listbox" aria-multiselectable="true">
                        {isLoadingLocations && <div className="cs-role-select__empty">Searching Google locations...</div>}
                        {filteredLocationOptions.map((location) => (
                          <button
                            type="button"
                            key={location}
                            className={selectedLocations.includes(location) ? "is-selected" : ""}
                            role="option"
                            aria-selected={selectedLocations.includes(location)}
                            onClick={() => toggleLocation(location)}
                          >
                            <span className="cs-role-select__checkbox" aria-hidden="true" />
                            <span>{location}</span>
                          </button>
                        ))}
                        {canUseTypedLocation && (
                          <button
                            type="button"
                            role="option"
                            aria-selected={selectedLocations.includes(locationSearch.trim())}
                            onClick={() => toggleLocation(locationSearch.trim())}
                          >
                            <span className="cs-role-select__checkbox" aria-hidden="true" />
                            <span>Use "{locationSearch.trim()}"</span>
                          </button>
                        )}
                        {!isLoadingLocations && !filteredLocationOptions.length && !canUseTypedLocation && <div className="cs-role-select__empty">No locations found</div>}
                      </div>
                    )}
                  </div>
                  {shouldShowEventContext && (
                    <div className="cs-field cs-event-context-field">
                      <label>Event <span className="cs-ai-badge">AI filled</span></label>
                      <SingleSelectDropdown
                        value={selectedCtaEvent}
                        options={ctaEventOptions}
                        onChange={setSelectedCtaEvent}
                        placeholder="Select event"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="cs-extracted-card cs-cta-card">
                <div className="cs-extracted-card__header cs-cta-card__header">
                  <strong>CTA destination <span className="cs-required">*</span></strong>
                </div>
                <div className="cs-extracted-card__body cs-cta-destination-field">
                  <div className="cs-cta-type-selector" role="tablist" aria-label="CTA destination type">
                    {[
                      { value: "page", label: "Page" },
                      { value: "job", label: "Job" },
                      { value: "event", label: "Event" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={ctaDestinationType === option.value ? "is-active" : ""}
                        role="tab"
                        aria-selected={ctaDestinationType === option.value}
                        onClick={() => setCtaDestinationType(option.value as "page" | "job" | "event")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {ctaDestinationType === "page" && (
                    <div className="cs-cta-destination-grid">
                      <div className="cs-field">
                        <label>Locale</label>
                        <SingleSelectDropdown
                          value={selectedCtaLocale}
                          options={ctaLocaleOptions}
                          onChange={setSelectedCtaLocale}
                          placeholder="Select locale"
                        />
                      </div>
                      <div className="cs-field">
                        <label>Persona</label>
                        <SingleSelectDropdown
                          value={selectedCtaPersona}
                          options={ctaPersonaOptions}
                          onChange={setSelectedCtaPersona}
                          placeholder="Select persona"
                        />
                      </div>
                      <div className="cs-field">
                        <label>Page</label>
                        <SingleSelectDropdown
                          value={selectedCtaPageValue}
                          options={cmsDestinationPages.map((page) => ({ value: page.value, label: page.label }))}
                          onChange={(nextValue) => {
                            setSelectedCtaPageValue(nextValue);
                            setSelectedCtaSubpageValue("");
                          }}
                          placeholder="Select page"
                        />
                      </div>
                    </div>
                  )}
                  {ctaDestinationType === "job" && (
                    <div className="cs-field cs-cta-destination-single">
                      <label>Jobs</label>
                      <SingleSelectDropdown
                        value={selectedCtaJob}
                        options={ctaJobOptions}
                        onChange={setSelectedCtaJob}
                        placeholder="Select job"
                      />
                    </div>
                  )}
                  {ctaDestinationType === "event" && (
                    <div className="cs-field cs-cta-destination-single">
                      <label>Event</label>
                      <SingleSelectDropdown
                        value={selectedCtaEvent}
                        options={ctaEventOptions}
                        onChange={setSelectedCtaEvent}
                        placeholder="Select event"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="cs-field cs-channels-field">
                <label>Channels <span className="cs-required">*</span></label>
                <div className="cs-channel-picker">
                  {channelOptions.map((channel) => (
                    <button
                      type="button"
                      key={channel}
                      className={selectedChannels.includes(channel) ? "is-selected" : ""}
                      onClick={() => toggleChannel(channel)}
                    >
                      <span className="cs-channel-check" aria-hidden="true">{selectedChannels.includes(channel) ? "✓" : ""}</span>
                      <span>{getChannelSelectionLabel(channel)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </section>
        <footer className="cs-wizard-footer">
          <div className="cs-wizard-footer__actions">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!canContinue}
              onClick={() => onStart(createCampaignFromBrief(effectiveBrief, selectedChannels, campaignName, tone, dueDate, selectedCtaDestination))}
            >
              Continue
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

const LoadingPage = ({ onDone, onExit, showWizardProgress = false, campaign }: { onDone: () => void; onExit?: () => void; showWizardProgress?: boolean; campaign?: Campaign }) => {
  const [step, setStep] = useState(0);
  const progress = Math.min((step + 1) * 20, 100);
  const skeletonCount = Math.max(campaign?.platforms.length || 4, 1);

  useLayoutEffect(() => {
    if (showWizardProgress) scrollPageToTop();
  }, [showWizardProgress]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStep((current) => {
        if (current >= generationSteps.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(onDone, 450);
          return current;
        }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(interval);
  }, [onDone]);

  const progressContent = (
    <div className="cs-generation__progress">
      <div className="cs-generation__progress-copy">
        <strong>{generationSteps[step]}</strong>
        <span>{progress}%</span>
      </div>
      <div className="cs-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="cs-skeleton-grid">
        {Array.from({ length: skeletonCount }, (_, index) => <div key={index} className="cs-skeleton-card" />)}
      </div>
    </div>
  );

  if (showWizardProgress) {
    return (
      <main className="campaign-studio campaign-studio--wizard campaign-studio--generating-wizard">
        <header className="cs-wizard-header">
          <div>
            {onExit && <BackToCampaignStudioLink onClick={onExit} />}
          </div>
          <CampaignWizardHeader activeStep={2} />
        </header>
        <section className="cs-wizard-page">
          <section className="cs-wizard-section cs-details-step">
            <div className="cs-details-step__intro">
              <h2>Generating campaign assets</h2>
              <p>Your campaign is being built. Posts will appear here as they are ready.</p>
            </div>
            {progressContent}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="campaign-studio campaign-studio--generating">
      <div className="cs-generation">
        <div className="cs-generation__header">
          <div>
            {onExit && <BackEditLink onClick={onExit} />}
            <h1>Generating campaign assets</h1>
            <p>Your campaign is being built. Posts will appear here as they are ready.</p>
          </div>
        </div>
        {progressContent}
      </div>
    </main>
  );
};

const PostPreview = ({
  post,
  onEdit,
  showAssetActions = false,
}: {
  post: CampaignPlatformOutput;
  onEdit?: (post: CampaignPlatformOutput) => void;
  showAssetActions?: boolean;
}) => {
  const tenantName = getSelectedTenantName();
  const meta = platformMeta[post.platform];
  const handle = meta.handle.replace("@tenant", `@${tenantName.replace(/\s+/g, "").toLowerCase()}`);
  const instagramName = handle.replace("@", "").split("·")[0].trim();
  const xHandle = handle.split("·")[0].trim();
  const postCopy = post.copy.replace(/Learn more:?\s+\S+/i, "").trim();
  const statsByPlatform: Record<CampaignPlatformName, string> = {
    LinkedIn: "1,607 · 112 Comments · 32,234 Views",
    Instagram: "1,248 likes",
    Facebook: "96 reactions / 14 comments / 11 shares",
    X: "8.7K views",
  };
  const visibleActions = meta.actions.slice(0, post.platform === "Facebook" ? 3 : 4);
  const copyPostText = () => {
    void navigator.clipboard?.writeText(post.copy);
  };
  const copyDestinationLink = () => {
    void navigator.clipboard?.writeText(post.utmLink || post.ctaDestination);
  };
  const downloadPostText = () => {
    const blob = new Blob([post.copy], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${post.platform.toLowerCase()}-campaign-content.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const assetActions = showAssetActions ? (
    <div className="cs-post__asset-actions" aria-label={`${post.platform} asset actions`}>
      <button type="button" className="cs-post__asset-action" onClick={downloadPostText}>
        <img src={downloadIcon} alt="" /> Download content
      </button>
      <button type="button" className="cs-post__asset-action" onClick={copyPostText}>
        <img src={copyIcon} alt="" /> Copy text
      </button>
      <button type="button" className="cs-post__asset-action" onClick={copyDestinationLink}>
        <svg className="cs-post__asset-action-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M8.2 11.8a3.1 3.1 0 0 0 4.4 0l2.8-2.8a3.1 3.1 0 0 0-4.4-4.4l-.7.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M11.8 8.2a3.1 3.1 0 0 0-4.4 0L4.6 11a3.1 3.1 0 0 0 4.4 4.4l.7-.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
        Copy destination link
      </button>
    </div>
  ) : null;

  if (post.platform === "LinkedIn") {
    return (
      <article className="cs-post cs-post--linkedin cs-linkedin-post">
        <div className="cs-post__platform-chip">
          <img src={channelLogoMap[post.platform]} alt="" />
          <span>{post.platform}</span>
        </div>
        {onEdit && <button className="cs-post__edit" onClick={() => onEdit(post)}>Edit</button>}
        {assetActions}
        <div className="cs-linkedin-post__header">
          <img className="cs-linkedin-post__avatar" src={dukeHealthLogo} alt={`${tenantName} logo`} />
          <div>
            <strong>{tenantName}</strong>
            <small>2,223,144 followers</small>
            <small>Promoted</small>
          </div>
        </div>
        <p className="cs-linkedin-post__copy">{postCopy}</p>
        <div className="cs-linkedin-post__image-wrap">
          <img src={post.image} alt={post.altText} />
        </div>
        <div className="cs-linkedin-post__link">
          <div>
            <strong>Your next career move starts here.</strong>
            <span>{new URL(post.ctaDestination).hostname}</span>
          </div>
          <button>Learn More</button>
        </div>
        <div className="cs-linkedin-post__stats">{statsByPlatform.LinkedIn}</div>
        <div className="cs-linkedin-post__actions">
          <span><img src={linkedinLikeOutlineIcon} alt="" /> Like</span>
          <span><img src={linkedinCommentOutlineIcon} alt="" /> Comment</span>
          <span><img src={linkedinShareOutlineIcon} alt="" /> Share</span>
        </div>
      </article>
    );
  }

  if (post.platform === "Instagram") {
    return (
      <article className="cs-post cs-post--instagram cs-instagram-post">
        <div className="cs-post__platform-chip">
          <img src={channelLogoMap[post.platform]} alt="" />
          <span>{post.platform}</span>
        </div>
        {onEdit && <button className="cs-post__edit" onClick={() => onEdit(post)}>Edit</button>}
        {assetActions}
        <div className="cs-instagram-post__header">
          <img className="cs-instagram-post__avatar" src={dukeHealthLogo} alt={`${tenantName} logo`} />
          <div>
            <strong>{instagramName}</strong>
            <small>Sponsored campaign</small>
          </div>
        </div>
        <div className="cs-instagram-post__image-wrap">
          <img src={post.image} alt={post.altText} />
        </div>
        <div className="cs-instagram-post__actions" aria-label="Instagram post actions">
          <div>
            <img src={heartIcon} alt="" />
            <img src={commentIcon} alt="" />
            <img src={paperPlaneIcon} alt="" />
          </div>
          <img src={bookmarkIcon} alt="" />
        </div>
        <div className="cs-instagram-post__likes">{statsByPlatform.Instagram}</div>
        <p className="cs-instagram-post__caption">
          <strong>{instagramName}</strong> {postCopy} <span>more</span>
        </p>
      </article>
    );
  }

  if (post.platform === "Facebook") {
    return (
      <article className="cs-post cs-post--facebook cs-facebook-post">
        <div className="cs-post__platform-chip">
          <img src={channelLogoMap[post.platform]} alt="" />
          <span>{post.platform}</span>
        </div>
        {onEdit && <button className="cs-post__edit" onClick={() => onEdit(post)}>Edit</button>}
        {assetActions}
        <div className="cs-facebook-post__header">
          <img className="cs-facebook-post__avatar" src={dukeHealthLogo} alt={`${tenantName} logo`} />
          <div>
            <strong>{tenantName}</strong>
            <small>Sponsored · <span aria-hidden="true">🌐</span></small>
          </div>
        </div>
        <p className="cs-facebook-post__copy">{postCopy}</p>
        <div className="cs-facebook-post__image-wrap">
          <img src={post.image} alt={post.altText} />
        </div>
        <div className="cs-facebook-post__link">
          <span className="cs-facebook-post__domain">
            <img src={dukeHealthLogo} alt="" />
            {new URL(post.ctaDestination).hostname.toUpperCase()}
          </span>
          <strong>Your next career move starts here.</strong>
          <p>Explore open roles and learn why this opportunity could be the right fit for you.</p>
          <button>Learn more</button>
        </div>
        <div className="cs-facebook-post__engagement">
          <span className="cs-facebook-post__reactions">
            <img src={facebookReactionLikeIcon} alt="" />
            <img src={facebookReactionLoveIcon} alt="" />
            Oliver, Sofia and 28 others
          </span>
          <span>14 Comments · 7 Shares</span>
        </div>
        <div className="cs-facebook-post__actions">
          <span><img src={facebookLikeOutlineIcon} alt="" /> Like</span>
          <span><img src={facebookCommentOutlineIcon} alt="" /> Comment</span>
          <span><img src={facebookShareOutlineIcon} alt="" /> Share</span>
        </div>
      </article>
    );
  }

  if (post.platform === "X") {
    return (
      <article className="cs-post cs-post--x cs-x-post">
        <div className="cs-post__platform-chip">
          <img src={channelLogoMap[post.platform]} alt="" />
          <span>{post.platform}</span>
        </div>
        {onEdit && <button className="cs-post__edit" onClick={() => onEdit(post)}>Edit</button>}
        {assetActions}
        <div className="cs-x-post__header">
          <img className="cs-x-post__avatar" src={dukeHealthLogo} alt={`${tenantName} logo`} />
          <div>
            <strong>
              {tenantName}
              <span className="cs-x-post__verified" aria-label="Verified">✓</span>
            </strong>
            <small>{xHandle}</small>
          </div>
        </div>
        <p className="cs-x-post__copy">
          {postCopy.split(/(#[A-Za-z0-9_]+)/g).map((part, index) => (
            part.startsWith("#")
              ? <span key={`${part}-${index}`}>{part}</span>
              : part
          ))}
        </p>
        <div className="cs-x-post__image-wrap">
          <img src={post.image} alt={post.altText} />
        </div>
        <div className="cs-x-post__actions">
          <span><img src={commentIcon} alt="" />34</span>
          <span><img src={retweetIcon} alt="" />2.3K</span>
          <span><img src={heartIcon} alt="" />10.9K</span>
          <span><img src={chartIcon} alt="" />150K</span>
          <span><img src={xShareOutlineIcon} alt="" /></span>
        </div>
      </article>
    );
  }

  return (
    <article className={`cs-post cs-post--${post.platform.toLowerCase()}`}>
      <div className="cs-post__platform-chip">
        <img src={channelLogoMap[post.platform]} alt="" />
        <span>{post.platform}</span>
      </div>
      {onEdit && <button className="cs-post__edit" onClick={() => onEdit(post)}>Edit</button>}
      {assetActions}
      <div className="cs-post__head">
        <img className="cs-post__avatar" src={dukeHealthLogo} alt={`${tenantName} logo`} />
        <div>
          <strong>{tenantName}</strong>
          <small>{handle}</small>
        </div>
      </div>
      <p className="cs-post__copy">
        {postCopy} <a href={post.ctaDestination}>Learn more</a>
      </p>
      <div className="cs-post__image-wrap">
        <img src={post.image} alt={post.altText} />
      </div>
      <div className="cs-post__stats">{statsByPlatform[post.platform]}</div>
      <div className="cs-post__actions">
        {visibleActions.map((action) => (
          <span key={action}>
            <img src={actionIconMap[action]} alt="" /> {action}
          </span>
        ))}
      </div>
    </article>
  );
};

const ExportRows = ({
  campaign,
  buttonVariant = "secondary",
  buttonClassName = "",
}: {
  campaign: Campaign;
  buttonVariant?: "secondary" | "ghost";
  buttonClassName?: string;
}) => (
  <div className="cs-export-table">
    {campaign.platforms.map((platform) => (
      <div key={platform.platform} className="cs-export-row">
        <strong>{platform.platform}</strong>
        <div>
          <Button variant={buttonVariant} className={buttonClassName}><img src={downloadIcon} alt="" /> Download Asset</Button>
          <Button variant={buttonVariant} className={buttonClassName}><img src={copyIcon} alt="" /> Copy Text</Button>
        </div>
      </div>
    ))}
  </div>
);

const SaveModal = ({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) => (
  <Modal title="" onClose={onClose} className="cs-save-confirmation-modal">
    <div className="cs-modal__body cs-save-modal">
      <button className="cs-icon-button cs-save-modal__close" onClick={onClose} aria-label="Close">×</button>
      <div className="cs-save-modal__hero">
        <span className="cs-save-modal__icon">
          <img src={tickIcon} alt="" />
        </span>
        <h2>Your campaign has been saved</h2>
        <p>{campaign.name} is now available in the Created campaigns table.</p>
      </div>
      <div className="cs-save-modal__actions">
        <Button variant="secondary" onClick={onClose}>
          <svg className="cs-btn__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M9.8 3.5 5.3 8l4.5 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
          Back to Campaign Studio
        </Button>
        <Button variant="primary" onClick={() => downloadCampaignContentZip(campaign)}>
          <svg className="cs-btn__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M10 3v9m0 0L6.5 8.5M10 12l3.5-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            <path d="M4 14.5v1A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          </svg>
          Download all assets as zip
        </Button>
      </div>
    </div>
  </Modal>
);

const ExportModal = ({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) => (
  <Modal title="" onClose={onClose} className="cs-save-confirmation-modal">
    <div className="cs-modal__body cs-save-modal">
      <button className="cs-icon-button cs-save-modal__close" onClick={onClose} aria-label="Close">×</button>
      <div className="cs-save-modal__hero">
        <span className="cs-save-modal__icon">
          <img src={downloadIcon} alt="" />
        </span>
        <h2>Download and copy assets</h2>
        <p>Export the generated assets and copy channel-ready text for {campaign.name}.</p>
      </div>
      <ExportRows campaign={campaign} buttonVariant="ghost" buttonClassName="cs-btn--secondary-ghost" />
    </div>
  </Modal>
);

const DeleteCampaignModal = ({
  campaign,
  onCancel,
  onConfirm,
}: {
  campaign: Campaign;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal title="Delete campaign" onClose={onCancel}>
    <div className="cs-modal__body cs-delete-modal__body">
      <p>Are you sure you want to delete the <strong>{campaign.name}</strong> campaign?</p>
    </div>
    <div className="cs-modal__footer">
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>Delete campaign</Button>
    </div>
  </Modal>
);

const UpdatePublishDateModal = ({
  value,
  onCancel,
  onConfirm,
}: {
  value: string;
  onCancel: () => void;
  onConfirm: (publishDate: string) => void;
}) => {
  const [publishDate, setPublishDate] = useState(value);

  return (
    <Modal title="Update publish date" onClose={onCancel} className="cs-update-publish-modal">
      <div className="cs-modal__body">
        <div className="cs-field cs-date-field">
          <label>Publish date</label>
          <DatePickerField value={publishDate} onChange={setPublishDate} />
        </div>
      </div>
      <div className="cs-modal__footer">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" disabled={!publishDate} onClick={() => onConfirm(publishDate)}>Update publish date</Button>
      </div>
    </Modal>
  );
};

const PreviewModal = ({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) => (
  <OverlayPortal>
    <div className="cs-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cs-modal cs-modal--lg cs-preview-modal">
        <div className="cs-preview-modal__header">
          <span>Preview</span>
          <h2>{campaign.name}</h2>
          <p>Review the generated posts for this campaign.</p>
          <button className="cs-icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="cs-modal__body cs-preview-grid">
          {[0, 1].map((columnIndex) => (
            <div className="cs-preview-grid__column" key={columnIndex}>
              {(campaign.platforms || [])
                .filter((_, index) => index % 2 === columnIndex)
                .map((platform) => <PostPreview key={platform.platform} post={platform} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  </OverlayPortal>
);

const EditDrawer = ({
  post,
  onClose,
  onSave,
}: {
  post: CampaignPlatformOutput;
  onClose: () => void;
  onSave: (post: CampaignPlatformOutput) => void;
}) => {
  const [draft, setDraft] = useState<CampaignPlatformOutput>({ ...post, copy: stripGeneratedLinksFromCopy(post.copy) });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(post.image);
  const selectedImageOption = imageOptions.find((option) => option.src === selectedImageSrc) || imageOptions[0];
  const openImageModal = () => {
    setSelectedImageSrc(draft.image);
    setShowImageModal(true);
  };
  const confirmImageReplacement = () => {
    setDraft({ ...draft, image: selectedImageOption.src, altText: `${selectedImageOption.label} for ${post.platform}` });
    setShowImageModal(false);
  };

  return (
    <OverlayPortal>
      <div className="cs-drawer-backdrop">
        <aside className="cs-drawer">
          <div className="cs-drawer__header">
            <span>Edit</span>
            <h2>{post.platform} content</h2>
            <button className="cs-icon-button cs-drawer__close" onClick={onClose} aria-label="Close edit panel">
              <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                <path d="M4.8 4.8 13.2 13.2M13.2 4.8 4.8 13.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <div className="cs-drawer__body">
            <div className="cs-field cs-post-copy-field">
              <label>Post copy</label>
              <div className="cs-post-copy-editor">
                <textarea rows={8} value={draft.copy} onChange={(event) => setDraft({ ...draft, copy: event.target.value })} />
              </div>
            </div>
            <div className="cs-field">
              <label>Image asset</label>
              <div className="cs-drawer__image-wrap">
                <img className="cs-drawer__image" src={draft.image} alt={draft.altText} />
                <Button variant="secondary" className="cs-drawer__regen" onClick={openImageModal}>
                  <svg className="cs-drawer__regen-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M13.2 8.2a5.2 5.2 0 0 1-8.9 3.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                    <path d="M2.8 7.8a5.2 5.2 0 0 1 8.9-3.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                    <path d="M11.8 1.9v2.5H9.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                    <path d="M4.2 14.1v-2.5h2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                  </svg>
                  Replace image
                </Button>
              </div>
            </div>
            <div className="cs-field">
              <label>Image alt text</label>
              <input value={draft.altText} onChange={(event) => setDraft({ ...draft, altText: event.target.value })} />
            </div>
          </div>
          <div className="cs-drawer__footer">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => onSave(draft)}>Save changes</Button>
          </div>
        </aside>
        {showImageModal && (
          <Modal title="Replace image" onClose={() => setShowImageModal(false)} size="lg" className="cs-replace-image-modal">
            <div className="cs-modal__body cs-replace-image-modal__body">
              <aside className="cs-replace-image-modal__filters" aria-label="Image asset filters">
                <div className="cs-replace-image-modal__filter-group">
                  <strong>Upload date</strong>
                  {["Today", "Current week", "Current month", "Custom ranges"].map((filter, index) => (
                    <label key={filter}><span className={index === 0 ? "is-selected" : ""} aria-hidden="true" />{filter}</label>
                  ))}
                </div>
                <div className="cs-replace-image-modal__filter-group">
                  <strong>Last Modified</strong>
                  {["Today", "Current week", "Current month", "Custom ranges"].map((filter, index) => (
                    <label key={filter}><span className={index === 0 ? "is-selected" : ""} aria-hidden="true" />{filter}</label>
                  ))}
                </div>
              </aside>
              <section className="cs-replace-image-modal__content">
                <div className="cs-replace-image-modal__toolbar">
                  <div className="cs-replace-image-modal__search">
                    <span aria-hidden="true" />
                    <input placeholder="Search image" aria-label="Search image" />
                  </div>
                </div>
                <div className="cs-replace-image-modal__content-header">
                  <h3>Images ({imageOptions.length})</h3>
                </div>
                <div className="cs-image-options">
                  {imageOptions.map((option) => (
                    <button
                      type="button"
                      key={option.src}
                      className={selectedImageSrc === option.src ? "is-selected" : ""}
                      onClick={() => setSelectedImageSrc(option.src)}
                    >
                      <span className="cs-image-options__preview">
                        <img src={option.src} alt="" />
                        {selectedImageSrc === option.src && <span className="cs-image-options__check" aria-hidden="true">✓</span>}
                      </span>
                      <span className="cs-image-options__meta">
                        <strong>{option.label}</strong>
                        <small>Campaign image · JPG</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="cs-modal__footer cs-replace-image-modal__footer">
              <Button variant="ghost" onClick={() => setShowImageModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmImageReplacement}>Replace image</Button>
            </div>
          </Modal>
        )}
      </div>
    </OverlayPortal>
  );
};

const CampaignTable = ({
  campaigns,
  onPreview,
  onExport,
  onDuplicate,
  onDelete,
}: {
  campaigns: Campaign[];
  onPreview: (campaign: Campaign) => void;
  onExport: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(".cs-actions-cell")) return;
      setOpenMenu(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenu]);

  return (
    <div className="cs-table-wrap">
      <table className="cs-table">
        <colgroup>
          <col className="cs-col-name" />
          <col className="cs-col-status" />
          <col className="cs-col-channels" />
          <col className="cs-col-metric" />
          <col className="cs-col-metric" />
          <col className="cs-col-metric" />
          <col className="cs-col-conversion" />
          <col className="cs-col-date" />
          <col className="cs-col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Status</th>
            <th>Channels Selected</th>
            <th>Clicks</th>
            <th>Application Starts</th>
            <th>Applications</th>
            <th>Conversion</th>
            <th>Date Created</th>
            <th aria-label="More actions" />
          </tr>
        </thead>
        <tbody>
          {!campaigns.length ? (
            <tr className="cs-table-empty-row">
              <td colSpan={9}>
                <div className="cs-table-empty-state">
                  <h3>No created campaigns</h3>
                  <p>Once you create a campaign it will appear in this table.</p>
                </div>
              </td>
            </tr>
          ) : campaigns.map((campaign) => {
            const tableStatus = getCampaignTableStatus(campaign);
            const orderedPlatforms = getOrderedCampaignPlatforms(campaign.platforms);

            return (
              <tr key={campaign.id}>
                <td>
                  <a
                    className="cs-link-button cs-campaign-name"
                    href="#preview-campaign"
                    title={campaign.name}
                    onClick={(event) => {
                      event.preventDefault();
                      onPreview(campaign);
                    }}
                  >
                    {campaign.name}
                  </a>
                </td>
                <td className="cs-status-cell">
                  <span className={`cs-status cs-status--${tableStatus.className}`} title={tableStatus.label}>
                    <span className="cs-status__label">{tableStatus.label}</span>
                  </span>
                </td>
                <td className="cs-channels-cell">
                  <div className="cs-channel-pills">
                    {orderedPlatforms.slice(0, 4).map((platform, index) => (
                      <span className={`cs-channel-pill-icon cs-channel-pill-icon--${index + 1}`} key={platform.platform} title={platform.platform}>
                        <img src={channelLogoMap[platform.platform]} alt={platform.platform} />
                      </span>
                    ))}
                    {orderedPlatforms.length > 5 && <span className="cs-channel-pill-count cs-channel-pill-count--default">+{orderedPlatforms.length - 4}</span>}
                    {orderedPlatforms.length > 4 && <span className="cs-channel-pill-count cs-channel-pill-count--plus-1">+{orderedPlatforms.length - 3}</span>}
                    {orderedPlatforms.length > 3 && <span className="cs-channel-pill-count cs-channel-pill-count--plus-2">+{orderedPlatforms.length - 2}</span>}
                  </div>
                </td>
                <td><MetricCell campaign={campaign} metric="clicks" /></td>
                <td><MetricCell campaign={campaign} metric="applicationStarts" /></td>
                <td><MetricCell campaign={campaign} metric="applications" /></td>
                <td><ConversionCell campaign={campaign} /></td>
                <td><span className="cs-table-text" title={formatDate(campaign.createdAt)}>{formatDate(campaign.createdAt)}</span></td>
                <td className="cs-actions-cell">
                  <button
                    className={`cs-more-button ${openMenu === campaign.id ? "is-open" : ""}`}
                    aria-label={`More actions for ${campaign.name}`}
                    aria-expanded={openMenu === campaign.id}
                    onClick={() => setOpenMenu(openMenu === campaign.id ? null : campaign.id)}
                  >
                    <span className="cs-more-button__dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                  {openMenu === campaign.id && (
                    <div className="cs-menu">
                      <button onClick={() => { setOpenMenu(null); onExport(campaign); }}><img src={downloadIcon} alt="" /> Download & Copy Content</button>
                      <button onClick={() => { setOpenMenu(null); onDuplicate(campaign); }}><img src={copyIcon} alt="" /> Duplicate Campaign</button>
                      <button onClick={() => { setOpenMenu(null); onDelete(campaign); }}><img src={trashIcon} alt="" /> Delete Campaign</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const CampaignStudioList: React.FC = () => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const refNum = refnum || getRefNum();
  const [prompt, setPrompt] = useState("");
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateDraft, setGenerateDraft] = useState<GenerateCampaignDraft | null>(null);
  const [pendingCampaign, setPendingCampaign] = useState<Campaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [exportCampaign, setExportCampaign] = useState<Campaign | null>(null);
  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState<Campaign | null>(null);

  const listPath = getCampaignStudioListPath(customerCode, refnum);

  const refreshCampaigns = () => {
    campaignStudioAdapter.listCampaigns(refNum).then(setCampaigns);
  };

  useEffect(refreshCampaigns, [refNum]);

  const openCampaignEditor = (campaign: Campaign) => {
    setGenerateDraft({
      prompt: getCampaignPrompt(campaign),
      campaignName: campaign.name,
      tone: campaign.tone,
      channels: campaign.platforms.map((platform) => platform.platform),
      dueDate: campaign.postDate,
    });
    setPrompt(getCampaignPrompt(campaign));
    setPendingCampaign(null);
    setIsGenerating(false);
    setShowGenerateModal(true);
  };

  const duplicateCampaign = (campaign: Campaign) => {
    setGenerateDraft({
      prompt: getCampaignPrompt(campaign),
      campaignName: getDuplicateCampaignName(campaign.name, campaigns),
      tone: campaign.tone,
      channels: campaign.platforms.map((platform) => platform.platform),
      dueDate: campaign.postDate,
    });
    setShowGenerateModal(true);
  };

  const confirmDeleteCampaign = async (campaign: Campaign) => {
    await campaignStudioAdapter.deleteCampaign(refNum, campaign.id);
    setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
    setDeleteCampaignTarget(null);
  };

  if (isGenerating && pendingCampaign) {
    return (
      <LoadingPage
        onDone={() => {
          scrollPageToTop();
          setIsGenerating(false);
        }}
        campaign={pendingCampaign}
        showWizardProgress
        onExit={() => {
          setPendingCampaign(null);
          navigate(listPath);
        }}
      />
    );
  }

  if (pendingCampaign) {
    return (
      <CampaignStudioWorkspace
        initialCampaign={pendingCampaign}
        showWizardProgress
        onBackEdit={openCampaignEditor}
        onSaved={(savedCampaign) => {
          setCampaigns((current) => [
            savedCampaign,
            ...current.filter((campaign) => campaign.id !== savedCampaign.id),
          ]);
        }}
        onExit={() => {
          setPendingCampaign(null);
          navigate(listPath);
        }}
      />
    );
  }

  if (showGenerateModal) {
    return (
      <GenerateCampaignModal
        prompt={generateDraft?.prompt || prompt}
        initialCampaignName={generateDraft?.campaignName}
        initialTone={generateDraft?.tone}
        initialChannels={generateDraft?.channels}
        initialDueDate={generateDraft?.dueDate}
        onBack={() => {
          setShowGenerateModal(false);
          setGenerateDraft(null);
        }}
        onStart={(campaign) => {
          scrollPageToTop();
          setShowGenerateModal(false);
          setGenerateDraft(null);
          setPendingCampaign(campaign);
          setIsGenerating(true);
        }}
      />
    );
  }

  return (
    <main className="campaign-studio">
      <header className="cs-page-header"><h1>Campaign Studio</h1></header>
      <section className="cs-prompt-panel">
        <h2>Generate new campaign</h2>
        <div className="cs-prompt-box">
          {!prompt.trim() && !isPromptFocused && (
            <p className="cs-prompt-tip">
              Tip: Start with who you want to reach, the role or roles you are hiring for, the location, and the tone you want the campaign to use.
            </p>
          )}
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onFocus={() => setIsPromptFocused(true)}
            onBlur={() => setIsPromptFocused(false)}
            placeholder=""
          />
          <div className="cs-prompt-actions">
            <button className="cs-enhance" disabled={!prompt.trim()}><img src={enhanceIcon} alt="" /> Enhance with X+</button>
            <button className="cs-generate-icon" disabled={!prompt.trim()} onClick={() => setShowGenerateModal(true)}>
              <img src={generateIcon} alt="" />
            </button>
          </div>
        </div>
        <h3>Or start with a template</h3>
        <div className="cs-template-grid">
          {templateCards.map((template) => (
            <button key={template.title} className="cs-template-card" onClick={() => setPrompt(`${defaultPrompt} ${template.prompt}`)}>
              <TemplateIcon type={template.icon} />
              <strong>{template.title}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="cs-table-section">
        <h2>Created campaigns</h2>
        <p>Track generated campaigns and review top-channel attribution from career-site UTM activity.</p>
        <CampaignTable
          campaigns={campaigns}
          onPreview={(campaign) => navigate(`${listPath}/${campaign.id}/dashboard`)}
          onExport={setExportCampaign}
          onDuplicate={duplicateCampaign}
          onDelete={setDeleteCampaignTarget}
        />
      </section>
      {previewCampaign && <PreviewModal campaign={previewCampaign} onClose={() => setPreviewCampaign(null)} />}
      {exportCampaign && <ExportModal campaign={exportCampaign} onClose={() => setExportCampaign(null)} />}
      {deleteCampaignTarget && (
        <DeleteCampaignModal
          campaign={deleteCampaignTarget}
          onCancel={() => setDeleteCampaignTarget(null)}
          onConfirm={() => confirmDeleteCampaign(deleteCampaignTarget)}
        />
      )}
    </main>
  );
};

export const CampaignStudioCreate: React.FC = () => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const refNum = refnum || getRefNum();
  const [prompt] = useState(defaultPrompt);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const listPath = getCampaignStudioListPath(customerCode, refnum);

  if (isGenerating && campaign) return <LoadingPage campaign={campaign} onDone={() => { scrollPageToTop(); setIsGenerating(false); }} onExit={() => setIsGenerating(false)} showWizardProgress />;
  if (campaign) return <CampaignStudioWorkspace initialCampaign={campaign} onExit={() => navigate(listPath)} showWizardProgress />;

  return (
    <GenerateCampaignModal
      prompt={prompt}
      onBack={() => navigate(listPath)}
      onStart={(nextCampaign) => {
        scrollPageToTop();
        setCampaign(nextCampaign);
        setIsGenerating(true);
      }}
    />
  );
};

export const CampaignStudioWorkspace: React.FC<{
  initialCampaign?: Campaign;
  onExit?: () => void;
  onSaved?: (campaign: Campaign) => void;
  onBackEdit?: (campaign: Campaign) => void;
  showWizardProgress?: boolean;
}> = ({ initialCampaign, onExit, onSaved, onBackEdit, showWizardProgress = false }) => {
  const navigate = useNavigate();
  const { customerCode, refnum } = useParams();
  const refNum = refnum || getRefNum();
  const [campaign, setCampaign] = useState<Campaign>(
    initialCampaign || createCampaignFromBrief(defaultPrompt, ["LinkedIn", "Instagram", "Facebook", "X"], makeCampaignName(defaultPrompt), toneOptions[0], new Date().toISOString().slice(0, 10))
  );
  const [editingPost, setEditingPost] = useState<CampaignPlatformOutput | null>(null);
  const [saveModalCampaign, setSaveModalCampaign] = useState<Campaign | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const listPath = getCampaignStudioListPath(customerCode, refnum);

  useLayoutEffect(() => {
    if (showWizardProgress) scrollPageToTop();
  }, [showWizardProgress]);

  const saveCampaign = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const savedCampaign = await campaignStudioAdapter.saveCampaign(refNum, campaign);
      setCampaign(savedCampaign);
      setSaved(true);
      onSaved?.(savedCampaign);
      setSaveModalCampaign(savedCampaign);
    } catch {
      setSaveError("We couldn't save this campaign. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeSaveModal = () => {
    setSaveModalCampaign(null);
    onExit ? onExit() : navigate(listPath);
  };

  const savePost = (post: CampaignPlatformOutput) => {
    setCampaign((current) => ({
      ...current,
      platforms: current.platforms.map((platform) => (platform.platform === post.platform ? post : platform)),
    }));
    setEditingPost(null);
  };

  return (
    <main className={`campaign-studio ${showWizardProgress ? "campaign-studio--wizard campaign-studio--assets-step" : ""}`}>
      {showWizardProgress && (
        <header className="cs-wizard-header">
          <div>
            <BackToCampaignStudioLink onClick={() => (onExit ? onExit() : navigate(listPath))} />
          </div>
          <CampaignWizardHeader activeStep={2} />
        </header>
      )}
      <section className={showWizardProgress ? "cs-wizard-page" : "cs-assets-page"}>
        <section className={showWizardProgress ? "cs-wizard-section cs-details-step" : ""}>
          <header className="cs-assets-header">
            <div>
              {!showWizardProgress && <BackEditLink onClick={() => (onBackEdit ? onBackEdit(campaign) : navigate(listPath))} />}
              {showWizardProgress ? (
                <div className="cs-details-step__intro">
                  <h2>Generated campaign assets</h2>
                  <p>Review all AI-generated social content in one place. Hover any piece to edit the asset.</p>
                </div>
              ) : (
                <>
                  <h1>Generated campaign assets</h1>
                  <p>Review all AI-generated social content in one place. Hover any piece to edit the asset.</p>
                </>
              )}
            </div>
            <div className="cs-assets-actions">
              <Button variant={saved ? "secondary" : "primary"} onClick={saveCampaign} disabled={isSaving}>
                {saved && <img src={tickIcon} alt="" />} {isSaving ? "Saving..." : saved ? "Campaign saved" : "Save campaign"}
              </Button>
            </div>
          </header>
          {(saved || saveError) && (
            <div className={`cs-save-feedback ${saveError ? "cs-save-feedback--error" : ""}`}>
              {!saveError && <img src={tickIcon} alt="" />}
              <span>{saveError || "Campaign saved. It will appear in the Created campaigns table."}</span>
            </div>
          )}
          <section className="cs-masonry">
            {[0, 1].map((columnIndex) => (
              <div className="cs-masonry__column" key={columnIndex}>
                {campaign.platforms
                  .filter((_, platformIndex) => platformIndex % 2 === columnIndex)
                  .map((platform) => <PostPreview key={platform.platform} post={platform} onEdit={setEditingPost} />)}
              </div>
            ))}
          </section>
          {showWizardProgress && (
            <footer className="cs-wizard-footer cs-wizard-footer--assets">
              <div className="cs-wizard-footer__actions">
                <Button variant="secondary" onClick={() => (onExit ? onExit() : navigate(listPath))}>
                  Cancel
                </Button>
                <Button variant={saved ? "secondary" : "primary"} onClick={saveCampaign} disabled={isSaving}>
                  {saved && <img src={tickIcon} alt="" />} {isSaving ? "Saving..." : saved ? "Campaign saved" : "Save campaign"}
                </Button>
              </div>
            </footer>
          )}
        </section>
      </section>
      {editingPost && <EditDrawer post={editingPost} onClose={() => setEditingPost(null)} onSave={savePost} />}
      {saveModalCampaign && <SaveModal campaign={saveModalCampaign} onClose={closeSaveModal} />}
    </main>
  );
};

export const CampaignStudioDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isUpdatingPublishDate, setIsUpdatingPublishDate] = useState(false);
  const navigate = useNavigate();
  const { customerCode, refnum, campaignId } = useParams();
  const refNum = refnum || getRefNum();
  const listPath = getCampaignStudioListPath(customerCode, refnum);

  useEffect(() => {
    campaignStudioAdapter.listCampaigns(refNum).then(setCampaigns);
  }, [refNum]);

  const campaign = campaigns.find((item) => item.id === campaignId) || campaigns[0];
  const channelNames = campaign?.platforms.map((platform) => platform.platform).join(", ") || "LinkedIn";
  const overviewStatus = campaign ? getCampaignTableStatus(campaign) : { label: "Published", className: "published" };
  const tokenParsed = (window as any).keycloakInstance?.tokenParsed;
  const loggedUserDetails = tokenParsed?.userDetails;
  const createdByName =
    tokenParsed?.name ||
    loggedUserDetails?.displayName ||
    [loggedUserDetails?.firstName, loggedUserDetails?.lastName].filter(Boolean).join(" ") ||
    loggedUserDetails?.userName ||
    "Local Preview User";
  const overviewAssetColumns = campaign
    ? [0, 1, 2].map((columnIndex) => campaign.platforms.filter((_, platformIndex) => platformIndex % 3 === columnIndex))
    : [];
  const updatePublishDate = async (publishDate: string) => {
    if (!campaign) return;
    const updatedCampaign: Campaign = {
      ...campaign,
      postDate: publishDate,
      platforms: campaign.platforms.map((platform) => ({ ...platform, postDate: publishDate })),
    };
    setCampaigns((current) => current.map((item) => (item.id === campaign.id ? updatedCampaign : item)));
    setIsUpdatingPublishDate(false);
    await campaignStudioAdapter.saveCampaign(refNum, updatedCampaign);
  };

  return (
    <main className="campaign-studio">
      <section className="cs-overview">
        <div className="cs-overview__topbar">
          <button className="cs-back-edit cs-overview__back" onClick={() => navigate(listPath)}>
            <span aria-hidden="true">‹</span> Back to Campaigns Studio
          </button>
        </div>
        {campaign ? (
          <>
            <div className="cs-overview__header">
              <div>
                <div className="cs-overview__title-row">
                  <h1>{campaign.name}</h1>
                  <span className={`cs-status cs-status--${overviewStatus.className}`}>{overviewStatus.label}</span>
                </div>
                <dl className="cs-overview__details">
                  <div><dt>Role</dt><dd>{campaign.role}</dd></div>
                  <div><dt>Location</dt><dd>{campaign.location}</dd></div>
                  <div><dt>Tone</dt><dd>{campaign.tone}</dd></div>
                  <div><dt>Publish date</dt><dd>{formatDisplayDate(campaign.postDate) || formatDate(campaign.postDate)}</dd></div>
                  <div><dt>Created by</dt><dd>{createdByName}</dd></div>
                  <div><dt>Creation date</dt><dd>{formatDate(campaign.createdAt)}</dd></div>
                  <div><dt>Channels</dt><dd>{channelNames}</dd></div>
                </dl>
              </div>
              <div className="cs-overview__actions">
                <Button variant="secondary" onClick={() => setIsUpdatingPublishDate(true)}>
                  <img src={calendarIcon} alt="" /> Update Publish date
                </Button>
                <Button variant="primary" onClick={() => downloadCampaignContentZip(campaign)}>
                  <img src={downloadIcon} alt="" /> Download all content as zip
                </Button>
              </div>
            </div>

            <CampaignSankeyDiagram campaign={campaign} />

            <section className="cs-overview-assets">
              <div className="cs-overview-assets__header">
                <div>
                  <h2>View created assets</h2>
                </div>
              </div>
              <div className="cs-overview-assets__grid">
                {overviewAssetColumns.map((column, columnIndex) => (
                  <div className="cs-overview-assets__column" key={columnIndex}>
                    {column.map((platform) => (
                      <PostPreview key={platform.id} post={platform} showAssetActions />
                    ))}
                  </div>
                ))}
              </div>
            </section>
            {isUpdatingPublishDate && (
              <UpdatePublishDateModal
                value={campaign.postDate}
                onCancel={() => setIsUpdatingPublishDate(false)}
                onConfirm={updatePublishDate}
              />
            )}
          </>
        ) : (
          <div className="cs-overview-card">
            <h2>Campaign not found</h2>
            <p>Go back to the campaign table and select a campaign to review.</p>
          </div>
        )}
      </section>
    </main>
  );
};
