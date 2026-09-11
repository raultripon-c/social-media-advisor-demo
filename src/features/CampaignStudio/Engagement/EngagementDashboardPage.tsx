import { Avatar, Table } from "@phenom/react-ui-components";
import React, { useMemo, useState } from "react";

import infoIcon from "../../../assets/svg/info.svg";
import facebookLogo from "../../../assets/svg/social/facebook-logo.svg";
import instagramLogo from "../../../assets/svg/social/instagram-logo.svg";
import linkedinLogo from "../../../assets/svg/social/linkedin-logo.svg";
import xLogo from "../../../assets/svg/social/x-logo.svg";
import { CampaignStudioSubNav } from "../ContentBoard/CampaignStudioSubNav";
import { UiDropdown } from "../UiDropdown";
import {
  getAdminEngagementData,
  getEngagementTypeColor,
  getNetworkColor,
} from "./engagementData";
import type { AdminEngagementData, AdminOverviewKpi } from "./engagementTypes";
import "../CampaignStudio.css";
import "../ContentBoard/ContentBoard.css";
import "./EngagementDashboard.css";

const PERIOD_OPTIONS = [
  { label: "Last 7 Days", value: "last-7-days" },
  { label: "Last 30 Days", value: "last-30-days" },
  { label: "Last 60 Days", value: "last-60-days" },
  { label: "Last 90 Days", value: "last-90-days" },
  { label: "Last 120 Days", value: "last-120-days" },
];

const PLATFORM_LOGOS: Record<string, string> = {
  linkedin: linkedinLogo,
  instagram: instagramLogo,
  facebook: facebookLogo,
  x: xLogo,
};

const formatNumber = (value: number) => new Intl.NumberFormat(undefined).format(value);

const formatPercent = (value: number) =>
  `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

const buildSparklinePath = (
  points: number[],
  width: number,
  height: number,
): { line: string; fill: string } | null => {
  if (points.length === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 4;
  const plotHeight = height - padding * 2;
  const step = width / (points.length - 1);

  const coordinates = points.map((point, index) => {
    const x = index * step;
    const normalized = (point - min) / range;
    const y = height - padding - normalized * plotHeight;
    return { x, y };
  });

  // Smooth monotone-ish cubic path through points (Catmull-Rom → cubic Bezier)
  const line = coordinates.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const p0 = coordinates[Math.max(0, index - 2)];
    const p1 = coordinates[index - 1];
    const p2 = point;
    const p3 = coordinates[Math.min(coordinates.length - 1, index + 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }, "");

  const last = coordinates[coordinates.length - 1];
  const first = coordinates[0];
  const fill = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;

  return { line, fill };
};

const KpiSparkline = ({ points, id }: { points: number[]; id: string }) => {
  const width = 120;
  const height = 48;
  const paths = buildSparklinePath(points, width, height);
  const gradientId = `eng-sparkline-${id}`;

  if (!paths) return null;

  return (
    <svg
      className="aaw-kpi-card__sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(77, 62, 224, 0.22)" />
          <stop offset="100%" stopColor="rgba(77, 62, 224, 0)" />
        </linearGradient>
      </defs>
      <path d={paths.fill} fill={`url(#${gradientId})`} />
      <path
        d={paths.line}
        fill="none"
        stroke="var(--secondary-blue-bb-200, #4d3ee0)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const KpiCard = ({ metric }: { metric: AdminOverviewKpi }) => {
  const displayValue = metric.formattedValue ?? formatNumber(metric.value);
  const changeClass =
    metric.changePercent > 0
      ? "is-positive"
      : metric.changePercent < 0
        ? "is-negative"
        : "is-neutral";

  return (
    <article className="aaw-kpi-card">
      <div className="aaw-kpi-card__label">
        <span>{metric.label}</span>
        <button
          type="button"
          className="aaw-kpi-card__info"
          aria-label={`About ${metric.label}`}
        >
          <img src={infoIcon} alt="" />
        </button>
      </div>
      <div className="aaw-kpi-card__body">
        <div className="aaw-kpi-card__value-row">
          <strong>{displayValue}</strong>
          <span className={`aaw-kpi-card__change ${changeClass}`}>
            {metric.changePercent > 0 && <span aria-hidden="true">▲</span>}
            {metric.changePercent < 0 && <span aria-hidden="true">▼</span>}
            {Math.abs(metric.changePercent)}%
          </span>
        </div>
        <KpiSparkline id={metric.id} points={metric.sparkline} />
      </div>
    </article>
  );
};

const EngagementsByTypeChart = ({ data }: { data: AdminEngagementData }) => {
  const maxTotal = useMemo(
    () =>
      Math.max(
        ...data.engagementsByType.map((month) =>
          month.segments.reduce((sum, segment) => sum + segment.value, 0),
        ),
        1,
      ),
    [data.engagementsByType],
  );

  return (
    <div className="aaw-chart aaw-chart--stacked-bars">
      <div className="aaw-chart__bars" role="img" aria-label="Engagements by type by month">
        {data.engagementsByType.map((month) => {
          const total = month.segments.reduce((sum, segment) => sum + segment.value, 0);
          const heightPercent = (total / maxTotal) * 100;

          return (
            <div key={month.month} className="aaw-chart__bar-group">
              <div className="aaw-chart__bar-stack" style={{ height: `${heightPercent}%` }}>
                {month.segments.map((segment) => (
                  <span
                    key={`${month.month}-${segment.label}`}
                    style={{
                      flexGrow: segment.value,
                      background: segment.color,
                    }}
                    title={`${segment.label}: ${formatNumber(segment.value)}`}
                  />
                ))}
              </div>
              <span className="aaw-chart__bar-label">{month.month}</span>
            </div>
          );
        })}
      </div>
      <ul className="aaw-legend aaw-legend--wrap">
        {data.engagementTypeLegend.map((label) => (
          <li key={label}>
            <span style={{ background: getEngagementTypeColor(label) }} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const NetworkDonutChart = ({ data }: { data: AdminEngagementData }) => {
  const total = data.engagementsByNetwork.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  const segments = data.engagementsByNetwork.map((item) => {
    const start = (cumulative / total) * 360;
    cumulative += item.value;
    const end = (cumulative / total) * 360;
    const largeArc = end - start > 180 ? 1 : 0;
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((end - 90) * Math.PI) / 180;
    const outer = 74;
    const inner = 54;
    const x1 = 80 + outer * Math.cos(startRad);
    const y1 = 80 + outer * Math.sin(startRad);
    const x2 = 80 + outer * Math.cos(endRad);
    const y2 = 80 + outer * Math.sin(endRad);
    const x3 = 80 + inner * Math.cos(endRad);
    const y3 = 80 + inner * Math.sin(endRad);
    const x4 = 80 + inner * Math.cos(startRad);
    const y4 = 80 + inner * Math.sin(startRad);
    const path = `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return { ...item, path };
  });

  return (
    <div className="aaw-chart aaw-chart--donut">
      <div className="aaw-chart__donut-wrap">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          {segments.map((segment) => (
            <path key={segment.label} d={segment.path} fill={segment.color} />
          ))}
        </svg>
        <div className="aaw-chart__donut-center">
          <strong>{data.networkEngagementsTotal.value}</strong>
          <span>{data.networkEngagementsTotal.label}</span>
        </div>
      </div>
      <ul className="aaw-legend aaw-legend--inline">
        {data.engagementsByNetwork.map((item) => (
          <li key={item.label}>
            <span style={{ background: item.color }} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const DayOfWeekChart = ({ data }: { data: AdminEngagementData }) => {
  const maxDayTotal = useMemo(
    () =>
      Math.max(
        ...data.engagementsByDayOfWeek.map((day) =>
          Object.values(day.values).reduce((sum, value) => sum + value, 0),
        ),
        1,
      ),
    [data.engagementsByDayOfWeek],
  );

  return (
    <div className="aaw-chart aaw-chart--grouped-bars">
      <div className="aaw-chart__grouped-bars" role="img" aria-label="Engagements by day of week">
        {data.engagementsByDayOfWeek.map((day) => {
          const dayTotal = Object.values(day.values).reduce((sum, value) => sum + value, 0);
          const heightPercent = (dayTotal / maxDayTotal) * 100;

          return (
            <div key={day.day} className="aaw-chart__bar-group">
              <div className="aaw-chart__grouped-stack" style={{ height: `${heightPercent}%` }}>
                {data.dayOfWeekNetworks.map((network) => (
                  <span
                    key={`${day.day}-${network}`}
                    style={{
                      flexGrow: day.values[network] ?? 0,
                      background: getNetworkColor(network),
                    }}
                    title={`${network}: ${formatNumber(day.values[network] ?? 0)}`}
                  />
                ))}
              </div>
              <span className="aaw-chart__bar-label">{day.day}</span>
            </div>
          );
        })}
      </div>
      <ul className="aaw-legend aaw-legend--inline">
        {data.dayOfWeekNetworks.map((network) => (
          <li key={network}>
            <span style={{ background: getNetworkColor(network) }} />
            {network}
          </li>
        ))}
      </ul>
    </div>
  );
};

const HEATMAP_BUBBLE_COLORS = {
  primary: "#ff5a36",
  yellow: "#f5b301",
  green: "#28a745",
} as const;

const TimeOfDayHeatmap = ({ data }: { data: AdminEngagementData }) => {
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cellMap = useMemo(() => {
    const map = new Map<string, { value: number; tone?: keyof typeof HEATMAP_BUBBLE_COLORS }>();
    data.engagementByTimeOfDay.forEach((cell) => {
      map.set(`${cell.day}-${cell.hour}`, { value: cell.value, tone: cell.tone });
    });
    return map;
  }, [data.engagementByTimeOfDay]);

  const maxValue = useMemo(
    () => Math.max(...data.engagementByTimeOfDay.map((cell) => cell.value), 1),
    [data.engagementByTimeOfDay],
  );

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 am";
    if (hour < 12) return `${hour} am`;
    if (hour === 12) return "12 pm";
    return `${hour - 12} pm`;
  };

  const bubbleSize = (value: number) => {
    const intensity = value / maxValue;
    return 6 + intensity * 18;
  };

  const bubbleColor = (
    value: number,
    tone?: keyof typeof HEATMAP_BUBBLE_COLORS,
  ) => {
    if (tone) return HEATMAP_BUBBLE_COLORS[tone];
    if (value >= maxValue * 0.72) return HEATMAP_BUBBLE_COLORS.primary;
    if (value >= maxValue * 0.45) return "rgba(255, 90, 54, 0.72)";
    return "rgba(255, 90, 54, 0.42)";
  };

  return (
    <div className="aaw-chart aaw-chart--heatmap">
      <div className="aaw-time-heatmap" role="img" aria-label="Engagement by time of day heatmap">
        <div className="aaw-time-heatmap__header">
          <span className="aaw-time-heatmap__corner" aria-hidden="true" />
          <div className="aaw-time-heatmap__hours">
            {hours.map((hour) => (
              <span key={hour}>{formatHour(hour)}</span>
            ))}
          </div>
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day}
            className={`aaw-time-heatmap__row${dayIndex < days.length - 1 ? " has-divider" : ""}`}
          >
            <span className="aaw-time-heatmap__day">{day}</span>
            <div className="aaw-time-heatmap__track">
              {hours.map((hour) => {
                const cell = cellMap.get(`${day}-${hour}`);
                const value = cell?.value ?? 0;
                const showBubble = value >= 10;

                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`aaw-time-heatmap__cell${hour % 2 === 1 ? " is-striped" : ""}`}
                    title={`${day} ${formatHour(hour)}: ${value}`}
                  >
                    {showBubble ? (
                      <span
                        className="aaw-time-heatmap__bubble"
                        style={{
                          width: `${bubbleSize(value)}px`,
                          height: `${bubbleSize(value)}px`,
                          background: bubbleColor(value, cell?.tone),
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PaginationFooter = ({
  from,
  to,
  total,
}: {
  from: number;
  to: number;
  total: number;
}) => (
  <footer className="aaw-table-footer">
    <span>{from}-{to} of {total}</span>
    <div className="aaw-table-footer__nav">
      <button type="button" aria-label="Previous page" disabled={from <= 1}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 4L6 8L10 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <button type="button" aria-label="Next page" disabled={to >= total}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 4L10 8L6 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  </footer>
);

const EngagementDashboardContent = ({ data }: { data: AdminEngagementData }) => {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[2].value);

  return (
  <section className="aaw-page aaw-engagement-page">
    <header className="aaw-page-header">
      <h2 className="aaw-page-header__title">Engagement</h2>
      <p className="aaw-page-header__subtitle">
        Measure the performance of published content to gain deeper insights into your social
        media activity.
      </p>
      <div className="aaw-page-toolbar">
        <UiDropdown
          className="aaw-page-toolbar__period"
          size="sm"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={setPeriod}
          ariaLabel="Time period"
        />
      </div>
    </header>

    <div className="aaw-kpi-grid">
      {data.overviewKpis.map((metric) => (
        <KpiCard key={metric.id} metric={metric} />
      ))}
    </div>

    <div className="aaw-grid aaw-grid--two-col">
      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Engagements by Type</h2>
          <p>Monthly breakdown of engagements by type.</p>
        </header>
        <EngagementsByTypeChart data={data} />
      </article>

      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Top Engaging Profiles</h2>
          <p>Profiles that generated the most engagements.</p>
        </header>
        <div className="aaw-table-wrap">
          <Table
            columns={["Profile", "Engagements", "Engagement rate"]}
            data={data.topProfiles.map((profile) => ({
              Profile: (
                <div className="aaw-profile-cell">
                  <img
                    src={PLATFORM_LOGOS[profile.platform]}
                    alt={profile.platform}
                    className="aaw-profile-cell__platform"
                  />
                  <Avatar userName={profile.name} size={28} fontSize={10} />
                  <span>{profile.name}</span>
                </div>
              ),
              Engagements: formatNumber(profile.engagements),
              "Engagement rate": formatPercent(profile.engagementRate),
            }))}
          />
        </div>
        <PaginationFooter from={1} to={data.topProfiles.length} total={data.topProfilesTotal} />
      </article>
    </div>

    <div className="aaw-grid aaw-grid--two-col">
      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Engagements by Network and Channel</h2>
          <p>Breakdown of engagements by networks and channels.</p>
        </header>
        <NetworkDonutChart data={data} />
      </article>

      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Top Engaging Campaigns</h2>
          <p>Campaigns that generated the most engagement.</p>
        </header>
        <div className="aaw-table-wrap">
          <Table
            columns={["Campaign", "Engagements"]}
            data={data.topCampaigns.map((campaign) => ({
              Campaign: (
                <div className="aaw-campaign-cell">
                  <span style={{ background: campaign.color }} />
                  <span>{campaign.name}</span>
                </div>
              ),
              Engagements: formatNumber(campaign.engagements),
            }))}
          />
        </div>
        <PaginationFooter from={1} to={data.topCampaigns.length} total={data.topCampaignsTotal} />
      </article>
    </div>

    <div className="aaw-grid aaw-grid--two-col">
      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Engagements by Day of Week</h2>
          <p>Breakdown of social engagements by day of the week.</p>
        </header>
        <DayOfWeekChart data={data} />
      </article>

      <article className="aaw-card">
        <header className="aaw-card__header">
          <h2>Engagement by Time of Day</h2>
          <p>
            Optimal post time (in UTC) based on the posts sent during this period and their
            engagements.
          </p>
        </header>
        <TimeOfDayHeatmap data={data} />
      </article>
    </div>
  </section>
  );
};

export const EngagementDashboardPage: React.FC = () => {
  const engagementData = useMemo(() => getAdminEngagementData(), []);

  return (
    <main className="campaign-studio engagement-dashboard">
      <header className="cs-page-header cb-page-header">
        <div>
          <h1>Social Media Advisor</h1>
          <CampaignStudioSubNav />
        </div>
      </header>

      <div className="engagement-dashboard__content">
        <EngagementDashboardContent data={engagementData} />
      </div>
    </main>
  );
};
