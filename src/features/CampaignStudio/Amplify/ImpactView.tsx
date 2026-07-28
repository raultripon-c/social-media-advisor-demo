import React from "react";
import { attributionRows, channelLabel, impactKpis, shareVelocity } from "./amplifyData";
import { SharePack } from "./amplifyTypes";

interface ImpactViewProps {
  packs: SharePack[];
}

const VELOCITY_SEGMENT_COLORS = ["#3c6d68", "#5a8f89", "#7eb5b0", "#a8d0cc"];

export const ImpactView: React.FC<ImpactViewProps> = ({ packs }) => {
  const topPacks = [...packs]
    .filter((pack) => pack.metrics)
    .sort((a, b) => (b.metrics?.clicks || 0) - (a.metrics?.clicks || 0))
    .slice(0, 5);
  const maxVelocity = Math.max(...shareVelocity.map((point) => point.value), 1);

  return (
    <div className="amp-impact">
      <div className="amp-kpi-row">
        {impactKpis.map((kpi) => (
          <article key={kpi.id} className="amp-kpi">
            <p>{kpi.label}</p>
            <strong>{kpi.value}</strong>
            {kpi.delta && <span>{kpi.delta}</span>}
          </article>
        ))}
      </div>

      <div className="amp-impact__grid">
        <section className="amp-panel">
          <h3>Share velocity</h3>
          <div className="amp-velocity" role="list" aria-label="Share velocity by day">
            {shareVelocity.map((point) => (
              <div key={point.label} className="amp-velocity__col" role="listitem">
                <div
                  className="amp-velocity__bar"
                  style={{ height: `${(point.value / maxVelocity) * 100}%` }}
                  tabIndex={0}
                  aria-label={`${point.label}: ${point.value} shares`}
                >
                  <div className="amp-velocity__segments" aria-hidden="true">
                    {point.packs.map((pack, index) => (
                      <span
                        key={pack.packId}
                        className="amp-velocity__segment"
                        style={{
                          flexGrow: pack.shares,
                          background: VELOCITY_SEGMENT_COLORS[index % VELOCITY_SEGMENT_COLORS.length],
                        }}
                      />
                    ))}
                  </div>
                  <div className="amp-velocity__tooltip" role="tooltip">
                    <p className="amp-velocity__tooltip-total">
                      {point.label} · {point.value} shares
                    </p>
                    <ul>
                      {point.packs.map((pack, index) => (
                        <li key={pack.packId}>
                          <span
                            className="amp-velocity__swatch"
                            style={{
                              background: VELOCITY_SEGMENT_COLORS[index % VELOCITY_SEGMENT_COLORS.length],
                            }}
                          />
                          <span className="amp-velocity__tooltip-name">{pack.name}</span>
                          <strong>{pack.shares}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="amp-panel">
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
      </div>

      <section className="amp-panel">
        <h3>Attribution</h3>
        <div className="amp-table-wrap">
          <table className="amp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Pack</th>
                <th>Channel</th>
                <th>Clicks</th>
                <th>Apps</th>
                <th>Last share</th>
              </tr>
            </thead>
            <tbody>
              {attributionRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.employee}</td>
                  <td>{row.pack}</td>
                  <td>{channelLabel[row.channel]}</td>
                  <td>{row.clicks}</td>
                  <td>{row.applications}</td>
                  <td>{row.lastShare}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
