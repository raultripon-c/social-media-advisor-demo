import React from "react";
import { attributionRows } from "./amplifyData";
import { SharePack } from "./amplifyTypes";
import { ImpactKpiRow } from "./ImpactKpiRow";

interface ImpactViewProps {
  packs: SharePack[];
}

export const ImpactView: React.FC<ImpactViewProps> = ({ packs }) => {
  const packsWithMetrics = packs.filter((pack) => pack.metrics);
  const topPacks = [...packsWithMetrics]
    .sort((a, b) => (b.metrics?.clicks || 0) - (a.metrics?.clicks || 0))
    .slice(0, 3);

  return (
    <div className="amp-impact">
      <ImpactKpiRow packs={packs} />

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
                  <th>Pack</th>
                  <th>Clicks</th>
                  <th>Apps</th>
                </tr>
              </thead>
              <tbody>
                {attributionRows.map((row) => (
                  <tr key={row.id}>
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
