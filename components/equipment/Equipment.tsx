"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import StatusPill from "@/components/ui/StatusPill";
import Meter from "@/components/ui/Meter";
import PanelHeader from "@/components/ui/PanelHeader";
import AssetQr from "@/components/ui/AssetQr";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TimelineItem from "@/components/ui/TimelineItem";
import clsx from "clsx";
import {
  HardHat, Plus, Download, SlidersHorizontal, CalendarClock,
  ArrowUpDown, Trash2, Pencil, Eye, QrCode, PackageX,
} from "lucide-react";
import type { Equipment, NonQRItem } from "@/lib/types";

export default function EquipmentRegistry() {
  const { equipmentAssets, nonQRItems, activeRole, deleteEquipment, addNonQRItem, deleteNonQRItem } = useStore();
  const router = useRouter();
  const [deleteCandidate, setDeleteCandidate] = useState<Equipment | null>(null);
  const [deleteNonQRCandidate, setDeleteNonQRCandidate] = useState<NonQRItem | null>(null);
  const [showNonQRForm, setShowNonQRForm] = useState(false);
  const emptyNonQR = { name: "", category: "Hardware", location: "", quantity: 1, condition: "Good" as NonQRItem["condition"], notes: "" };
  const [nonQRForm, setNonQRForm] = useState(emptyNonQR);
  const [nonQRErrors, setNonQRErrors] = useState<Partial<Record<string, string>>>({});
  const [register, setRegister] = useState<"qr" | "nonqr">("qr");
  const [nonQRFilter, setNonQRFilter] = useState("All");
  const nonQRCategories = useMemo(
    () => ["All", ...Array.from(new Set(nonQRItems.map((i) => i.category)))],
    [nonQRItems]
  );
  const filteredNonQR = useMemo(
    () => nonQRFilter === "All" ? nonQRItems : nonQRItems.filter((i) => i.category === nonQRFilter),
    [nonQRItems, nonQRFilter]
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: "", category: "All", warranty: "All", criticality: "All", minHealth: 0 });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categories = ["All", ...Array.from(new Set(equipmentAssets.map((a) => a.category)))];
  const warranties = ["All", ...Array.from(new Set(equipmentAssets.map((a) => a.warranty)))];
  const criticalities = ["All", ...Array.from(new Set(equipmentAssets.map((a) => a.criticality ?? "Medium")))];

  const filtered = useMemo(() => {
    return equipmentAssets.filter((a) => {
      const text = `${a.name} ${a.id} ${a.location} ${a.amc} ${a.category}`.toLowerCase();
      return (
        (!filters.search || text.includes(filters.search.toLowerCase())) &&
        (filters.category === "All" || a.category === filters.category) &&
        (filters.warranty === "All" || a.warranty === filters.warranty) &&
        (filters.criticality === "All" || (a.criticality ?? "Medium") === filters.criticality) &&
        a.health >= Number(filters.minHealth)
      );
    });
  }, [equipmentAssets, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortConfig.key] ?? "";
      const bv = (b as unknown as Record<string, unknown>)[sortConfig.key] ?? "";
      const cmp = typeof av === "number"
        ? (av as number) - (bv as number)
        : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const paginated = sorted.slice((current - 1) * pageSize, current * pageSize);

  const sortBy = (key: string) => {
    setSortConfig((c) => ({ key, direction: c.key === key && c.direction === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const updateFilter = (field: string, value: string | number) => {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "All", warranty: "All", criticality: "All", minHealth: 0 });
    setPage(1);
  };

  const SortBtn = ({ k, label }: { k: string; label: string }) => (
    <button
      onClick={() => sortBy(k)}
      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700 transition-colors"
    >
      {label}
      <ArrowUpDown size={11} className={sortConfig.key === k ? "text-slate-900" : "text-slate-300"} />
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Register Classification Toggle */}
      <div className="card p-1.5 flex gap-1">
        {([
          { key: "qr", icon: QrCode, label: "QR Equipment", count: equipmentAssets.length, sub: "Full asset register with QR codes" },
          { key: "nonqr", icon: PackageX, label: "Non-QR Items", count: nonQRItems.length, sub: "Fixtures & fittings without QR codes" },
        ] as const).map(({ key, icon: Icon, label, count, sub }) => (
          <button
            key={key}
            onClick={() => setRegister(key)}
            className={clsx(
              "flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
              register === key
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", register === key ? "bg-white/15" : "bg-slate-100")}>
              <Icon size={18} className={register === key ? "text-white" : "text-slate-500"} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={clsx("font-semibold text-sm", register === key ? "text-white" : "text-slate-800")}>{label}</span>
                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full", register === key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500")}>{count}</span>
              </div>
              <span className={clsx("text-xs", register === key ? "text-white/70" : "text-slate-400")}>{sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── QR Equipment Register ── */}
      {register === "qr" && <>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        {activeRole.canManageEquipment && (
          <button className="btn btn-primary" onClick={() => router.push("/equipment/new")}>
            <Plus size={15} /> Register Equipment
          </button>
        )}
        <button className="btn" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={15} /> Filters
        </button>
        <button className="btn">
          <Download size={15} /> Export Register
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{filtered.length}</span> of {equipmentAssets.length} assets
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5">
          <PanelHeader icon={SlidersHorizontal} title="Asset Filters" action={`${filtered.length} matching`} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="label">Search</label>
              <input
                className="input"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Asset name, location, AMC, ID…"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Warranty</label>
              <select className="select" value={filters.warranty} onChange={(e) => updateFilter("warranty", e.target.value)}>
                {warranties.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Criticality</label>
              <select className="select" value={filters.criticality} onChange={(e) => updateFilter("criticality", e.target.value)}>
                {criticalities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button className="btn flex-1" onClick={clearFilters}>Clear</button>
              <button className="btn btn-primary flex-1" onClick={() => setShowFilters(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <PanelHeader icon={HardHat} title="Equipment Registry with Warranty & AMC" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="table-head-cell"><SortBtn k="name" label="Asset" /></th>
                <th className="table-head-cell"><SortBtn k="category" label="Category" /></th>
                <th className="table-head-cell"><SortBtn k="location" label="Location" /></th>
                <th className="table-head-cell"><SortBtn k="warranty" label="Warranty" /></th>
                <th className="table-head-cell"><SortBtn k="amc" label="AMC" /></th>
                <th className="table-head-cell"><SortBtn k="health" label="Health" /></th>
                <th className="table-head-cell">QR Code</th>
                <th className="table-head-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/equipment/${asset.id}`)}
                >
                  <td className="table-cell">
                    <p className="font-semibold text-slate-800">{asset.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{asset.id}</p>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">{asset.category}</span>
                  </td>
                  <td className="table-cell text-slate-600 text-xs">{asset.location}</td>
                  <td className="table-cell"><StatusPill text={asset.warranty} /></td>
                  <td className="table-cell text-xs text-slate-600">{asset.amc}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2 w-28">
                      <Meter value={asset.health} className="flex-1" />
                      <span className="text-xs font-bold text-slate-700">{asset.health}%</span>
                    </div>
                  </td>
                  <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                    <AssetQr asset={asset} size={56} />
                  </td>
                  <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-sm btn-icon" onClick={() => router.push(`/equipment/${asset.id}`)}>
                        <Eye size={14} />
                      </button>
                      {activeRole.canManageEquipment && (
                        <>
                          <button className="btn btn-sm btn-icon" onClick={() => router.push(`/equipment/${asset.id}/edit`)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-sm btn-icon btn-danger" onClick={() => setDeleteCandidate(asset)}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      {!activeRole.canManageEquipment && <span className="text-xs text-slate-400">View only</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {!paginated.length && (
                <tr><td colSpan={8} className="p-6"><EmptyState message="No equipment matches the selected filters." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <Pagination
            currentPage={current} totalPages={totalPages} pageSize={pageSize}
            totalItems={sorted.length} shownCount={sorted.length}
            onPage={setPage} onPageSize={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      </div>

      {/* Warranty & AMC Timeline */}
      <div className="card p-5">
        <PanelHeader icon={CalendarClock} title="Warranty & AMC Timeline" action="Next 90 days" />
        <div>
          <TimelineItem date="May 08" title="Fire Pump Controller service" detail="Johnson Controls visit confirmed" />
          <TimelineItem date="May 14" title="Chiller Plant 1 PM" detail="Quarterly condenser and vibration checks" />
          <TimelineItem date="Jun 02" title="Boiler AMC renewal" detail="Commercial approval required" />
          <TimelineItem date="Jul 16" title="Guest Lift A safety audit" detail="Statutory certificate renewal" />
        </div>
      </div>

      </> /* end QR register */}

      {/* ── Non-QR Items Register ── */}
      {register === "nonqr" && <>

      {/* Non-QR Tracked Items */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <PackageX size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Non-QR Tracked Items</p>
              <p className="text-xs text-slate-400">Fixtures & fittings that cannot be assigned a QR code — door handles, hinges, switches, etc.</p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm flex-shrink-0"
            onClick={() => { setShowNonQRForm((v) => !v); setNonQRForm(emptyNonQR); setNonQRErrors({}); }}
          >
            <Plus size={14} /> Register Item
          </button>
        </div>

        {/* Inline Registration Form */}
        {showNonQRForm && (
          <div className="p-5 border-b border-slate-100 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">New Non-QR Item</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="label">Item Name <span className="text-red-500">*</span></label>
                <input
                  className="input"
                  placeholder="e.g. Door Handle – Lever Type"
                  value={nonQRForm.name}
                  onChange={(e) => { setNonQRForm((f) => ({ ...f, name: e.target.value })); setNonQRErrors((err) => ({ ...err, name: "" })); }}
                />
                {nonQRErrors.name && <p className="text-xs text-red-500 mt-1">{nonQRErrors.name}</p>}
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={nonQRForm.category} onChange={(e) => setNonQRForm((f) => ({ ...f, category: e.target.value }))}>
                  {["Hardware", "Fixtures", "Electrical Fittings", "Plumbing Fittings", "Civil", "Furniture", "Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Location <span className="text-red-500">*</span></label>
                <input
                  className="input"
                  placeholder="e.g. Tower A – Guest Floors 10–20"
                  value={nonQRForm.location}
                  onChange={(e) => { setNonQRForm((f) => ({ ...f, location: e.target.value })); setNonQRErrors((err) => ({ ...err, location: "" })); }}
                />
                {nonQRErrors.location && <p className="text-xs text-red-500 mt-1">{nonQRErrors.location}</p>}
              </div>
              <div>
                <label className="label">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number" min={1} className="input"
                  value={nonQRForm.quantity}
                  onChange={(e) => setNonQRForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="label">Condition</label>
                <select className="select" value={nonQRForm.condition} onChange={(e) => setNonQRForm((f) => ({ ...f, condition: e.target.value as NonQRItem["condition"] }))}>
                  {["Good", "Fair", "Poor"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional notes" value={nonQRForm.notes} onChange={(e) => setNonQRForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const errs: Record<string, string> = {};
                  if (!nonQRForm.name.trim()) errs.name = "Required";
                  if (!nonQRForm.location.trim()) errs.location = "Required";
                  if (Object.keys(errs).length) { setNonQRErrors(errs); return; }
                  addNonQRItem({ ...nonQRForm, notes: nonQRForm.notes || undefined });
                  setShowNonQRForm(false);
                  setNonQRForm(emptyNonQR);
                }}
              >
                <Plus size={13} /> Save Item
              </button>
              <button className="btn btn-sm" onClick={() => setShowNonQRForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Category Filter Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          {nonQRCategories.map((cat) => {
            const count = cat === "All" ? nonQRItems.length : nonQRItems.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setNonQRFilter(cat)}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  nonQRFilter === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {cat}
                <span className={clsx(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  nonQRFilter === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Grid */}
        <div className="p-5">
          {filteredNonQR.length === 0 ? (
            <EmptyState message="No items in this category yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNonQR.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Identity: {item.identity}</p>
                    </div>
                    <StatusPill text={item.condition} size="xs" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-14 flex-shrink-0">Identity</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium font-mono">{item.identity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-14 flex-shrink-0">Category</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-slate-400 w-14 flex-shrink-0 pt-0.5">Location</span>
                      <span className="text-slate-600 leading-snug">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-14 flex-shrink-0">Quantity</span>
                      <span className="font-semibold text-slate-700">{item.quantity} units</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-14 flex-shrink-0">Checked</span>
                      <span className="text-slate-500">{item.lastChecked}</span>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2 line-clamp-2">{item.notes}</p>
                  )}
                  {activeRole.canManageEquipment && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        className="btn btn-sm btn-danger w-full justify-center"
                        onClick={() => setDeleteNonQRCandidate(item)}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredNonQR.length} of {nonQRItems.length} item{nonQRItems.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1.5">
            <QrCode size={12} />
            <span>QR generation disabled for this register</span>
          </div>
        </div>
      </div>

      </> /* end Non-QR register */}

      {/* Delete Non-QR Confirmation */}
      {deleteNonQRCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-5 shadow-xl">
            <div>
              <p className="eyebrow">Remove item</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">{deleteNonQRCandidate.name}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                This will remove <span className="font-mono font-semibold">{deleteNonQRCandidate.id}</span> from the non-QR register.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn" onClick={() => setDeleteNonQRCandidate(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { deleteNonQRItem(deleteNonQRCandidate.id); setDeleteNonQRCandidate(null); }}
              >
                <Trash2 size={15} /> Remove Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-5 shadow-xl">
            <div>
              <p className="eyebrow">Delete equipment</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">{deleteCandidate.name}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                This will remove <span className="font-mono font-semibold">{deleteCandidate.id}</span> from the equipment register. Existing work order history remains in reports.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn" onClick={() => setDeleteCandidate(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { deleteEquipment(deleteCandidate.id); setDeleteCandidate(null); }}
              >
                <Trash2 size={15} /> Delete Equipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
