import React, { useMemo } from "react";
import infoIcon from "../../../assets/svg/info.svg";
import { SharePack } from "./amplifyTypes";

interface ImpactKpiRowProps {
  packs: SharePack[];
}

const EMV_PER_CLICK = 15.5;

const formatCount = (value: number) => value.toLocaleString("en-US");

const formatEmv = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

export const ImpactKpiRow: React.FC<ImpactKpiRowProps> = ({ packs }) => {
  const liveKpis = useMemo(() => {
    const packsWithMetrics = packs.filter((pack) => pack.metrics);
    const totals = packsWithMetrics.reduce(
      (acc, pack) => {
        acc.clicks += pack.metrics?.clicks || 0;
        acc.applications += pack.metrics?.applications || 0;
        return acc;
      },
      { clicks: 0, applications: 0 },
    );
    const mediaValue = totals.clicks * EMV_PER_CLICK;
    return [
      {
        id: "clicks",
        label: "Clicks",
        value: formatCount(totals.clicks),
      },
      {
        id: "apps",
        label: "Applies",
        value: formatCount(totals.applications),
      },
      {
        id: "emv",
        label: "Media value",
        value: formatEmv(mediaValue),
        info: "Estimated Total EMV = Total Clicks × 15.50",
      },
    ];
  }, [packs]);

  return (
    <div className="amp-kpi-row amp-kpi-row--three">
      {liveKpis.map((kpi) => (
        <article key={kpi.id} className="amp-kpi">
          <p className="amp-kpi__label">
            <span>{kpi.label}</span>
            {"info" in kpi && kpi.info ? (
              <span className="amp-kpi__info" tabIndex={0} aria-label={kpi.info}>
                <img src={infoIcon} alt="" width={14} height={14} />
                <span className="amp-kpi__tooltip" role="tooltip">
                  {kpi.info}
                </span>
              </span>
            ) : null}
          </p>
          <strong>{kpi.value}</strong>
        </article>
      ))}
    </div>
  );
};
