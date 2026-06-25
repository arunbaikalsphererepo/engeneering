"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { repairCategories, utilityCategories } from "@/lib/data";
import clsx from "clsx";
import {
  Zap, Wrench, Plus, Trash2, Pencil, Check, X,
  IndianRupee, ArrowRight, Tag, TrendingUp, TrendingDown,
  Minus, ChevronDown, ChevronRight as ChevronRightIcon,
  SlidersHorizontal, Copy, AlertTriangle, Target, Brain,
  Flame, BarChart3, ArrowUpRight, ArrowDownRight, Settings2,
} from "lucide-react";
import type { ExpenditureBill } from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getLast6Months(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtShort(ym: string) {
  return MONTHS_SHORT[Number(ym.split("-")[1]) - 1];
}
function fmtLong(ym: string) {
  const [y, m] = ym.split("-");
  return `${MONTHS_LONG[Number(m) - 1]} ${y}`;
}
function fmtAmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `₹${n}`;
}
function fmtFull(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// ── FinancialChart ────────────────────────────────────────────────────────────

interface MonthData {
  ym: string;
  label: string;
  actual: number;
  budget: number;
  variance: number;        // actual - budget (positive = over)
  pct: number;             // actual / budget * 100
  prevActual: number;
  mom: number;             // month-over-month change %
}

// Deterministic muted palette for up to 12 categories — monochrome-friendly
const CAT_SHADES = [
  "#0f172a","#334155","#475569","#64748b","#94a3b8","#cbd5e1",
  "#1e293b","#3f4f61","#5a6a7a","#7a8fa3","#a8bbc9","#c8d8e4",
];

function FinancialChart({
  data,
  bills,
  selectedMonth,
  onMonthSelect,
  barColor,
}: {
  data: MonthData[];
  bills: ExpenditureBill[];
  selectedMonth: string | null;
  onMonthSelect: (m: string | null) => void;
  barColor: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Per-month category breakdown (used in hover tooltip)
  const categoryIndex = useMemo(() => {
    const idx = new Map<string, { category: string; amount: number; color: string }[]>();
    const allCats = Array.from(new Set(bills.map((b) => b.category))).sort();
    for (const d of data) {
      const monthBills = bills.filter((b) => b.month === d.ym);
      const catMap = new Map<string, number>();
      for (const b of monthBills) {
        catMap.set(b.category, (catMap.get(b.category) ?? 0) + b.amount);
      }
      const rows = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => ({
          category: cat,
          amount,
          color: CAT_SHADES[allCats.indexOf(cat) % CAT_SHADES.length],
        }));
      idx.set(d.ym, rows);
    }
    return idx;
  }, [data, bills]);

  const maxVal = useMemo(() => {
    const maxActual  = Math.max(...data.map((d) => d.actual), 0);
    const maxBudget  = Math.max(...data.map((d) => d.budget), 0);
    return Math.max(maxBudget * 1.3, maxActual * 1.1, 1);
  }, [data]);

  // Rolling 6-month average per data point (up to i months trailing)
  const rollingAvg = useMemo(() =>
    data.map((_, i) => {
      const slice = data.slice(0, i + 1).filter((d) => d.actual > 0);
      if (slice.length === 0) return null;
      return slice.reduce((s, d) => s + d.actual, 0) / slice.length;
    }),
    [data],
  );

  const W = 640; const H = 240;
  const PAD_L = 52; const PAD_R = 16; const PAD_T = 24; const PAD_B = 36;
  const CHART_W = W - PAD_L - PAD_R;
  const CHART_H = H - PAD_T - PAD_B;
  const COL_W   = CHART_W / data.length;
  const BAR_W   = Math.min(40, COL_W * 0.52);
  const chartId = `fc-${barColor.replace(/[^a-z0-9]/gi, "")}`;
  const toY = (v: number) => PAD_T + CHART_H - (v / maxVal) * CHART_H;
  const toX = (i: number) => PAD_L + i * COL_W + COL_W / 2;

  const budgetY = data.length > 0 ? toY(data[0].budget) : PAD_T;

  // Smooth polyline for rolling average
  const avgPoints = rollingAvg
    .map((avg, i) => avg !== null ? `${toX(i)},${toY(avg)}` : null)
    .filter(Boolean) as string[];

  function handleBarEnter(e: React.MouseEvent, d: MonthData) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered(d.ym);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }
  function handleBarMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }
  function handleBarLeave() {
    setHovered(null);
    setTooltipPos(null);
  }

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 240 }}
        onMouseLeave={handleBarLeave}
        onMouseMove={(e) => hovered && handleBarMove(e)}
      >
        <defs>
          <linearGradient id={`${chartId}-bar`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${chartId}-over`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id={`${chartId}-empty`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <filter id={`${chartId}-glow`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={barColor} floodOpacity="0.25" />
          </filter>
          <filter id={`${chartId}-glow-over`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.3" />
          </filter>
          <clipPath id={`${chartId}-clip`}>
            <rect x={PAD_L} y={PAD_T} width={CHART_W} height={CHART_H} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const gy = toY(maxVal * frac);
          return (
            <g key={frac}>
              <line x1={PAD_L} y1={gy} x2={W - PAD_R} y2={gy}
                stroke={frac === 0 ? "#cbd5e1" : "#f1f5f9"} strokeWidth={frac === 0 ? 1 : 1} />
              <text x={PAD_L - 6} y={gy + 4} fontSize={9} fill="#94a3b8" textAnchor="end" fontWeight="500">
                {fmtAmt(maxVal * frac)}
              </text>
            </g>
          );
        })}

        {/* Budget dashed line */}
        <line x1={PAD_L} y1={budgetY} x2={W - PAD_R} y2={budgetY}
          stroke="#64748b" strokeDasharray="5 4" strokeWidth={1.5} opacity={0.6} />
        <rect x={W - PAD_R - 88} y={budgetY - 14} width={82} height={16} rx={8}
          fill="white" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W - PAD_R - 7} y={budgetY - 3} textAnchor="end" fontSize={8.5} fill="#475569" fontWeight="700">
          Budget {fmtAmt(data[0]?.budget ?? 0)}
        </text>

        {/* Rolling average polyline */}
        {avgPoints.length >= 2 && (
          <>
            <polyline
              points={avgPoints.join(" ")}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              clipPath={`url(#${chartId}-clip)`}
              opacity={0.7}
            />
            {avgPoints.map((pt, i) => {
              const [px, py] = pt.split(",").map(Number);
              return <circle key={i} cx={px} cy={py} r={2.5} fill="white" stroke="#94a3b8" strokeWidth={1.5} />;
            })}
          </>
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const barH    = d.actual > 0 ? Math.max(2, (d.actual / maxVal) * CHART_H) : 0;
          const budgetH = Math.max(2, (d.budget / maxVal) * CHART_H);
          const cx      = toX(i);
          const bx      = cx - BAR_W / 2;
          const barY    = PAD_T + CHART_H - barH;
          const budgetBarY = PAD_T + CHART_H - budgetH;
          const over    = d.actual > 0 && d.actual > d.budget;
          const isSel   = selectedMonth === d.ym;
          const isHov   = hovered === d.ym;

          const fillGradient = d.actual === 0
            ? `url(#${chartId}-empty)`
            : over
              ? `url(#${chartId}-over)`
              : `url(#${chartId}-bar)`;

          const glowFilter = d.actual > 0
            ? over
              ? `url(#${chartId}-glow-over)`
              : `url(#${chartId}-glow)`
            : undefined;

          return (
            <g key={d.ym}>
              {/* Column hover zone */}
              <rect
                x={cx - COL_W / 2 + 2} y={PAD_T} width={COL_W - 4} height={CHART_H + PAD_B - 6}
                fill={isSel ? `${barColor}08` : isHov ? "#f8fafc" : "transparent"}
                rx={8}
                style={{ cursor: d.actual > 0 ? "pointer" : "default" }}
                onMouseEnter={(e) => d.actual > 0 && handleBarEnter(e, d)}
                onMouseMove={(e) => d.actual > 0 && handleBarMove(e)}
                onClick={() => d.actual > 0 && onMonthSelect(isSel ? null : d.ym)}
              />

              {/* Budget ghost bar (faint background) */}
              <rect
                x={bx} y={budgetBarY} width={BAR_W} height={budgetH}
                rx={5} fill="#e2e8f0" opacity={0.45}
              />

              {/* Stacked category segments (visible when hovered, plain fill otherwise) */}
              {d.actual > 0 && (() => {
                const cats = categoryIndex.get(d.ym) ?? [];
                if (isHov && cats.length > 1) {
                  // Draw stacked segments bottom→top proportionally
                  let stackY = PAD_T + CHART_H; // start at bottom
                  return (
                    <g clipPath={`url(#${chartId}-clip)`}>
                      {cats.map(({ category, amount, color }) => {
                        const segH = Math.max(1, (amount / maxVal) * CHART_H);
                        stackY -= segH;
                        const y = stackY;
                        return (
                          <rect key={category} x={bx} y={y} width={BAR_W} height={segH}
                            fill={color} opacity={over ? 0.75 : 0.82}
                            rx={0}
                          />
                        );
                      })}
                      {/* Top rounded cap */}
                      <rect x={bx} y={barY} width={BAR_W} height={Math.min(6, barH)}
                        rx={5} fill={cats[0]?.color ?? barColor} opacity={over ? 0.75 : 0.82} />
                      {/* Over-budget overflow stripe */}
                      {over && (
                        <rect x={bx} y={barY} width={BAR_W} height={barH - budgetH}
                          fill="#ef4444" opacity={0.25} rx={3} />
                      )}
                      {over && (
                        <line x1={bx} y1={budgetBarY} x2={bx + BAR_W} y2={budgetBarY}
                          stroke="#ef4444" strokeWidth={2} strokeDasharray="3 2" opacity={0.9} />
                      )}
                    </g>
                  );
                }
                // Default: plain gradient fill
                return (
                  <>
                    {!over && (
                      <rect x={bx} y={barY} width={BAR_W} height={barH}
                        rx={5} fill={fillGradient} filter={glowFilter} />
                    )}
                    {over && (
                      <>
                        <rect x={bx} y={budgetBarY} width={BAR_W} height={budgetH}
                          rx={5} fill={`url(#${chartId}-bar)`} opacity={0.5} />
                        <rect x={bx} y={barY} width={BAR_W} height={barH - budgetH}
                          rx={3} fill={fillGradient} filter={glowFilter} />
                        <line x1={bx} y1={budgetBarY} x2={bx + BAR_W} y2={budgetBarY}
                          stroke="#ef4444" strokeWidth={2} strokeDasharray="3 2" opacity={0.8} />
                      </>
                    )}
                  </>
                );
              })()}

              {/* Selected border */}
              {isSel && d.actual > 0 && (
                <rect x={bx - 2} y={barY - 2} width={BAR_W + 4} height={barH + 4}
                  rx={7} fill="none" stroke={over ? "#ef4444" : barColor} strokeWidth={2} opacity={0.8} />
              )}

              {/* Amount label above bar */}
              {d.actual > 0 && (
                <text x={cx} y={barY - 6} textAnchor="middle" fontSize={9} fontWeight="700"
                  fill={over ? "#ef4444" : "#334155"}>
                  {fmtAmt(d.actual)}
                </text>
              )}

              {/* Trend arrow + MoM change */}
              {d.actual > 0 && d.prevActual > 0 && (
                <g>
                  <text x={cx} y={barY - 17} textAnchor="middle" fontSize={8} fontWeight="600"
                    fill={d.mom > 5 ? "#ef4444" : d.mom < -5 ? "#22c55e" : "#94a3b8"}>
                    {d.mom > 0 ? "↑" : d.mom < 0 ? "↓" : "→"}{Math.abs(d.mom).toFixed(0)}%
                  </text>
                </g>
              )}

              {/* Month label */}
              <text x={cx} y={H - PAD_B + 16} textAnchor="middle" fontSize={10}
                fill={isSel ? (over ? "#ef4444" : barColor) : "#64748b"} fontWeight={isSel ? "700" : "500"}>
                {d.label}
              </text>

              {/* Utilization % below month label */}
              {d.actual > 0 && (
                <text x={cx} y={H - PAD_B + 27} textAnchor="middle" fontSize={7.5} fill="#94a3b8" fontWeight="500">
                  {d.pct.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Rich category-breakdown tooltip */}
      {hovered && tooltipPos && (() => {
        const d = data.find((x) => x.ym === hovered);
        if (!d || d.actual === 0) return null;
        const cats = categoryIndex.get(hovered) ?? [];
        // Position: keep tooltip inside the chart container
        const tipW = 224;
        const rawLeft = tooltipPos.x + 14;
        // svgRef gives us the SVG width in pixels
        const svgW = svgRef.current?.clientWidth ?? 600;
        const left = rawLeft + tipW > svgW ? tooltipPos.x - tipW - 8 : rawLeft;
        return (
          <div
            className="pointer-events-none absolute z-30 bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ left, top: Math.max(4, tooltipPos.y - 80), width: tipW }}
          >
            {/* Header */}
            <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-700/60">
              <p className="text-[11px] font-bold text-white">{fmtLong(d.ym)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">Total spent</span>
                <span className={clsx("text-[13px] font-bold", d.actual > d.budget ? "text-red-400" : "text-white")}>
                  {fmtFull(d.actual)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-slate-400">Budget</span>
                <span className="text-[11px] text-slate-300">{fmtFull(d.budget)}</span>
              </div>
              {/* Budget utilization bar */}
              <div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(d.pct, 100)}%`,
                    background: d.actual > d.budget ? "#ef4444" : barColor,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-500">
                  {d.pct.toFixed(0)}% utilized
                  {d.actual > d.budget && <span className="text-red-400 ml-1">· over budget</span>}
                </span>
                {d.prevActual > 0 && (
                  <span className={clsx("text-[9px] font-semibold", d.mom > 0 ? "text-red-400" : "text-emerald-400")}>
                    {d.mom > 0 ? "↑" : "↓"}{Math.abs(d.mom).toFixed(0)}% vs prev
                  </span>
                )}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="px-3.5 py-2.5 space-y-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">By category</p>
              {cats.slice(0, 6).map(({ category, amount, color }) => {
                const pct = d.actual > 0 ? (amount / d.actual) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span className="text-[10px] text-slate-300 truncate max-w-[110px]">{category}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] text-slate-500">{pct.toFixed(0)}%</span>
                        <span className="text-[10px] font-semibold text-white">{fmtAmt(amount)}</span>
                      </div>
                    </div>
                    {/* Proportional bar */}
                    <div className="h-0.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {cats.length > 6 && (
                <p className="text-[9px] text-slate-500 pt-0.5">+{cats.length - 6} more categories</p>
              )}
            </div>

            <div className="px-3.5 pb-2.5">
              <p className="text-[9px] text-slate-600 italic">Click to open full breakdown →</p>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-400 mt-3 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: barColor, opacity: 0.8 }} />
          Within budget
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400 opacity-80" />
          Over budget
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-200" />
          Budget bar
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="10">
            <line x1="0" y1="5" x2="18" y2="5" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
            <circle cx="9" cy="5" r="2" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
          6-month avg
        </span>
        <span className="flex items-center gap-1.5 italic">↑↓ MoM % · click to drill down</span>
      </div>
    </div>
  );
}

// ── Month Utilization Summary Row ─────────────────────────────────────────────

function MonthCards({
  data,
  selectedMonth,
  onSelect,
  barColor,
}: {
  data: MonthData[];
  selectedMonth: string | null;
  onSelect: (m: string | null) => void;
  barColor: string;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
      {data.map((d) => {
        const isSel  = selectedMonth === d.ym;
        const over   = d.actual > 0 && d.actual > d.budget;
        const pctClamped = Math.min(d.pct, 100);
        const isCurrent = d.ym === currentMonth();

        return (
          <button
            key={d.ym}
            onClick={() => d.actual > 0 && onSelect(isSel ? null : d.ym)}
            disabled={d.actual === 0}
            className={clsx(
              "relative rounded-xl border text-left p-2.5 transition-all duration-150 group overflow-hidden",
              d.actual === 0 ? "opacity-40 cursor-default" : "cursor-pointer",
              isSel
                ? over
                  ? "border-red-300 bg-red-50 shadow-sm"
                  : "border-slate-800 bg-slate-900 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
            )}
          >
            {isCurrent && (
              <span className="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Now</span>
            )}
            <p className={clsx("text-[10px] font-bold uppercase tracking-wide mb-1",
              isSel && !over ? "text-slate-400" : "text-slate-500")}>{d.label}</p>
            <p className={clsx("text-sm font-bold leading-none mb-2",
              over ? "text-red-600" : isSel ? "text-white" : "text-slate-900")}>
              {d.actual > 0 ? fmtAmt(d.actual) : "—"}
            </p>
            {/* Utilization progress fill */}
            <div className={clsx("h-1 rounded-full overflow-hidden", isSel && !over ? "bg-slate-700" : "bg-slate-100")}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: d.actual > 0 ? `${pctClamped}%` : "0%",
                  background: over ? "#ef4444" : isSel ? "white" : barColor,
                }}
              />
            </div>
            {d.actual > 0 && (
              <p className={clsx("text-[9px] font-semibold mt-1",
                over ? "text-red-500" : isSel ? "text-slate-400" : "text-slate-400")}>
                {d.pct.toFixed(0)}%{over ? " ↑OB" : ""}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Analytics KPI Bar ─────────────────────────────────────────────────────────

function AnalyticsBar({
  data,
  bills,
  budget,
  type,
}: {
  data: MonthData[];
  bills: ExpenditureBill[];
  budget: number;
  type: "utility" | "repair";
}) {
  const completedMonths = data.filter((d) => d.actual > 0 && d.ym !== currentMonth());
  const cur = data.find((d) => d.ym === currentMonth());

  // Top spending category across all 6 months
  const catMap = new Map<string, number>();
  bills.forEach((b) => { catMap.set(b.category, (catMap.get(b.category) ?? 0) + b.amount); });
  const topCat = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];

  // Highest variance month
  const worstMonth = completedMonths.length > 0
    ? completedMonths.reduce((a, b) => Math.abs(b.variance) > Math.abs(a.variance) ? b : a)
    : null;

  // Predicted month-end spend (linear extrapolation from day in month)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed  = now.getDate();
  const predicted   = cur && cur.actual > 0 && daysPassed > 0
    ? Math.round((cur.actual / daysPassed) * daysInMonth)
    : null;

  // Budget health score: % of months within budget × avg utilization quality
  const withinBudget = completedMonths.filter((d) => d.actual <= d.budget).length;
  const healthScore  = completedMonths.length > 0
    ? Math.round((withinBudget / completedMonths.length) * 100)
    : null;

  const kpis = [
    {
      icon: Flame,
      label: "Top category",
      value: topCat ? topCat[0].split(" ")[0] : "—",
      sub: topCat ? fmtAmt(topCat[1]) : "",
      accent: false,
    },
    {
      icon: AlertTriangle,
      label: "Highest variance",
      value: worstMonth ? fmtShort(worstMonth.ym) : "—",
      sub: worstMonth
        ? `${worstMonth.variance > 0 ? "+" : ""}${fmtAmt(worstMonth.variance)}`
        : "All within budget",
      accent: worstMonth ? worstMonth.variance > 0 : false,
    },
    {
      icon: Brain,
      label: "Predicted month-end",
      value: predicted ? fmtAmt(predicted) : "—",
      sub: predicted
        ? predicted > budget ? "Over budget" : `${((predicted / budget) * 100).toFixed(0)}% of budget`
        : "Insufficient data",
      accent: predicted ? predicted > budget : false,
    },
    {
      icon: Target,
      label: "Budget health",
      value: healthScore !== null ? `${healthScore}%` : "—",
      sub: healthScore !== null
        ? healthScore >= 80 ? "Strong" : healthScore >= 50 ? "Moderate" : "Needs attention"
        : "No completed months",
      accent: healthScore !== null && healthScore < 50,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {kpis.map(({ icon: Icon, label, value, sub, accent }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3">
          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
            accent ? "bg-red-50" : "bg-slate-50")}>
            <Icon size={15} className={accent ? "text-red-500" : "text-slate-500"} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
            <p className={clsx("text-sm font-bold truncate", accent ? "text-red-600" : "text-slate-900")}>{value}</p>
            <p className={clsx("text-[10px] truncate mt-0.5", accent ? "text-red-400" : "text-slate-400")}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Month Slide-Over ──────────────────────────────────────────────────────────

function MonthSlideOver({
  bills,
  month,
  allBills,
  budgets,
  type,
  barColor,
  onClose,
}: {
  bills: ExpenditureBill[];
  month: string;
  allBills: ExpenditureBill[];
  budgets: import("@/lib/types").ExpenditureBudgets;
  type: "utility" | "repair";
  barColor: string;
  onClose: () => void;
}) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const pm        = prevMonth(month);
  const prevBills = allBills.filter((b) => b.type === type && b.month === pm);
  const total     = bills.reduce((s, b) => s + b.amount, 0);
  const monthBudget = type === "utility" ? budgets.utility : budgets.repair;
  const over        = total > monthBudget;
  const variance    = total - monthBudget;
  const utilPct     = monthBudget > 0 ? (total / monthBudget) * 100 : 0;

  const catBudgetList = type === "utility" ? budgets.utilityCategories : budgets.repairCategories;
  function getCatBudget(cat: string): number {
    const key = `${type}:${month}:${cat}`;
    if (budgets.overrides[key] !== undefined) return budgets.overrides[key];
    return catBudgetList.find((c) => c.category === cat)?.amount ?? 0;
  }

  const categoryRows = useMemo(() => {
    const map = new Map<string, { amount: number; bills: ExpenditureBill[] }>();
    for (const b of bills) {
      const cat = b.category || "Uncategorised";
      const ex  = map.get(cat) ?? { amount: 0, bills: [] };
      map.set(cat, { amount: ex.amount + b.amount, bills: [...ex.bills, b] });
    }
    return Array.from(map.entries())
      .map(([cat, d]) => {
        const prevAmt   = prevBills.filter((b) => b.category === cat).reduce((s, b) => s + b.amount, 0);
        const catBudget = getCatBudget(cat);
        const catVar    = d.amount - catBudget;
        const pct       = catBudget > 0 ? (d.amount / catBudget) * 100 : 0;
        const mom       = prevAmt > 0 ? ((d.amount - prevAmt) / prevAmt) * 100 : null;
        const pctOfTotal = total > 0 ? (d.amount / total) * 100 : 0;
        return { category: cat, amount: d.amount, bills: d.bills, budget: catBudget, variance: catVar, pct, mom, pctOfTotal };
      })
      .sort((a, b) => b.amount - a.amount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, prevBills, month, type, budgets]);

  // Horizontal stacked bar segments for the composition strip
  const stackedSegments = useMemo(() => {
    let cursor = 0;
    return categoryRows.map(({ category, pctOfTotal }, i) => {
      const left = cursor;
      cursor += pctOfTotal;
      return { category, left, width: pctOfTotal, color: CAT_SHADES[i % CAT_SHADES.length] };
    });
  }, [categoryRows]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] z-40 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-[520px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          mounted ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-0 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: barColor }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MIS Category Breakdown
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{fmtLong(month)}</h3>
            </div>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0 mt-0.5"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Summary scorecards ─────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Total spend */}
            <div className="bg-slate-50 rounded-xl px-3.5 py-3 col-span-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Spent</p>
              <p className={clsx("text-[17px] font-bold leading-none", over ? "text-red-600" : "text-slate-900")}>
                {fmtAmt(total)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">{fmtFull(total)}</p>
            </div>
            {/* Budget */}
            <div className="bg-slate-50 rounded-xl px-3.5 py-3 col-span-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Budget</p>
              <p className="text-[17px] font-bold text-slate-900 leading-none">{fmtAmt(monthBudget)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{utilPct.toFixed(0)}% utilized</p>
            </div>
            {/* Variance */}
            <div className={clsx("rounded-xl px-3.5 py-3 col-span-1", over ? "bg-red-50" : "bg-emerald-50")}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {over ? "Over By" : "Under By"}
              </p>
              <p className={clsx("text-[17px] font-bold leading-none", over ? "text-red-600" : "text-emerald-600")}>
                {fmtAmt(Math.abs(variance))}
              </p>
              <p className={clsx("text-[10px] mt-1", over ? "text-red-400" : "text-emerald-500")}>
                {over ? "↑ Exceeded budget" : "↓ Within budget"}
              </p>
            </div>
          </div>

          {/* ── Budget utilization bar ──────────────────────────────────── */}
          <div className="mb-1">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Budget utilization</span>
              <span className={clsx("font-bold", over ? "text-red-500" : "text-slate-600")}>
                {utilPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(utilPct, 100)}%`,
                  background: over ? "#ef4444" : barColor,
                }}
              />
            </div>
          </div>

          {/* ── Stacked composition strip ───────────────────────────────── */}
          <div className="mt-4 mb-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Spend composition
            </p>
            <div className="relative h-5 rounded-lg overflow-hidden bg-slate-100 flex">
              {stackedSegments.map(({ category, width, color }) => (
                <div
                  key={category}
                  title={`${category}: ${width.toFixed(1)}%`}
                  className="h-full transition-all duration-500"
                  style={{ width: `${width}%`, background: color }}
                />
              ))}
            </div>
            {/* Legend dots */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pb-4">
              {stackedSegments.slice(0, 6).map(({ category, width, color }) => (
                <div key={category} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                  <span className="text-[9px] text-slate-500 truncate max-w-[80px]">{category}</span>
                  <span className="text-[9px] font-semibold text-slate-400">{width.toFixed(0)}%</span>
                </div>
              ))}
              {stackedSegments.length > 6 && (
                <span className="text-[9px] text-slate-400">+{stackedSegments.length - 6} more</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable category rows ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            {categoryRows.length} {categoryRows.length === 1 ? "Category" : "Categories"} · {bills.length} Bills
          </p>

          {categoryRows.map(({ category, amount, bills: catBills, budget: catBudget, variance: catVar, pct, mom, pctOfTotal }, idx) => {
            const isExpanded = expandedCat === category;
            const catOver    = catBudget > 0 && amount > catBudget;
            const pctClamped = Math.min(pct, 100);
            const segColor   = CAT_SHADES[idx % CAT_SHADES.length];

            return (
              <div
                key={category}
                className={clsx(
                  "rounded-2xl border overflow-hidden transition-all duration-150",
                  isExpanded ? "border-slate-300 shadow-sm" : "border-slate-200 hover:border-slate-300",
                )}
              >
                {/* Row header — always visible */}
                <button
                  className="w-full flex items-stretch gap-0 text-left"
                  onClick={() => setExpandedCat(isExpanded ? null : category)}
                >
                  {/* Color accent bar */}
                  <div className="w-1 flex-shrink-0 self-stretch" style={{ background: segColor }} />

                  <div className="flex-1 min-w-0 px-4 py-3.5">
                    {/* Top row: name + amount */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">{category}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pctOfTotal.toFixed(1)}% of total spend</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={clsx("text-[14px] font-bold leading-none", catOver ? "text-red-600" : "text-slate-900")}>
                          {fmtFull(amount)}
                        </p>
                        {catBudget > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            budget {fmtAmt(catBudget)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar with budget fill */}
                    {catBudget > 0 && (
                      <div className="mb-2.5">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pctClamped}%`, background: catOver ? "#ef4444" : segColor }}
                          />
                        </div>
                        {catOver && (
                          <div
                            className="h-1.5 rounded-full mt-0.5 overflow-hidden bg-red-100"
                            title="Overflow"
                          >
                            <div
                              className="h-full rounded-full bg-red-400"
                              style={{ width: `${Math.min(((amount - catBudget) / catBudget) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats chips row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {catBudget > 0 && (
                        <span className={clsx(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          catOver
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-slate-100 text-slate-600",
                        )}>
                          {pct.toFixed(0)}% utilized
                        </span>
                      )}
                      {catBudget > 0 && (
                        <span className={clsx(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          catVar > 0
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        )}>
                          {catVar > 0 ? "+" : ""}{fmtAmt(catVar)} variance
                        </span>
                      )}
                      {mom !== null && (
                        <span className={clsx(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                          mom > 5
                            ? "bg-red-50 text-red-500 border border-red-200"
                            : mom < -5
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-slate-100 text-slate-500",
                        )}>
                          {mom > 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                          {Math.abs(mom).toFixed(0)}% vs prev mo
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {catBills.length} {catBills.length === 1 ? "bill" : "bills"}
                        {isExpanded
                          ? <ChevronDown size={11} className="inline ml-1 text-slate-400" />
                          : <ChevronRightIcon size={11} className="inline ml-1 text-slate-300" />}
                      </span>
                    </div>
                  </div>
                </button>

                {/* ── Expanded bill rows ──────────────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 animate-in">
                    {/* Mini horizontal bar chart for individual bills */}
                    {catBills.length > 1 && (() => {
                      const maxBillAmt = Math.max(...catBills.map((b) => b.amount));
                      return (
                        <div className="px-5 pt-3 pb-2 space-y-1.5 bg-slate-50/60">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Bill breakdown
                          </p>
                          {[...catBills].sort((a, b) => b.amount - a.amount).map((bill) => (
                            <div key={`bar-${bill.id}`} className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-[10px] text-slate-600 truncate">{bill.description}</span>
                                  <span className="text-[10px] font-bold text-slate-700 flex-shrink-0">{fmtAmt(bill.amount)}</span>
                                </div>
                                <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${(bill.amount / maxBillAmt) * 100}%`,
                                      background: segColor,
                                      opacity: 0.7,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Full bill detail rows */}
                    <div className="divide-y divide-slate-50">
                      {[...catBills].sort((a, b) => b.amount - a.amount).map((bill) => (
                        <div key={bill.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: segColor, opacity: 0.6 }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">{bill.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                              {bill.reference && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{bill.reference}</span>}
                              <span>{bill.uploadedAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[13px] font-bold text-slate-800">{fmtFull(bill.amount)}</span>
                            {bill.billCopyDataUrl && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">PDF</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Category subtotal footer */}
                    <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100/80 border-t border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {category} subtotal
                      </span>
                      <span className={clsx("text-[13px] font-bold", catOver ? "text-red-600" : "text-slate-700")}>
                        {fmtFull(amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total spend · {fmtLong(month)}</p>
              <p className={clsx("text-lg font-bold mt-0.5", over ? "text-red-600" : "text-slate-900")}>
                {fmtFull(total)}
              </p>
            </div>
            {over && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-red-600">Over by {fmtFull(Math.abs(variance))}</p>
                  <p className="text-[9px] text-red-400">{(utilPct - 100).toFixed(0)}% above limit</p>
                </div>
              </div>
            )}
            {!over && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <Check size={13} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-700">Within budget</p>
                  <p className="text-[9px] text-emerald-500">{fmtFull(Math.abs(variance))} remaining</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Manage Budgets Panel ──────────────────────────────────────────────────────

function ManageBudgets({
  type,
  budgets,
  categories,
  onClose,
  onSaveTotal,
  onSaveCategory,
  onCopyPrev,
  selectedMonth,
}: {
  type: "utility" | "repair";
  budgets: import("@/lib/types").ExpenditureBudgets;
  categories: string[];
  onClose: () => void;
  onSaveTotal: (amount: number) => void;
  onSaveCategory: (category: string, amount: number) => void;
  onCopyPrev: () => void;
  selectedMonth: string;
}) {
  const [mounted, setMounted] = useState(false);
  const catBudgetList = type === "utility" ? budgets.utilityCategories : budgets.repairCategories;

  // Initialise inputs from overrides or defaults
  const [catInputs, setCatInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    categories.forEach((cat) => {
      const override = budgets.overrides[`${type}:${selectedMonth}:${cat}`];
      const def = catBudgetList.find((c) => c.category === cat)?.amount ?? 0;
      init[cat] = String(override !== undefined ? override : def);
    });
    return init;
  });

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Total is always the live sum of category inputs
  const catTotal = useMemo(
    () => Object.values(catInputs).reduce((s, v) => s + (parseFloat(v.replace(/[^0-9.]/g, "")) || 0), 0),
    [catInputs],
  );

  const maxCat = useMemo(
    () => Math.max(...Object.values(catInputs).map((v) => parseFloat(v.replace(/[^0-9.]/g, "")) || 0), 1),
    [catInputs],
  );

  function parseAmt(v: string) { return parseFloat(v.replace(/[^0-9.]/g, "")) || 0; }

  function handleSave() {
    // Total budget = sum of all categories
    if (catTotal > 0) onSaveTotal(catTotal);
    categories.forEach((cat) => {
      const v = parseAmt(catInputs[cat] ?? "0");
      if (v >= 0) onSaveCategory(cat, v);
    });
    onClose();
  }

  return (
    <>
      <div
        className={clsx("fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div className={clsx(
        "fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
        mounted ? "translate-x-0" : "translate-x-full",
      )}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="eyebrow">Budget Management</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Set Category Budgets</h3>
            <p className="text-xs text-slate-400 mt-1">{fmtLong(selectedMonth)}</p>
          </div>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0 mt-0.5"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live total summary */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total budget (auto-calculated)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{fmtFull(catTotal)}</p>
          </div>
          <button
            className="btn btn-sm gap-1.5 text-xs flex-shrink-0"
            onClick={() => { onCopyPrev(); onClose(); }}
          >
            <Copy size={12} /> Copy prev month
          </button>
        </div>

        {/* Category inputs */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Budget per MIS category — sum becomes the monthly total
          </p>
          {categories.map((cat) => {
            const val = parseAmt(catInputs[cat] ?? "0");
            const barPct = maxCat > 0 ? (val / maxCat) * 100 : 0;
            const totalPct = catTotal > 0 ? (val / catTotal) * 100 : 0;
            return (
              <div key={cat} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-800 truncate">{cat}</p>
                    {val > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {totalPct.toFixed(1)}% of total
                      </p>
                    )}
                  </div>
                  <div className="relative w-36 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
                    <input
                      className="input h-9 pl-7 text-sm font-semibold text-slate-900"
                      value={catInputs[cat] ?? ""}
                      onChange={(e) => setCatInputs((p) => ({ ...p, [cat]: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                {/* Proportional bar */}
                {val > 0 && (
                  <div className="mt-2.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${barPct}%`, background: "#334155" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>{categories.length} categories</span>
            <span>Total: <span className="font-bold text-slate-700">{fmtFull(catTotal)}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn flex-1 justify-center" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary flex-1 justify-center gap-2" onClick={handleSave}>
              <Check size={14} /> Save budgets
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Bills List ────────────────────────────────────────────────────────────────

function BillsList({
  bills,
  onDelete,
}: {
  bills: ExpenditureBill[];
  onDelete: (id: string) => void;
}) {
  if (bills.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-slate-400">No bills uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin pr-1">
      {[...bills]
        .sort((a, b) => b.month.localeCompare(a.month) || b.uploadedAt.localeCompare(a.uploadedAt))
        .map((bill) => (
          <div key={bill.id}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{bill.description}</p>
                {bill.category && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wide">
                    {bill.category.split(" ")[0]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                <span>{fmtLong(bill.month)}</span>
                {bill.reference && <span className="font-mono">{bill.reference}</span>}
              </div>
            </div>
            <p className="text-[13px] font-bold text-slate-800 flex-shrink-0">{fmtFull(bill.amount)}</p>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
              onClick={() => onDelete(bill.id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExpenditureSectionPage({
  type,
  title,
  barColor,
}: {
  type: "utility" | "repair";
  title: string;
  barColor: string;
}) {
  const { bills, budgets, deleteBill, setBudget, setCategoryBudget, setCategoryBudgetOverride, copyPrevMonthBudgets } = useStore();
  const myBills   = bills.filter((b) => b.type === type);
  const totalBudget = type === "utility" ? budgets.utility : budgets.repair;
  const Icon      = type === "utility" ? Zap : Wrench;
  const categories = type === "utility" ? utilityCategories : repairCategories;

  const [selectedMonth,   setSelectedMonth]   = useState<string | null>(null);
  const [showManage,      setShowManage]       = useState(false);
  const [showBillsExpand, setShowBillsExpand] = useState(false);

  const months = useMemo(() => getLast6Months(), []);
  const curMonth = currentMonth();

  const monthData = useMemo((): MonthData[] =>
    months.map((ym, i) => {
      const actual      = myBills.filter((b) => b.month === ym).reduce((s, b) => s + b.amount, 0);
      const prevYm      = months[i - 1];
      const prevActual  = prevYm ? myBills.filter((b) => b.month === prevYm).reduce((s, b) => s + b.amount, 0) : 0;
      const mom         = prevActual > 0 ? ((actual - prevActual) / prevActual) * 100 : 0;
      const pct         = totalBudget > 0 ? (actual / totalBudget) * 100 : 0;
      const variance    = actual - totalBudget;
      return { ym, label: fmtShort(ym), actual, budget: totalBudget, variance, pct, prevActual, mom };
    }),
    [months, myBills, totalBudget],
  );

  const thisMonth = monthData.find((d) => d.ym === curMonth);
  const over      = thisMonth ? thisMonth.actual > thisMonth.budget : false;

  const selectedMonthBills = selectedMonth
    ? myBills.filter((b) => b.month === selectedMonth)
    : [];

  // Budget management for the manage panel — use selected or current month
  const managingMonth = selectedMonth ?? curMonth;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            over ? "bg-red-50" : "bg-slate-100")}>
            <Icon size={18} className={over ? "text-red-500" : "text-slate-600"} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Monthly spend vs budget · MIS breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="btn btn-sm gap-1.5"
            onClick={() => setShowManage(true)}
          >
            <Settings2 size={13} /> Manage Budgets
          </button>
          <Link className="btn btn-primary btn-sm gap-1.5" href={`/insights/${type}/upload`}>
            <Plus size={13} /> Upload Bill
          </Link>
        </div>
      </div>

      {/* Analytics KPI bar */}
      <AnalyticsBar data={monthData} bills={myBills} budget={totalBudget} type={type} />

      {/* Chart card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Budget summary strip */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {fmtLong(curMonth)} · Budget Performance
              </p>
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-[10px] text-slate-400">Spent</p>
                  <p className={clsx("text-xl font-bold", over ? "text-red-600" : "text-slate-900")}>
                    {fmtFull(thisMonth?.actual ?? 0)}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-[10px] text-slate-400">Budget</p>
                  <p className="text-xl font-bold text-slate-900">{fmtFull(totalBudget)}</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-[10px] text-slate-400">{over ? "Over by" : "Remaining"}</p>
                  <p className={clsx("text-xl font-bold", over ? "text-red-600" : "text-emerald-600")}>
                    {fmtFull(Math.abs((thisMonth?.variance ?? 0)))}
                  </p>
                </div>
              </div>
            </div>

            {/* Utilization donut */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 44 44" className="w-16 h-16 -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle cx="22" cy="22" r="18" fill="none"
                    stroke={over ? "#ef4444" : barColor}
                    strokeWidth="5"
                    strokeDasharray={`${Math.min(thisMonth?.pct ?? 0, 100) * 1.131} 113.1`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <span className={clsx("absolute inset-0 flex items-center justify-center text-xs font-bold",
                  over ? "text-red-600" : "text-slate-700")}>
                  {Math.round(thisMonth?.pct ?? 0)}%
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Utilization</p>
                <p className={clsx("text-sm font-bold", over ? "text-red-600" : "text-slate-700")}>
                  {over ? "Over budget" : thisMonth?.pct ?? 0 >= 90 ? "Near limit" : "On track"}
                </p>
                {thisMonth && thisMonth.prevActual > 0 && (
                  <p className={clsx("text-[10px] flex items-center gap-0.5 mt-0.5",
                    thisMonth.mom > 0 ? "text-red-400" : "text-emerald-500")}>
                    {thisMonth.mom > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(thisMonth.mom).toFixed(0)}% vs last month
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart + month cards */}
        <div className="px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Monthly Spend vs Budget — Last 6 Months
          </p>
          <FinancialChart
            data={monthData}
            bills={myBills}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
            barColor={barColor}
          />
          <MonthCards
            data={monthData}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
            barColor={barColor}
          />
        </div>
      </div>

      {/* Bills list card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
          onClick={() => setShowBillsExpand((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <IndianRupee size={13} className="text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-800">All Uploaded Bills</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {myBills.length}
            </span>
          </div>
          <ChevronDown size={15} className={clsx("text-slate-400 transition-transform duration-200",
            showBillsExpand ? "rotate-180" : "")} />
        </button>

        {showBillsExpand && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-in">
            <BillsList bills={myBills} onDelete={deleteBill} />
          </div>
        )}
      </div>

      {/* Month slide-over */}
      {selectedMonth && selectedMonthBills.length > 0 && (
        <MonthSlideOver
          bills={selectedMonthBills}
          month={selectedMonth}
          allBills={myBills}
          budgets={budgets}
          type={type}
          barColor={barColor}
          onClose={() => setSelectedMonth(null)}
        />
      )}

      {/* Empty state when month selected but no bills */}
      {selectedMonth && selectedMonthBills.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedMonth(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 text-center max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
            <BarChart3 size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-1">No bills for {fmtLong(selectedMonth)}</p>
            <p className="text-xs text-slate-400 mb-4">Upload bills to see the category breakdown.</p>
            <button className="btn btn-sm" onClick={() => setSelectedMonth(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Manage budgets slide-over */}
      {showManage && (
        <ManageBudgets
          type={type}
          budgets={budgets}
          categories={categories}
          selectedMonth={managingMonth}
          onClose={() => setShowManage(false)}
          onSaveTotal={(amount) => setBudget(type, amount)}
          onSaveCategory={(cat, amount) => {
            setCategoryBudget(type, cat, amount);
            if (managingMonth !== curMonth) {
              setCategoryBudgetOverride(type, managingMonth, cat, amount);
            }
          }}
          onCopyPrev={() => copyPrevMonthBudgets(type, managingMonth)}
        />
      )}
    </div>
  );
}
