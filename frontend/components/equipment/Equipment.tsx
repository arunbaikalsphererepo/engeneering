"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import AssetQr from "@/components/ui/AssetQr";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import {
  HardHat, Plus, Download, SlidersHorizontal, CalendarClock,
  ArrowUpDown, Trash2, Pencil, Eye, QrCode, PackageX, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import type { Equipment, NonQRItem } from "@/lib/types";

// ── atoms ────────────────────────────────────────────────────────────────────
function HealthBar({ value }: { value: number }) {
  const color = value >= 85 ? "#0f172a" : value >= 60 ? "#c2410c" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 99, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{value}%</span>
    </div>
  );
}

function StatusBadge({ text }: { text: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    Active:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    Expired:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "Due Soon":{ bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    Healthy:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    Attention: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    Good:      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    Fair:      { bg: "#fefce8", color: "#854d0e", border: "#fef08a" },
    Poor:      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const c = cfg[text] ?? { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 5, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

export default function EquipmentRegistry() {
  const { equipmentAssets, nonQRItems, activeRole, deleteEquipment, deleteNonQRItem } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteCandidate,       setDeleteCandidate]       = useState<Equipment | null>(null);
  const [deleteNonQRCandidate,  setDeleteNonQRCandidate]  = useState<NonQRItem | null>(null);
  const [register,              setRegister]              = useState<"qr" | "nonqr">("qr");

  useEffect(() => {
    if (searchParams.get("tab") === "nonqr") setRegister("nonqr");
  }, [searchParams]);
  const [nonQRFilter, setNonQRFilter] = useState("All");
  const nonQRCategories = useMemo(() => ["All", ...Array.from(new Set(nonQRItems.map(i => i.category)))], [nonQRItems]);
  const filteredNonQR   = useMemo(() => nonQRFilter === "All" ? nonQRItems : nonQRItems.filter(i => i.category === nonQRFilter), [nonQRItems, nonQRFilter]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: "", category: "All", warranty: "All", criticality: "All", minHealth: 0 });
  const [sortConfig, setSortConfig]   = useState({ key: "name", direction: "asc" });
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  const categories   = ["All", ...Array.from(new Set(equipmentAssets.map(a => a.category)))];
  const warranties   = ["All", ...Array.from(new Set(equipmentAssets.map(a => a.warranty)))];
  const criticalities= ["All", ...Array.from(new Set(equipmentAssets.map(a => a.criticality ?? "Medium")))];

  const filtered = useMemo(() => equipmentAssets.filter(a => {
    const text = `${a.name} ${a.id} ${a.location} ${a.amc} ${a.category}`.toLowerCase();
    return (
      (!filters.search || text.includes(filters.search.toLowerCase())) &&
      (filters.category    === "All" || a.category                  === filters.category) &&
      (filters.warranty    === "All" || a.warranty                  === filters.warranty) &&
      (filters.criticality === "All" || (a.criticality ?? "Medium") === filters.criticality) &&
      a.health >= Number(filters.minHealth)
    );
  }), [equipmentAssets, filters]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortConfig.key] ?? "";
    const bv = (b as unknown as Record<string, unknown>)[sortConfig.key] ?? "";
    const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
    return sortConfig.direction === "asc" ? cmp : -cmp;
  }), [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current    = Math.min(page, totalPages);
  const paginated  = sorted.slice((current - 1) * pageSize, current * pageSize);

  const sortBy = (key: string) => { setSortConfig(c => ({ key, direction: c.key === key && c.direction === "asc" ? "desc" : "asc" })); setPage(1); };
  const updateFilter = (field: string, value: string | number) => { setFilters(f => ({ ...f, [field]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ search: "", category: "All", warranty: "All", criticality: "All", minHealth: 0 }); setPage(1); };

  const SortBtn = ({ k, label }: { k: string; label: string }) => (
    <button onClick={() => sortBy(k)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: sortConfig.key === k ? "#0f172a" : "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
      {label}
      {sortConfig.key === k
        ? (sortConfig.direction === "asc" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />)
        : <ArrowUpDown size={9} color="#cbd5e1" />}
    </button>
  );

  // ── upcoming timeline items ─────────────────────────────────────────────
  const timeline = [
    { date: "May 08", title: "Fire Pump Controller service",  detail: "Johnson Controls visit confirmed" },
    { date: "May 14", title: "Chiller Plant 1 PM",            detail: "Quarterly condenser checks" },
    { date: "Jun 02", title: "Boiler AMC renewal",            detail: "Commercial approval required" },
    { date: "Jul 16", title: "Guest Lift A safety audit",     detail: "Statutory certificate renewal" },
  ];

  return (
    <div className="space-y-5">

      {/* ── Dark hero ──────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, background: "#0f172a", color: "white", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Asset Management</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Equipment Registry</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {equipmentAssets.length} QR-tagged assets · {nonQRItems.length} non-QR items · Full warranty & AMC tracking
            </p>
          </div>
          {activeRole.canManageEquipment && (
            <button
              onClick={() => register === "qr" ? router.push("/equipment/new") : router.push("/equipment/non-qr/new")}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "white", color: "#0f172a", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
            >
              <Plus size={14} /> {register === "qr" ? "Register Equipment" : "Register Item"}
            </button>
          )}
        </div>
      </div>

      {/* ── Register tab switcher ──────────────────────────────────────────── */}
      <div style={{ padding: "6px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", display: "flex", gap: 4 }}>
        {([
          { key: "qr",    icon: QrCode,   label: "QR Equipment", count: equipmentAssets.length, sub: "Full asset register with QR codes" },
          { key: "nonqr", icon: PackageX, label: "Non-QR Items",  count: nonQRItems.length,     sub: "Fixtures & fittings without QR codes" },
        ] as const).map(({ key, icon: Icon, label, count, sub }) => (
          <button
            key={key}
            onClick={() => setRegister(key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8,
              background: register === key ? "#0f172a" : "transparent",
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "background 150ms",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: register === key ? "rgba(255,255,255,0.12)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={17} color={register === key ? "white" : "#475569"} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: register === key ? "white" : "#0f172a" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: register === key ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: register === key ? "white" : "#64748b" }}>{count}</span>
              </div>
              <span style={{ fontSize: 11, color: register === key ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>{sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          QR EQUIPMENT REGISTER
      ══════════════════════════════════════════════════════════════════════ */}
      {register === "qr" && <>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: showFilters ? "#0f172a" : "white", color: showFilters ? "white" : "#334155", border: showFilters ? "1px solid #0f172a" : "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <SlidersHorizontal size={13} /> Filters
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Download size={13} /> Export Register
        </button>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {equipmentAssets.length} assets
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 14 }}>Asset Filters · {filtered.length} matching</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Search</label>
              <input className="input" value={filters.search} onChange={e => updateFilter("search", e.target.value)} placeholder="Asset name, location, AMC, ID…" />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Category</label>
              <select className="select" value={filters.category} onChange={e => updateFilter("category", e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Warranty</label>
              <select className="select" value={filters.warranty} onChange={e => updateFilter("warranty", e.target.value)}>
                {warranties.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Criticality</label>
              <select className="select" value={filters.criticality} onChange={e => updateFilter("criticality", e.target.value)}>
                {criticalities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn" onClick={clearFilters} style={{ flexShrink: 0 }}>Clear</button>
              <button onClick={() => setShowFilters(false)} style={{ padding: "7px 14px", borderRadius: 8, background: "#0f172a", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment table */}
      <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Equipment Registry</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Warranty & AMC register</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  { k: "name",     l: "Asset"    },
                  { k: "category", l: "Category" },
                  { k: "location", l: "Location" },
                  { k: "warranty", l: "Warranty" },
                  { k: "amc",      l: "AMC"      },
                  { k: "health",   l: "Health"   },
                ].map(({ k, l }) => (
                  <th key={k} style={{ padding: "9px 14px", textAlign: "left" }}><SortBtn k={k} label={l} /></th>
                ))}
                <th style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>QR</th>
                <th style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((asset, i) => (
                <tr
                  key={asset.id}
                  onClick={() => router.push(`/equipment/${asset.id}`)}
                  style={{ borderBottom: i < paginated.length - 1 ? "1px solid #f1f5f9" : "none", cursor: "pointer", transition: "background 100ms" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{asset.name}</div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8", fontFamily: "monospace", marginTop: 1 }}>{asset.id}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 99, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>{asset.category}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 11.5, color: "#64748b" }}>{asset.location}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge text={asset.warranty} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 11.5, color: "#64748b" }}>{asset.amc}</td>
                  <td style={{ padding: "12px 14px", minWidth: 120 }}>
                    <HealthBar value={asset.health} />
                  </td>
                  <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                    <AssetQr asset={asset} size={48} />
                  </td>
                  <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => router.push(`/equipment/${asset.id}`)} style={{ width: 30, height: 30, borderRadius: 7, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Eye size={13} color="#475569" />
                      </button>
                      {activeRole.canManageEquipment && (<>
                        <button onClick={() => router.push(`/equipment/${asset.id}/edit`)} style={{ width: 30, height: 30, borderRadius: 7, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Pencil size={13} color="#475569" />
                        </button>
                        <button onClick={() => setDeleteCandidate(asset)} style={{ width: 30, height: 30, borderRadius: 7, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Trash2 size={13} color="#dc2626" />
                        </button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
              {!paginated.length && (
                <tr><td colSpan={8} style={{ padding: 24 }}><EmptyState message="No equipment matches the selected filters." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 18px", borderTop: "1px solid #f1f5f9" }}>
          <Pagination currentPage={current} totalPages={totalPages} pageSize={pageSize} totalItems={sorted.length} shownCount={sorted.length} onPage={setPage} onPageSize={s => { setPageSize(s); setPage(1); }} />
        </div>
      </div>

      {/* Warranty timeline */}
      <div style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Warranty & AMC Timeline</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Next 90 days</div>
        </div>
        {timeline.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < timeline.length - 1 ? 14 : 0, position: "relative" }}>
            {i < timeline.length - 1 && <div style={{ position: "absolute", left: 19, top: 38, bottom: -14, width: 1, background: "#f1f5f9" }} />}
            <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{s.date.split(" ")[0]}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.date.split(" ")[1]}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      </> /* end QR register */}

      {/* ══════════════════════════════════════════════════════════════════════
          NON-QR REGISTER
      ══════════════════════════════════════════════════════════════════════ */}
      {register === "nonqr" && <>

      <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Non-QR Tracked Items</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Fixtures & fittings without QR codes</div>
        </div>

        {/* Category filter bar */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {nonQRCategories.map(cat => {
            const count = cat === "All" ? nonQRItems.length : nonQRItems.filter(i => i.category === cat).length;
            const active = nonQRFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setNonQRFilter(cat)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 99,
                  background: active ? "#0f172a" : "white",
                  color: active ? "white" : "#64748b",
                  border: active ? "1px solid #0f172a" : "1px solid #e2e8f0",
                  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                }}
              >
                {cat}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: active ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: active ? "white" : "#64748b" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        <div style={{ padding: "14px 16px" }}>
          {filteredNonQR.length === 0 ? (
            <EmptyState message="No items in this category yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNonQR.map(item => (
                <div
                  key={item.id}
                  style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", transition: "border-color 150ms, box-shadow 150ms" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,19,28,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginTop: 1 }}>{item.id}</div>
                    </div>
                    <StatusBadge text={item.condition} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "Category", value: item.category },
                      { label: "Location", value: item.location },
                      { label: "Quantity", value: `${item.quantity} units` },
                      { label: "Checked",  value: item.lastChecked },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: "#94a3b8", width: 56, flexShrink: 0 }}>{label}</span>
                        <span style={{ fontSize: 10.5, color: "#334155", fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {item.notes && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", fontStyle: "italic", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>{item.notes}</p>}
                  {activeRole.canManageEquipment && (
                    <button onClick={() => setDeleteNonQRCandidate(item)} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px", borderRadius: 7, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "10px 18px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{filteredNonQR.length} of {nonQRItems.length} item{nonQRItems.length !== 1 ? "s" : ""}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
            <QrCode size={11} /> QR generation disabled for this register
          </span>
        </div>
      </div>

      </> /* end Non-QR register */}

      {/* ── Delete Non-QR confirm ──────────────────────────────────────────── */}
      {deleteNonQRCandidate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, padding: "28px 28px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Remove Item</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 6 }}>{deleteNonQRCandidate.name}</div>
            <p style={{ fontSize: 13, color: "#64748b" }}>This will remove <code style={{ fontFamily: "monospace", fontWeight: 700 }}>{deleteNonQRCandidate.id}</code> from the non-QR register.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button className="btn" onClick={() => setDeleteNonQRCandidate(null)}>Cancel</button>
              <button onClick={() => { deleteNonQRItem(deleteNonQRCandidate.id); setDeleteNonQRCandidate(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Trash2 size={14} /> Remove Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Equipment confirm ───────────────────────────────────────── */}
      {deleteCandidate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, padding: "28px 28px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Delete Equipment</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 6 }}>{deleteCandidate.name}</div>
            <p style={{ fontSize: 13, color: "#64748b" }}>This will remove <code style={{ fontFamily: "monospace", fontWeight: 700 }}>{deleteCandidate.id}</code> from the equipment register. Existing work order history remains in reports.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button className="btn" onClick={() => setDeleteCandidate(null)}>Cancel</button>
              <button onClick={() => { deleteEquipment(deleteCandidate.id); setDeleteCandidate(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Trash2 size={14} /> Delete Equipment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
