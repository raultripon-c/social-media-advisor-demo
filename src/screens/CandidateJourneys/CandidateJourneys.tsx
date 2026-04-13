import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { API } from "../../utils/api";

// ─── Theme — aligned with TXE design system ──────────────────────────────────
const T = {
  bg: '#f5f7fa', surface: '#ffffff', surface2: '#f4f6fa',
  border: '#e9ebed', border2: '#d1d5dc',
  text: '#353b46', textSub: '#464f5e', textMuted: '#637085',
  accent: '#4d3ee0', accentBg: '#eae8fb', accentBorder: '#c7c3f0',
  teal: '#00a8b6', tealBg: '#e0f7fa',
  font: "'Poppins', 'Segoe UI', sans-serif",
};

// ─── Action Metadata ──────────────────────────────────────────────────────────
const ACTION_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  OUTREACH: { icon: '📤', color: '#4d3ee0', bg: '#eae8fb', label: 'Outreach' },
  EXPERIENCE: { icon: '🌐', color: '#00a8b6', bg: '#e0f7fa', label: 'Experience' },
  CONDITION: { icon: '◆', color: '#ba4800', bg: '#fbedd5', label: 'Condition' },
  WAIT: { icon: '⏱', color: '#637085', bg: '#f4f6fa', label: 'Wait' },
  DELAY_UNTIL: { icon: '⏰', color: '#637085', bg: '#f4f6fa', label: 'Delay Until' },
  EXIT: { icon: '⬡', color: '#c40f24', bg: '#fde8eb', label: 'Exit' },
  ALERT: { icon: '🚨', color: '#ba4800', bg: '#fbedd5', label: 'Alert' },
  TAG: { icon: '🏷️', color: '#ba4800', bg: '#fbedd5', label: 'Tag' },
  TASK: { icon: '✅', color: '#ba4800', bg: '#fbedd5', label: 'Task' },
  ASSIGN: { icon: '👤', color: '#ba4800', bg: '#fbedd5', label: 'Assign' },
  MOVE_STAGE: { icon: '➡️', color: '#ba4800', bg: '#fbedd5', label: 'Move Stage' },
  WEBHOOK: { icon: '🔌', color: '#4d3ee0', bg: '#eae8fb', label: 'Webhook' },
  GOAL_CHECK: { icon: '🎯', color: '#00a8b6', bg: '#e0f7fa', label: 'Goal Check' },
  ADD_TO_JOURNEY: { icon: '↩', color: '#4d3ee0', bg: '#eae8fb', label: 'Add to Journey' },
  AB_SPLIT: { icon: '⚖', color: '#ba4800', bg: '#fbedd5', label: 'A/B Split' },
  THROTTLE: { icon: '🚦', color: '#c40f24', bg: '#fde8eb', label: 'Throttle' },
};

const CHANNEL_META: Record<string, { color: string; icon: string }> = {
  EMAIL: { color: '#4d3ee0', icon: '✉' },
  SMS: { color: '#00a8b6', icon: '💬' },
  WHATSAPP: { color: '#00b88b', icon: '💚' },
  LANDING_PAGE: { color: '#9383fe', icon: '🌐' },
};

const CONDITION_CATALOG: Record<string, { color: string; icon: string; label: string; class: string }> = {
  OUTREACH_DELIVERED: { color: '#637085', icon: '📬', label: 'Delivered', class: 'INFRASTRUCTURE' },
  OUTREACH_PRIMARY_CTA_CLICKED: { color: '#4d3ee0', icon: '👆', label: 'Primary CTA Clicked', class: 'ENGAGEMENT' },
  OUTREACH_SECONDARY_CTA_CLICKED: { color: '#9383fe', icon: '👆', label: 'Secondary CTA Clicked', class: 'ENGAGEMENT' },
  OUTREACH_REPLIED: { color: '#00a8b6', icon: '↩️', label: 'Replied', class: 'ENGAGEMENT' },
  OUTREACH_OPT_OUT: { color: '#c40f24', icon: '🚫', label: 'Opted Out', class: 'NEGATIVE' },
  OUTREACH_APPLICATION_STARTED: { color: '#00b88b', icon: '📝', label: 'Application Started', class: 'ENGAGEMENT' },
  OUTREACH_APPLICATION_SUBMITTED: { color: '#00b88b', icon: '✅', label: 'Application Submitted', class: 'ENGAGEMENT' },
  OUTREACH_TC_PROFILE_COMPLETED: { color: '#9383fe', icon: '🤝', label: 'TC Profile Completed', class: 'ENGAGEMENT' },
  OUTREACH_TC_PROFILE_STARTED: { color: '#9383fe', icon: '🤝', label: 'TC Profile Started', class: 'ENGAGEMENT' },
  OUTREACH_EVENT_REGISTERED: { color: '#00a8b6', icon: '📅', label: 'Event Registered', class: 'ENGAGEMENT' },
  OUTREACH_ASSESSMENT_COMPLETED: { color: '#ba4800', icon: '🧪', label: 'Assessment Completed', class: 'ENGAGEMENT' },
  OUTREACH_CREDENTIAL_VERIFIED: { color: '#00b88b', icon: '🔏', label: 'Credential Verified', class: 'ENGAGEMENT' },
};

const ENDGOAL_META: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  APPLY_FOR_JOB: { color: '#00b88b', bg: '#e6f9f4', border: '#a3e4d1', icon: '💼', label: 'Apply for Job' },
  JOIN_TALENT_COMMUNITY: { color: '#4d3ee0', bg: '#eae8fb', border: '#c7c3f0', icon: '🤝', label: 'Join Talent Community' },
};

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  ready: { color: '#00b88b', bg: '#e6f9f4', border: '#a3e4d1', label: 'READY' },
  blocked: { color: '#c40f24', bg: '#fde8eb', border: '#f5b3bc', label: 'BLOCKED' },
  draft: { color: '#637085', bg: '#f4f6fa', border: '#d1d5dc', label: 'DRAFT' },
  review: { color: '#ba4800', bg: '#fbedd5', border: '#f0c78e', label: 'REVIEW' },
};

const VERDICT_CFG: Record<string, { color: string; bg: string; border: string }> = {
  VALID: { color: '#00b88b', bg: '#e6f9f4', border: '#a3e4d1' },
  INVALID: { color: '#c40f24', bg: '#fde8eb', border: '#f5b3bc' },
  REVIEW: { color: '#ba4800', bg: '#fbedd5', border: '#f0c78e' },
};

const TIER_META: Record<string, { color: string }> = { SOFT: { color: '#ba4800' }, ADVISORY: { color: '#4d3ee0' }, HARD: { color: '#c40f24' } };
const scoreColor = (v: number) => v >= 0.9 ? '#00b88b' : v >= 0.7 ? '#ba4800' : '#c40f24';

// ─── Canvas Layout Constants ──────────────────────────────────────────────────
const NW = 200, NH = 72, CPX = 272, RPX = 140, PAD = 56;

function nodeHeight(step: any) {
  if (!step) return NH;
  if (step.action === 'EXIT') return 48;
  if (['WAIT', 'DELAY_UNTIL'].includes(step.action)) return 52;
  if (['TAG', 'ALERT', 'TASK', 'ASSIGN', 'MOVE_STAGE', 'WEBHOOK'].includes(step.action)) return 52;
  if (step.action === 'CONDITION') return 80;
  return NH;
}

// ─── Layout Algorithm ─────────────────────────────────────────────────────────
interface Edge { from: number; to: number; label: string | null; }
interface LayoutResult { pos: Map<number, { x: number; y: number; w: number; h: number }>; fwd: Edge[]; bkw: Edge[]; W: number; H: number; map: Map<number, any>; }

function computeLayout(steps: any[]): LayoutResult | null {
  if (!steps || steps.length === 0) return null;
  const map = new Map(steps.map((s: any) => [s.step_number, s]));
  const edges: Edge[] = [];
  steps.forEach((s: any) => {
    const add = (to: any, lbl: string | null) => { const n = parseInt(to); if (!isNaN(n) && map.has(n)) edges.push({ from: s.step_number, to: n, label: lbl }); };
    if (s.action === 'CONDITION') { add(s.branch_yes, 'YES'); add(s.branch_no, 'NO'); }
    else { const isTerminal = ['EXPERIENCE', 'EXIT'].includes(s.action); if (s.next_step != null) add(s.next_step, null); else if (!isTerminal && map.has(s.step_number + 1)) add(s.step_number + 1, null); }
  });
  const vis = new Set<number>(), stk = new Set<number>(), backKeys = new Set<string>();
  const entry = Math.min(...steps.map((s: any) => s.step_number));
  function dfs(n: number) { if (vis.has(n)) return; vis.add(n); stk.add(n); for (const e of edges.filter(e => e.from === n)) { if (stk.has(e.to)) backKeys.add(`${e.from}→${e.to}`); else dfs(e.to); } stk.delete(n); }
  dfs(entry);
  const fwd = edges.filter(e => !backKeys.has(`${e.from}→${e.to}`));
  const bkw = edges.filter(e => backKeys.has(`${e.from}→${e.to}`));
  const layer = new Map(steps.map((s: any) => [s.step_number, 0]));
  const ind = new Map(steps.map((s: any) => [s.step_number, 0]));
  fwd.forEach(e => ind.set(e.to, (ind.get(e.to) || 0) + 1));
  const q = steps.filter((s: any) => !ind.get(s.step_number)).map((s: any) => s.step_number);
  const ind2 = new Map(ind);
  while (q.length) { const n = q.shift()!; for (const e of fwd.filter(e => e.from === n)) { if ((layer.get(e.to) || 0) < (layer.get(n) || 0) + 1) layer.set(e.to, (layer.get(n) || 0) + 1); const d = (ind2.get(e.to) || 1) - 1; ind2.set(e.to, d); if (d === 0) q.push(e.to); } }
  const col = new Map<number, number>(), colVis = new Set<number>();
  function assignCol(n: number, c: number) { if (colVis.has(n)) return; colVis.add(n); col.set(n, c); for (const e of fwd.filter(e => e.from === n)) { if (!colVis.has(e.to)) assignCol(e.to, e.label === 'YES' ? c - 1 : e.label === 'NO' ? c + 1 : c); } }
  assignCol(entry, 0);
  steps.forEach((s: any) => { if (!col.has(s.step_number)) col.set(s.step_number, 0); });
  const parCols = new Map<number, number[]>(steps.map((s: any) => [s.step_number, []]));
  fwd.forEach(e => parCols.get(e.to)?.push(col.get(e.from) ?? 0));
  steps.forEach((s: any) => { const pc = parCols.get(s.step_number) || []; if (pc.length > 1) col.set(s.step_number, Math.round(pc.reduce((a, b) => a + b, 0) / pc.length)); });
  const minC = Math.min(...col.values());
  const pos = new Map<number, { x: number; y: number; w: number; h: number }>();
  steps.forEach((s: any) => { const c = ((col.get(s.step_number) ?? 0) - minC); const r = (layer.get(s.step_number) || 0); pos.set(s.step_number, { x: c * CPX + PAD, y: r * RPX + PAD, w: NW, h: nodeHeight(s) }); });
  const cellBuckets = new Map<string, number[]>();
  steps.forEach((s: any) => { const key = `${layer.get(s.step_number) || 0}|${col.get(s.step_number) || 0}`; if (!cellBuckets.has(key)) cellBuckets.set(key, []); cellBuckets.get(key)!.push(s.step_number); });
  cellBuckets.forEach(nums => { if (nums.length < 2) return; nums.sort((a, b) => a - b); nums.forEach((n, i) => { const p = pos.get(n); if (!p) return; pos.set(n, { ...p, x: p.x + Math.round(-CPX * (nums.length - 1) / 2 + i * CPX) }); }); });
  const maxX = Math.max(...[...pos.values()].map(p => p.x + p.w)) + PAD;
  const maxY = Math.max(...[...pos.values()].map(p => p.y + p.h)) + PAD;
  return { pos, fwd, bkw, W: maxX, H: maxY, map };
}

// ─── Flow Node Card ───────────────────────────────────────────────────────────
function FlowNode({ step, pos, selected, onClick, allSteps }: any) {
  const meta = ACTION_META[step.action] || { icon: '○', color: T.textMuted, bg: T.surface2 };
  const isCond = step.action === 'CONDITION';
  const isActive = step.action === 'OUTREACH' || step.action === 'EXPERIENCE';
  const condM = CONDITION_CATALOG[step.condition_id] || {} as any;
  const channels = Object.keys(step.content_plans || step.generated_content || {});
  const clickable = isActive && channels.length > 0;
  const evalStep = isCond ? allSteps.find((s: any) => s.step_number === parseInt(step.evaluate_step)) : null;
  const borderColor = selected ? meta.color : isCond ? meta.color : T.border;
  const shadow = selected ? `0 0 0 2px ${meta.color}40` : '0 1px 3px rgba(0,0,0,0.08)';

  return (
    <div onClick={() => onClick(step)} style={{
      position: 'absolute', left: pos.x, top: pos.y, width: pos.w,
      background: selected ? `${meta.color}08` : meta.bg,
      border: `1px solid ${borderColor}`, borderLeft: `3px solid ${meta.color}`,
      borderRadius: 8, padding: '8px 12px',
      cursor: clickable ? 'pointer' : 'default', boxShadow: shadow, transition: 'box-shadow .15s',
      fontFamily: T.font,
    }}
      onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${meta.color}25`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = shadow; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: step.name ? 4 : 0 }}>
        <span style={{ fontSize: 7, fontWeight: 700, color: '#fff', background: meta.color, borderRadius: 3, padding: '1px 4px' }}>{step.step_number}</span>
        <span style={{ fontSize: 11 }}>{meta.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 600, color: meta.color, letterSpacing: .3, flex: 1 }}>{step.action}</span>
        {step.timing && <span style={{ fontSize: 8, color: T.textMuted }}>{step.timing}</span>}
      </div>
      {step.name && <div style={{ fontSize: 11, fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: isCond || channels.length ? 4 : 0 }}>{step.name}</div>}
      {isCond && step.condition_id && (
        <span style={{ fontSize: 8, fontWeight: 600, color: condM.color || meta.color, background: `${condM.color || meta.color}14`, border: `1px solid ${condM.color || meta.color}30`, borderRadius: 4, padding: '1px 5px', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {step.condition_id}
        </span>
      )}
      {isCond && evalStep && <div style={{ fontSize: 8, color: T.textMuted, marginTop: 2 }}>← step {step.evaluate_step}: {evalStep.name || evalStep.action}</div>}
      {channels.length > 0 && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
          {channels.map((ch: string) => {
            const cm = CHANNEL_META[ch] || { color: '#637085', icon: '○' }; return (
              <span key={ch} style={{ fontSize: 8, fontWeight: 600, color: cm.color, background: `${cm.color}14`, border: `1px solid ${cm.color}28`, borderRadius: 3, padding: '1px 4px' }}>{cm.icon} {ch}</span>
            );
          })}
        </div>
      )}
      {step.action === 'EXIT' && step.purpose && <div style={{ fontSize: 8, color: meta.color, fontWeight: 500, marginTop: 2 }}>{step.purpose}</div>}
    </div>
  );
}

// ─── SVG Edges ────────────────────────────────────────────────────────────────
function FlowEdges({ fwd, bkw, pos, map }: any) {
  const YES = '#00b88b', NO = '#c40f24', DEF = '#aeb5c2';
  const maxRight = Math.max(...[...pos.values()].map((p: any) => p.x + p.w));
  function exit(num: number, label: string | null) { const p = pos.get(num); if (!p) return null; const s = map.get(num); const cx = p.x + p.w / 2; const by = p.y + nodeHeight(s); if (label === 'YES') return { x: cx - 18, y: by }; if (label === 'NO') return { x: cx + 18, y: by }; return { x: cx, y: by }; }
  function entry(num: number) { const p = pos.get(num); if (!p) return null; return { x: p.x + p.w / 2, y: p.y }; }
  function path(sx: number, sy: number, tx: number, ty: number) { const mid = (sy + ty) / 2; return `M ${sx} ${sy} C ${sx} ${mid}, ${tx} ${mid}, ${tx} ${ty}`; }
  return (
    <g>
      {fwd.map((e: Edge, i: number) => {
        const ep = exit(e.from, e.label); const en = entry(e.to); if (!ep || !en) return null; const c = e.label === 'YES' ? YES : e.label === 'NO' ? NO : DEF; const d = path(ep.x, ep.y, en.x, en.y); const bx = ep.x + (en.x - ep.x) * 0.25; const by = ep.y + (en.y - ep.y) * 0.25; const bw = e.label ? (e.label === 'YES' ? 26 : 22) : 0; return (
          <g key={`f${i}`}>
            <path d={d} stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <polygon points={`${en.x},${en.y} ${en.x - 4},${en.y - 7} ${en.x + 4},${en.y - 7}`} fill={c} />
            {e.label && (<g><rect x={bx - bw / 2} y={by - 8} width={bw} height={15} rx={7} fill={e.label === 'YES' ? '#e6f9f4' : '#fde8eb'} stroke={c} strokeWidth={1} /><text x={bx} y={by + 3} textAnchor="middle" fontSize={8} fontWeight="700" fill={c}>{e.label}</text></g>)}
          </g>
        );
      })}
      {bkw.map((e: Edge, i: number) => {
        const ep = exit(e.from, e.label); const tp = pos.get(e.to); if (!ep || !tp) return null; const c = e.label === 'YES' ? YES : e.label === 'NO' ? NO : '#aeb5c2'; const lane = maxRight + 44 + i * 16; const ty = tp.y + nodeHeight(map.get(e.to)) / 2; const tx = tp.x + tp.w; const d = `M ${ep.x} ${ep.y} C ${ep.x} ${ep.y + 32}, ${lane} ${ep.y + 32}, ${lane} ${ty} C ${lane} ${ty}, ${lane} ${ty}, ${tx + 2} ${ty}`; return (
          <g key={`b${i}`}>
            <path d={d} stroke={c} strokeWidth={1.4} fill="none" strokeDasharray="5 3" strokeLinecap="round" opacity={0.6} />
            <polygon points={`${tx + 2},${ty} ${tx + 10},${ty - 4} ${tx + 10},${ty + 4}`} fill={c} opacity={0.6} />
            <text x={lane + 5} y={(ep.y + ty) / 2 + 4} fontSize={8} fontWeight="600" fill={c} opacity={0.6}>↑{e.to}</text>
          </g>
        );
      })}
    </g>
  );
}

// ─── Flow Canvas ──────────────────────────────────────────────────────────────
function FlowCanvas({ steps, selectedNum, onNodeClick }: any) {
  const layout = useMemo(() => computeLayout(steps), [steps]);
  if (!layout) return <div style={{ padding: 40, textAlign: 'center', color: T.textMuted, fontSize: 13, background: T.surface, borderRadius: 8, border: `1px dashed ${T.border}` }}>No steps defined for this cohort.</div>;
  const { pos, fwd, bkw, W, H, map } = layout;
  const backLane = Math.max(...[...pos.values()].map(p => p.x + p.w)) + 44 + bkw.length * 16;
  const canvasW = Math.max(W, backLane + 40);
  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, minHeight: 0, background: T.surface2, backgroundImage: 'radial-gradient(circle, #d1d5dc40 1px, transparent 1px)', backgroundSize: '24px 24px', borderRadius: 8, border: `1px solid ${T.border}` }}>
      <div style={{ position: 'relative', width: canvasW, height: H, flexShrink: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }} width={canvasW} height={H}><FlowEdges fwd={fwd} bkw={bkw} pos={pos} map={map} /></svg>
        {steps.map((step: any) => { const p = pos.get(step.step_number); return p ? <FlowNode key={step.step_number} step={step} pos={p} selected={selectedNum === step.step_number} onClick={onNodeClick} allSteps={steps} /> : null; })}
      </div>
    </div>
  );
}

// ─── Inspector Drawer ─────────────────────────────────────────────────────────
function Inspector({ step, onClose }: any) {
  if (!step) return null;
  const meta = ACTION_META[step.action] || { icon: '○', color: T.textMuted, bg: T.surface2 };
  const condM = CONDITION_CATALOG[step.condition_id] || {} as any;
  const planMap = step.content_plans || {};
  const copyMap = step.generated_content || {};
  const channels = [...new Set([...Object.keys(planMap), ...Object.keys(copyMap)])];
  const [activeCh, setActiveCh] = useState(channels[0] || null);
  const [view, setView] = useState('copy');
  const plan = activeCh ? planMap[activeCh] : null;
  const copy = activeCh ? copyMap[activeCh] : null;
  const hasCopy = !!copy, hasPlan = !!plan;

  return (
    <div style={{ width: 400, flexShrink: 0, background: T.surface, borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: T.font }}>
      <div style={{ padding: '14px 16px', background: meta.bg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `${meta.color}18`, border: `1.5px solid ${meta.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{meta.icon}</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: meta.color, letterSpacing: .4 }}>STEP {step.step_number} · {step.action}</div>
              {step.timing && <div style={{ fontSize: 10, color: T.textMuted }}>{step.timing}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.textMuted, lineHeight: 1 }}>✕</button>
        </div>
        {step.name && <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 8 }}>{step.name}</div>}
        {step.purpose && <p style={{ fontSize: 12, color: T.textSub, margin: '4px 0 0', lineHeight: 1.5 }}>{step.purpose}</p>}
      </div>

      {step.action === 'CONDITION' && (
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, background: '#fbedd5', flexShrink: 0 }}>
          {step.condition_id && (<div style={{ marginBottom: 6 }}><div style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, marginBottom: 3 }}>CONDITION ID</div><span style={{ fontSize: 10, fontWeight: 600, color: condM.color || '#ba4800', background: `${condM.color || '#ba4800'}14`, border: `1px solid ${condM.color || '#ba4800'}30`, borderRadius: 4, padding: '2px 8px' }}>{step.condition_id}</span>{condM.class && <span style={{ marginLeft: 6, fontSize: 8, fontWeight: 600, color: T.textMuted, background: T.surface2, borderRadius: 4, padding: '1px 5px', border: `1px solid ${T.border}` }}>{condM.class}</span>}</div>)}
          {step.condition && <p style={{ fontSize: 12, color: T.textSub, margin: 0, lineHeight: 1.5 }}>{step.condition}</p>}
          {step.evaluate_step != null && <div style={{ marginTop: 4, fontSize: 11, color: T.textMuted }}>Evaluates step <strong style={{ color: T.text }}>{step.evaluate_step}</strong></div>}
          {step.condition_resolution && (<div style={{ marginTop: 6 }}><div style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, marginBottom: 3 }}>CHANNEL RESOLUTIONS</div>{Object.entries(step.condition_resolution.channel_resolutions || {}).map(([ch, res]: any) => (<div key={ch} style={{ display: 'flex', gap: 8, fontSize: 10, marginBottom: 2 }}><span style={{ fontWeight: 600, color: (CHANNEL_META[ch] || {} as any).color || T.textSub }}>{ch}</span><span style={{ color: T.textSub }}>{res}</span></div>))}</div>)}
        </div>
      )}

      {channels.length > 0 && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.surface2, flexShrink: 0, overflowX: 'auto' }}>
          {channels.map((ch: string) => {
            const cm = CHANNEL_META[ch] || { color: T.textMuted, icon: '○' }; const active = ch === activeCh; return (
              <button key={ch} onClick={() => { setActiveCh(ch); setView('copy'); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 11, fontFamily: T.font, cursor: 'pointer', border: 'none', background: 'transparent', color: active ? cm.color : T.textMuted, fontWeight: active ? 600 : 400, borderBottom: `2px solid ${active ? cm.color : 'transparent'}`, whiteSpace: 'nowrap' }}>{cm.icon} {ch}</button>
            );
          })}
        </div>
      )}

      {hasCopy && hasPlan && (
        <div style={{ display: 'flex', padding: '6px 16px', gap: 6, borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
          {([['copy', '✦ Generated Copy'], ['plan', '⚙ Content Plan']] as [string, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 4, border: `1px solid ${view === v ? T.accent : T.border}`, background: view === v ? T.accentBg : T.surface, color: view === v ? T.accent : T.textMuted, cursor: 'pointer', fontFamily: T.font, transition: 'all .12s' }}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {activeCh ? (
          view === 'copy' && hasCopy ? <CopyContent channel={activeCh} copy={copy} /> : hasPlan ? <PlanContent channel={activeCh} plan={plan} /> : hasCopy ? <CopyContent channel={activeCh} copy={copy} /> : <div style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', padding: 24 }}>No content available.</div>
        ) : <div style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', padding: 24 }}>No content for this step.</div>}
      </div>
    </div>
  );
}

// ─── Content Renderers ────────────────────────────────────────────────────────
function CopyContent({ channel, copy }: any) {
  if (!copy) return null;
  if (channel === 'LANDING_PAGE') return <LPCopy copy={copy} />;
  if (channel === 'SMS') return <SmsCopy copy={copy} />;
  return <EmailCopy copy={copy} />;
}

function EmailCopy({ copy }: any) {
  const v = copy.variants?.[0];
  if (!v) return <div style={{ fontSize: 12, color: T.textMuted, padding: 20, textAlign: 'center' }}>No generated email content.</div>;
  const SCOL: Record<string, string> = { OPENER: '#4d3ee0', VALUE_ANCHOR: '#9383fe', CTA_PRIMARY: '#c40f24', CTA_SECONDARY: '#ba4800', COMPLIANCE_FOOTER: '#637085', ROLE_DETAILS: '#00a8b6', BODY: '#464f5e' };
  const [openSec, setOpenSec] = useState<number | null>(null);
  return (
    <div>
      {v.subject_lines?.length > 0 && <div style={{ marginBottom: 12 }}><SLabel>Subject Lines</SLabel>{v.subject_lines.map((s: string, i: number) => <div key={i} style={{ fontSize: 11, color: T.text, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 6, padding: '6px 10px', marginBottom: 4, lineHeight: 1.4 }}>✉ {s}</div>)}</div>}
      {v.preview_text && <div style={{ marginBottom: 12 }}><SLabel>Preview Text</SLabel><div style={{ fontSize: 11, color: T.textSub, background: T.surface2, borderRadius: 6, padding: '6px 10px', border: `1px solid ${T.border}`, fontStyle: 'italic', lineHeight: 1.45 }}>{v.preview_text}</div></div>}
      {v.sections?.length > 0 && <div><SLabel>Email Body ({v.sections.length} sections)</SLabel>{v.sections.map((sec: any, i: number) => {
        const col = SCOL[sec.type] || '#637085'; const cvs = sec.generated_copy_variants || sec.copyVariants || []; const isOpen = openSec === i; const preview = cvs[0]?.copy_template || cvs[0]?.content || cvs[0]?.directive || '';
        return (<div key={i} style={{ border: `1px solid ${col}20`, borderLeft: `3px solid ${col}`, borderRadius: 6, marginBottom: 5, overflow: 'hidden', background: T.surface }}>
          <div onClick={() => setOpenSec(isOpen ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', cursor: 'pointer', background: isOpen ? `${col}06` : T.surface }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: col, background: `${col}12`, border: `1px solid ${col}20`, borderRadius: 3, padding: '1px 5px' }}>{sec.type}</span>
            {cvs.length > 0 && <span style={{ fontSize: 8, color: T.textMuted, marginLeft: 'auto' }}>{cvs.length} variant{cvs.length > 1 ? 's' : ''}</span>}
            <span style={{ fontSize: 10, color: T.textMuted }}>{isOpen ? '▾' : '▸'}</span>
          </div>
          {!isOpen && preview && <div style={{ padding: '0 10px 6px', fontSize: 11, color: T.textMuted, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>{preview}</div>}
          {isOpen && <div style={{ padding: '0 10px 8px' }}>{cvs.map((cv: any, j: number) => <div key={j} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 10px', marginBottom: 4, marginTop: j === 0 ? 6 : 0 }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}><span style={{ fontSize: 9, fontWeight: 600, color: col, background: `${col}10`, border: `1px solid ${col}20`, borderRadius: 3, padding: '1px 5px' }}>{cv.variant_id || cv.variantId}</span></div>
            {(cv.copy_template || cv.content) && <p style={{ fontSize: 11, color: T.text, lineHeight: 1.5, margin: '0 0 4px', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 4, padding: '6px 8px' }}>{cv.copy_template || cv.content}</p>}
            {cv.fallback_copy && <div><div style={{ fontSize: 8, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>FALLBACK</div><p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>{cv.fallback_copy}</p></div>}
          </div>)}</div>}
        </div>);
      })}</div>}
    </div>
  );
}

function SmsCopy({ copy }: any) {
  return (<div>
    <SLabel>SMS Message</SLabel>
    {copy.full_message && <div style={{ fontSize: 12, color: T.text, background: T.tealBg, border: `1px solid #a3e4d1`, borderRadius: 6, padding: '10px 12px', lineHeight: 1.5, marginBottom: 10 }}>{copy.full_message}</div>}
    {copy.hook && <div style={{ marginBottom: 8 }}><SLabel>Hook</SLabel><div style={{ fontSize: 11, color: T.textSub, background: T.surface2, borderRadius: 6, padding: '6px 10px', border: `1px solid ${T.border}` }}>{copy.hook}</div></div>}
    {copy.cta && <div style={{ marginBottom: 8 }}><SLabel>CTA</SLabel><div style={{ fontSize: 11, color: T.textSub, background: T.surface2, borderRadius: 6, padding: '6px 10px', border: `1px solid ${T.border}` }}>{copy.cta}</div></div>}
  </div>);
}

function LPCopy({ copy }: any) {
  const ZCOL: Record<string, string> = { HERO: '#4d3ee0', PROOF: '#9383fe', DETAIL: '#00a8b6', CONVERSION: '#c40f24' };
  const zones = copy.zones || [];
  return (<div>
    {copy.page_type && <div style={{ marginBottom: 10 }}><span style={{ fontSize: 9, fontWeight: 600, color: '#9383fe', background: '#eae8fb', border: '1px solid #c7c3f0', borderRadius: 4, padding: '2px 7px' }}>{copy.page_type}</span></div>}
    {zones.length > 0 && <div><SLabel>Page Content ({zones.length} zones)</SLabel>{zones.map((z: any, i: number) => { const col = ZCOL[z.zone] || '#637085'; return (<div key={i} style={{ border: `1px solid ${col}20`, borderLeft: `3px solid ${col}`, borderRadius: 6, padding: '8px 10px', marginBottom: 6, background: T.surface }}><div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><span style={{ fontSize: 8, fontWeight: 600, color: col, background: `${col}12`, border: `1px solid ${col}20`, borderRadius: 3, padding: '1px 5px' }}>{z.zone}</span>{z.cta_text && <span style={{ fontSize: 9, fontWeight: 500, color: '#fff', background: col, borderRadius: 4, padding: '2px 7px', marginLeft: 'auto' }}>{z.cta_text}</span>}</div><p style={{ fontSize: 11, color: T.text, lineHeight: 1.5, margin: 0, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 4, padding: '6px 8px' }}>{z.content}</p></div>); })}</div>}
  </div>);
}

// ─── Plan Content ─────────────────────────────────────────────────────────────
function PlanContent({ channel, plan }: any) {
  if (channel === 'LANDING_PAGE') return <LPPlan plan={plan} />;
  if (channel === 'SMS' || plan.actionType === 'SMS') return <SmsPlan plan={plan} />;
  return <EmailPlan plan={plan} />;
}

function SmsPlan({ plan }: any) {
  return (<div>
    {plan.maxCharacters && <div style={{ marginBottom: 10 }}><span style={{ fontSize: 9, fontWeight: 600, color: T.teal, background: T.tealBg, border: '1px solid #a3e4d1', borderRadius: 3, padding: '1px 6px' }}>MAX {plan.maxCharacters} chars</span></div>}
    {plan.zones?.length > 0 && <div style={{ marginBottom: 12 }}><SLabel>Message Structure</SLabel>{plan.zones.map((z: any, i: number) => (<div key={i} style={{ border: `1px solid ${T.teal}20`, borderLeft: `3px solid ${T.teal}`, borderRadius: 6, padding: '6px 10px', marginBottom: 5, background: T.surface }}><div style={{ fontSize: 8, fontWeight: 600, color: T.teal, marginBottom: 3 }}>{z.zone || z.type || `ZONE ${i + 1}`}</div>{z.directive && <p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.4, margin: 0 }}>{z.directive}</p>}{z.content && <p style={{ fontSize: 11, color: T.text, lineHeight: 1.4, margin: 0 }}>{z.content}</p>}</div>))}</div>}
    {plan.reasoning && Object.keys(plan.reasoning).length > 0 && <div style={{ marginBottom: 12 }}><SLabel>Reasoning</SLabel>{Object.entries(plan.reasoning).map(([k, v]: any) => (<div key={k} style={{ marginBottom: 6 }}><div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div><p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.4, margin: '2px 0 0', background: T.surface2, borderRadius: 4, padding: '5px 8px' }}>{v}</p></div>))}</div>}
  </div>);
}

function EmailPlan({ plan }: any) {
  const v = plan.variants?.[0]; const secs = v?.sections || [];
  return (<div>
    {(v?.subject_lines || v?.subjectVariants)?.length > 0 && <div style={{ marginBottom: 12 }}><SLabel>Subject Lines</SLabel>{(v.subject_lines || v.subjectVariants).map((s: string, i: number) => <div key={i} style={{ fontSize: 11, color: T.text, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 10px', marginBottom: 3 }}>✉ {s}</div>)}</div>}
    {v?.preview_text && <div style={{ marginBottom: 12 }}><SLabel>Preview Text</SLabel><div style={{ fontSize: 11, color: T.textSub, background: T.surface2, borderRadius: 6, padding: '6px 10px', border: `1px solid ${T.border}` }}>{v.preview_text}</div></div>}
    {secs.length > 0 && <div><SLabel>Sections ({secs.length})</SLabel>{secs.map((sec: any, i: number) => <EmailSec key={i} section={sec} />)}</div>}
  </div>);
}

function EmailSec({ section }: any) {
  const [open, setOpen] = useState(false);
  const SC: Record<string, string> = { OPENER: '#4d3ee0', VALUE_ANCHOR: '#9383fe', CTA_PRIMARY: '#c40f24', CTA_SECONDARY: '#ba4800', COMPLIANCE_FOOTER: '#637085' };
  const col = SC[section.type] || '#637085'; const vars = section.generated_copy_variants || section.copyVariants || [];
  return (<div style={{ border: `1px solid ${col}20`, borderLeft: `3px solid ${col}`, borderRadius: 6, marginBottom: 5, overflow: 'hidden' }}>
    <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', cursor: 'pointer', background: open ? `${col}06` : T.surface }}>
      <span style={{ fontSize: 8, fontWeight: 600, color: col, background: `${col}12`, border: `1px solid ${col}20`, borderRadius: 3, padding: '1px 5px' }}>{section.type}</span>
      {vars.length > 0 && <span style={{ fontSize: 8, color: T.textMuted, marginLeft: 'auto' }}>{vars.length} variant{vars.length > 1 ? 's' : ''}</span>}
      <span style={{ fontSize: 10, color: T.textMuted }}>{open ? '▾' : '▸'}</span>
    </div>
    {open && <div style={{ padding: '0 10px 8px' }}>
      {section.directive && <p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.5, margin: '6px 0' }}>{section.directive}</p>}
      {vars.map((v: any, i: number) => <div key={i} style={{ background: T.surface2, borderRadius: 6, padding: '6px 10px', marginBottom: 5, fontSize: 11 }}><span style={{ fontWeight: 600, color: T.textSub, fontSize: 10 }}>{v.variant_id || v.variantId}</span><p style={{ color: T.textSub, lineHeight: 1.4, margin: '4px 0 0' }}>{v.copy_template || v.directive || v.content || ''}</p></div>)}
    </div>}
  </div>);
}

function LPPlan({ plan }: any) {
  const zones = plan.zones || [];
  return (<div>
    {plan.page_type && <div style={{ marginBottom: 10 }}><SLabel>Page Type</SLabel><span style={{ fontSize: 10, fontWeight: 600, color: '#9383fe', background: '#eae8fb', border: '1px solid #c7c3f0', borderRadius: 4, padding: '2px 7px' }}>{plan.page_type}</span></div>}
    {zones.length > 0 && <div><SLabel>Zones ({zones.length})</SLabel>{zones.map((z: any, i: number) => { const ZC: Record<string, string> = { HERO: '#4d3ee0', PROOF: '#9383fe', DETAIL: '#00a8b6', CONVERSION: '#c40f24' }; const col = ZC[z.zone] || '#637085'; return (<div key={i} style={{ border: `1px solid ${col}20`, borderLeft: `3px solid ${col}`, borderRadius: 6, padding: '8px 10px', marginBottom: 6, background: T.surface }}><span style={{ fontSize: 8, fontWeight: 600, color: col, background: `${col}12`, border: `1px solid ${col}20`, borderRadius: 3, padding: '1px 5px' }}>{z.zone}</span><p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.4, margin: '4px 0 0' }}>{z.content}</p></div>); })}</div>}
  </div>);
}

const SLabel = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, letterSpacing: .3, textTransform: 'uppercase', marginBottom: 5 }}>{children}</div>;

// ─── Validation Panel ─────────────────────────────────────────────────────────
function ValidationPanel({ validation }: any) {
  const v = VERDICT_CFG[validation.verdict] || VERDICT_CFG.VALID;
  const allFlags = Object.entries(validation.flags || {}).flatMap(([, arr]: any) => arr);
  const [flagsOpen, setFlagsOpen] = useState(false);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Validation</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: v.color, background: v.bg, border: `1px solid ${v.border}`, borderRadius: 4, padding: '2px 7px' }}>{validation.verdict}</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor(validation.composite_score) }}>{(validation.composite_score * 100).toFixed(0)}</span>
      </div>
      {validation.hard_failures?.length > 0 && <div style={{ background: '#fde8eb', border: '1px solid #f5b3bc', borderRadius: 6, padding: 10, marginBottom: 10 }}>{validation.hard_failures.map((f: any, i: number) => <div key={i} style={{ fontSize: 11, color: '#c40f24' }}>✕ [{f.checkId}] {f.message}</div>)}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {Object.entries(validation.scores || {}).map(([k, vv]: any) => (<div key={k} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ fontSize: 11, color: T.textSub, textTransform: 'capitalize' }}>{k}</span><span style={{ fontSize: 11, fontWeight: 600, color: scoreColor(vv) }}>{(vv * 100).toFixed(0)}%</span></div>
          <div style={{ height: 4, background: T.surface2, borderRadius: 2, border: `1px solid ${T.border}`, overflow: 'hidden' }}><div style={{ height: '100%', width: `${vv * 100}%`, background: scoreColor(vv), borderRadius: 2 }} /></div>
        </div>))}
      </div>
      {allFlags.length > 0 && <div style={{ marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
        <button onClick={() => setFlagsOpen(o => !o)} style={{ fontSize: 11, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontFamily: T.font }}>{flagsOpen ? '▾' : '▸'} {allFlags.length} flag{allFlags.length > 1 ? 's' : ''}</button>
        {flagsOpen && allFlags.map((f: any, i: number) => { const t = TIER_META[f.tier] || TIER_META.ADVISORY; return (<div key={i} style={{ fontSize: 11, color: T.textSub, borderLeft: `3px solid ${t.color}`, paddingLeft: 8, marginTop: 6, lineHeight: 1.5 }}><div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><span style={{ fontSize: 8, fontWeight: 600, color: t.color }}>{f.tier}</span><span style={{ fontSize: 8, color: T.textMuted }}>[{f.checkId}]</span>{f.penalty != null && <span style={{ fontSize: 8, color: '#c40f24' }}>-{(f.penalty * 100).toFixed(0)}%</span>}</div><div>{f.message}</div>{f.fix && <div style={{ color: T.textMuted, marginTop: 1 }}>→ {f.fix}</div>}</div>); })}
      </div>}
    </div>
  );
}

// ─── Signal Panel ─────────────────────────────────────────────────────────────
function SignalPanel({ snapshot }: any) {
  if (!snapshot || Object.keys(snapshot).length === 0) return null;
  const chips = [
    { label: 'Segment', val: snapshot.segment_size?.value?.toLocaleString() },
    { label: 'Jobs', val: snapshot.job_count?.value },
    { label: 'Scarcity', val: snapshot.scarcity_ratio?.value?.toFixed(1), color: snapshot.scarcity_ratio?.label === 'CRITICAL' ? '#c40f24' : '#ba4800' },
    { label: 'Engaged', val: snapshot.total_engaged_pct?.value?.toFixed(0), unit: '%', color: '#ba4800' },
    { label: 'Opt-In', val: snapshot.top_candidate_optin_pct?.value != null ? (typeof snapshot.top_candidate_optin_pct.value === 'number' ? snapshot.top_candidate_optin_pct.value.toFixed(1) : snapshot.top_candidate_optin_pct.value) : null, unit: '%', color: T.accent },
    { label: 'Cold', val: snapshot.cold_candidate_pct?.value > 0 ? snapshot.cold_candidate_pct.value.toFixed(0) : null, unit: '%', color: '#637085' },
  ].filter(c => c.val != null);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {chips.map(c => (<div key={c.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 12px' }}>
        <div style={{ fontSize: 8, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .3, marginBottom: 2 }}>{c.label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: c.color || T.text }}>{c.val}{c.unit || ''}</div>
      </div>))}
    </div>
  );
}

// ─── Journey Sidebar ──────────────────────────────────────────────────────────
function JourneySidebar({ ds, selectedSeg, selectedCohort, onSelect }: any) {
  return (
    <div style={{ width: 256, background: T.surface, borderRight: `1px solid ${T.border}`, overflowY: 'auto', flexShrink: 0, fontFamily: T.font }}>
      <div style={{ padding: '12px 14px', background: T.surface2, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: .4 }}>CLIENT</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 2 }}>{ds.enterprise_context?.customer}</div>
        {ds.enterprise_context?.job_category && <div style={{ fontSize: 11, color: T.textSub, marginTop: 1 }}>{ds.enterprise_context.job_category}</div>}
        <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
          {[['Jobs', ds.enterprise_context?.total_jobs?.toLocaleString()], ['Candidates', (ds.enterprise_context?.total_candidates / 1000).toFixed(1) + 'k']].map(([l, v]: any) => (
            <div key={l}><div style={{ fontSize: 8, color: T.textMuted, textTransform: 'uppercase', letterSpacing: .3 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v}</div></div>
          ))}
        </div>
      </div>
      {ds.recommendations.map((rec: any, si: number) => {
        const st = STATUS_CFG[rec.status] || STATUS_CFG.draft; const isSegActive = selectedSeg === si;
        return (<div key={rec.segment_id} style={{ borderBottom: `1px solid ${T.border}` }}>
          <div onClick={() => onSelect(si, 0)} style={{ padding: '10px 14px', cursor: 'pointer', background: isSegActive ? T.accentBg : 'transparent', borderLeft: `3px solid ${isSegActive ? T.accent : 'transparent'}`, transition: 'all .12s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 3, padding: '1px 5px' }}>{st.label}</span>
              <span style={{ fontSize: 9, color: T.textMuted, marginLeft: 'auto' }}>#{rec.priority_rank}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: isSegActive ? 600 : 500, color: isSegActive ? T.accent : T.text, lineHeight: 1.3 }}>{rec.segment_name}</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{(rec.cohort_journeys || []).length} cohort{(rec.cohort_journeys || []).length !== 1 ? 's' : ''}</div>
          </div>
          {isSegActive && (rec.cohort_journeys || []).map((cohort: any, ci: number) => {
            const isActive = selectedCohort === ci; const tpl = cohort.template; const cst = STATUS_CFG[cohort.status] || STATUS_CFG.draft; const gm = ENDGOAL_META[cohort.goal];
            const tCat = tpl?.id?.match(/^([A-Z]+)/)?.[1];
            const tColor = ({ A: '#4d3ee0', C: '#00a8b6', AC: '#00a8b6', P: '#ba4800', R: '#ba4800', O: '#637085' } as Record<string, string>)[tCat || ''] || T.textSub;
            return (<div key={cohort.cohort_id} onClick={() => onSelect(si, ci)} style={{ padding: '8px 14px 8px 20px', cursor: 'pointer', borderLeft: `3px solid ${isActive ? T.accent : 'transparent'}`, background: isActive ? T.surface2 : 'transparent', transition: 'all .12s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: cst.color, background: cst.bg, border: `1px solid ${cst.border}`, borderRadius: 3, padding: '1px 5px' }}>{cst.label}</span>
                <span style={{ fontSize: 9, color: T.textMuted, marginLeft: 'auto' }}>{cohort.cohort_size} cand.</span>
              </div>
              <div style={{ fontSize: 12, color: isActive ? T.accent : T.textSub, fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>{cohort.cohort_name}</div>
              {tpl && <div style={{ fontSize: 9, color: tColor, marginTop: 2, fontWeight: 500 }}>{tpl.id} · {tpl.name}</div>}
              {gm && <span style={{ display: 'inline-block', marginTop: 2, fontSize: 8, fontWeight: 600, color: gm.color, background: gm.bg, border: `1px solid ${gm.border}`, borderRadius: 3, padding: '1px 5px' }}>{gm.icon} {gm.label}</span>}
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{cohort.steps?.length || 0} steps</div>
            </div>);
          })}
        </div>);
      })}
    </div>
  );
}

// ─── Journey View ─────────────────────────────────────────────────────────────
function JourneyView({ ds }: any) {
  const [seg, setSeg] = useState(0);
  const [ci, setCi] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const rec = ds.recommendations[seg]; const cohort = rec?.cohort_journeys?.[ci];
  function handleSelect(si: number, ci2: number) { setSeg(si); setCi(ci2); setSelected(null); }
  function handleNodeClick(step: any) { const hasContent = Object.keys(step.content_plans || step.generated_content || {}).length > 0 || step.action === 'CONDITION'; if (hasContent) setSelected((s: any) => s?.step_number === step.step_number ? null : step); }
  if (!cohort) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, fontSize: 13 }}>Select a cohort to view its journey.</div>;

  const tpl = cohort.template; const tCat = tpl?.id?.match(/^([A-Z]+)/)?.[1];
  const tColor = ({ A: '#4d3ee0', C: '#00a8b6', AC: '#00a8b6', P: '#ba4800', R: '#ba4800', O: '#637085' } as Record<string, string>)[tCat || ''] || T.textSub;
  const gm = ENDGOAL_META[cohort.goal]; const cst = STATUS_CFG[cohort.status] || STATUS_CFG.draft;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <JourneySidebar ds={ds} selectedSeg={seg} selectedCohort={ci} onSelect={handleSelect} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: cst.color, background: cst.bg, border: `1px solid ${cst.border}`, borderRadius: 3, padding: '1px 5px' }}>{cst.label}</span>
            <span style={{ fontSize: 10, color: T.textMuted }}>Cohort · {cohort.cohort_type}</span>
            {tpl && <span style={{ fontSize: 10, fontWeight: 500, color: tColor, background: `${tColor}12`, border: `1px solid ${tColor}20`, borderRadius: 4, padding: '2px 7px' }}>{tpl.id} · {tpl.name}</span>}
            {gm && <span style={{ fontSize: 10, fontWeight: 600, color: gm.color, background: gm.bg, border: `1px solid ${gm.border}`, borderRadius: 4, padding: '2px 7px' }}>{gm.icon} {gm.label}</span>}
            <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 'auto' }}>{cohort.cohort_size} candidates</span>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: T.text, letterSpacing: '-.2px', margin: 0 }}>{cohort.cohort_name}</h2>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 14, gap: 12, background: T.bg }}>
            <div style={{ fontSize: 10, color: T.textMuted, flexShrink: 0 }}>Click a node to inspect its content plan. Scroll to pan.</div>
            <FlowCanvas steps={cohort.steps || []} selectedNum={selected?.step_number} onNodeClick={handleNodeClick} />
            <div style={{ flexShrink: 0, overflowY: 'auto', maxHeight: 320 }}>
              {cohort.signal_snapshot && <SignalPanel snapshot={cohort.signal_snapshot} />}
              {tpl?.rationale && <div style={{ marginBottom: 14, background: `${tColor}08`, border: `1px solid ${tColor}20`, borderRadius: 6, padding: 12 }}><div style={{ fontSize: 9, fontWeight: 600, color: tColor, letterSpacing: .4, marginBottom: 3 }}>TEMPLATE RATIONALE</div><p style={{ fontSize: 12, color: T.textSub, margin: 0, lineHeight: 1.5 }}>{tpl.rationale}</p></div>}
              {cohort.validation && <ValidationPanel validation={cohort.validation} />}
            </div>
          </div>
          {selected && <Inspector step={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Landing State ────────────────────────────────────────────────────
function EmptyState({ onUpload, onGenerate, loading, refNum }: { onUpload: (files: FileList) => void; onGenerate: () => void; loading: boolean; refNum: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: T.bg, padding: 40, fontFamily: T.font }}>
      <input ref={ref} type="file" accept=".json" multiple style={{ display: 'none' }} onChange={e => e.target.files && onUpload(e.target.files)} />
      <div style={{ width: 64, height: 64, borderRadius: 14, background: T.accentBg, border: `2px dashed ${T.accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🗺️</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 6 }}>Candidate Journey Planner</div>
        <div style={{ fontSize: 13, color: T.textMuted, maxWidth: 380, lineHeight: 1.6 }}>Generate AI-powered candidate engagement journeys or load an existing recommendation file.</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="cj-btn-primary" onClick={onGenerate} disabled={loading} style={{ color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: T.font, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff4', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'cj-spin 0.6s linear infinite' }} /> : <span>✦</span>}
          {loading ? 'Generating...' : `Generate Journeys`}
        </button>
        <button onClick={() => ref.current?.click()} style={{ background: T.surface, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font }}>
          📂 Load JSON
        </button>
      </div>
      {refNum && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Tenant: <strong style={{ color: T.text }}>{refNum}</strong></div>}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
const CandidateJourneys: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeDsIdx, setActiveDsIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Get refnum from selectedTenant in localStorage
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
  const refNum = selectedTenant?.refNum || "";

  const addDataset = useCallback((data: any) => {
    setDatasets(prev => {
      const idx = prev.findIndex(d => d.ref_num === data.ref_num);
      let next;
      if (idx >= 0) { next = [...prev]; next[idx] = data; }
      else next = [...prev, data];
      setActiveDsIdx(idx >= 0 ? idx : next.length - 1);
      return next;
    });
    setError(null);
  }, []);

  const handleUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(f => {
      const r = new FileReader();
      r.onload = e => { try { addDataset(JSON.parse(e.target?.result as string)); } catch { setError('Invalid JSON file.'); } };
      r.readAsText(f);
    });
  }, [addDataset]);

  const handleGenerate = useCallback(async () => {
    if (!refNum) { setError('No tenant selected. Please select a tenant first.'); return; }
    setLoading(true); setError(null);
    try {
      // The plan engine API. Uses the existing API util which adds auth headers automatically.
      const planEngineBaseUrl = (window as any)._env_?.TXE_PLAN_ENGINE_URL || 'http://txe-plan-engine.intqa.phenom.local';
      const response = await API.post(`${planEngineBaseUrl}/recommend/journeys/${refNum}`, '', {
        headers: { 'Content-Type': 'application/json' },
        timeout: 900000, // 15 min — generation can be slow
      });
      const data = response.data;
      if (data && data.recommendations) { addDataset(data); }
      else { setError('API returned unexpected response format.'); }
    } catch (err: any) {
      console.error('Error generating journeys:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate journeys. Check the plan engine is running.');
    } finally { setLoading(false); }
  }, [refNum, addDataset]);

  return (
    <div style={{ height: '100%', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes cj-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cj-btn-primary { background-color: rgb(60, 109, 104); transition: background-color 0.15s; }
        .cj-btn-primary:not(:disabled):hover { background-color: rgb(92, 165, 155); }
      `}</style>

      {/* Header — compact, aligned with TXE patterns */}
      {datasets.length > 0 && (
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, height: 44, gap: 12 }}>
          {/* Dataset tabs */}
          <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'auto' }}>
            {datasets.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setActiveDsIdx(i)} style={{ fontSize: 12, padding: '8px 12px', cursor: 'pointer', color: i === activeDsIdx ? T.accent : T.textSub, background: 'none', border: 'none', borderBottom: `2px solid ${i === activeDsIdx ? T.accent : 'transparent'}`, fontWeight: i === activeDsIdx ? 600 : 400, fontFamily: T.font, transition: 'all .15s' }}>
                  {d.ref_num}
                  <span style={{ marginLeft: 5, fontSize: 10, color: T.textMuted }}>{d.recommendations?.length} seg</span>
                </button>
                <button onClick={() => setDatasets(p => { const n = p.filter((_: any, j: number) => j !== i); setActiveDsIdx(Math.min(activeDsIdx, n.length - 1)); return n; })} style={{ fontSize: 13, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', opacity: .4 }}>×</button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <input ref={fileRef} type="file" accept=".json" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleUpload(e.target.files)} />
            <button className="cj-btn-primary" onClick={handleGenerate} disabled={loading} style={{ fontSize: 11, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', cursor: loading ? 'wait' : 'pointer', fontWeight: 500, fontFamily: T.font, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              {loading ? <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid #fff4', borderTop: '1.5px solid #fff', borderRadius: '50%', animation: 'cj-spin 0.6s linear infinite' }} /> : <span>✦</span>}
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button onClick={() => fileRef.current?.click()} style={{ fontSize: 11, color: T.textSub, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontWeight: 400, fontFamily: T.font }}>
              📂 Load
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: '#fde8eb', borderBottom: '1px solid #f5b3bc', padding: '8px 20px', fontSize: 12, color: '#c40f24', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontFamily: T.font }}>
          <span>⚠</span> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c40f24', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {datasets.length === 0
          ? <EmptyState onUpload={handleUpload} onGenerate={handleGenerate} loading={loading} refNum={refNum} />
          : <JourneyView key={activeDsIdx} ds={datasets[activeDsIdx]} />
        }
      </div>
    </div>
  );
};

export default CandidateJourneys;
