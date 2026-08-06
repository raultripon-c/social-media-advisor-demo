import React, { useMemo } from "react";
import { attributionRows } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

interface ImpactViewProps {
  packs: SharePack[];
}

const formatCount = (value: number) => value.toLocaleString("en-US");

const formatEmv = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
};

export const ImpactView: React.FC<ImpactViewProps> = ({ packs }) => {
  const packsWithMetrics = useMemo(() => packs.filter((pack) => pack.metrics), [packs]);

  const liveKpis = useMemo(() => {
    const totals = packsWithMetrics.reduce(
      (acc, pack) => {
        acc.clicks += pack.metrics?.clicks || 0;
        acc.applications += pack.metrics?.applications || 0;
        acc.emvUsd += pack.metrics?.emvUsd || 0;
        return acc;
      },
      { clicks: 0, applications: 0, emvUsd: 0 },
    );
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
        value: formatEmv(totals.emvUsd),
      },
    ];
  }, [packsWithMetrics]);

  const topPacks = [...packsWithMetrics]
    .sort((a, b) => (b.metrics?.clicks || 0) - (a.metrics?.clicks || 0))
    .slice(0, 3);

  return (
    <div className="amp-impact">
      <div className="amp-kpi-row amp-kpi-row--three">
        {liveKpis.map((kpi) => (
          <article key={kpi.id} className="amp-kpi">
            <p>{kpi.label}</p>
            <strong>{kpi.value}</strong>
          </article>
        ))}
      </div>

      <div className="amp-impact__grid">
        <section className="amp-panel amp-panel--top-packs">
          <h3>Top packs</h3>
          <ul className="amp-top-packs">
            {topPacks.map((pack, index) => (
              <li key={pack.id}>
                <div>
                  <strong>
                    {index + 1}. {pack.title}
                  </strong>
                  <span className="amp-top-packs__stat">{pack.metrics?.clicks || 0} clicks</span>
                </div>
                <em>{pack.metrics?.applications || 0} apps</em>
              </li>
            ))}
            {topPacks.length === 0 && <li className="amp-empty">No sent packs with metrics yet.</li>}
          </ul>
        </section>

        <section className="amp-panel amp-panel--attribution">
          <h3>Attribution</h3>
          <div className="amp-table-wrap">
            <table className="amp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Pack</th>
                  <th>Clicks</th>
                  <th>Apps</th>
                </tr>
              </thead>
              <tbody>
                {attributionRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.employee}</td>
                    <td>{row.pack}</td>
                    <td>{row.clicks}</td>
                    <td>{row.applications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
