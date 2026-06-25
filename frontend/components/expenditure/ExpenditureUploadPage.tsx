"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import clsx from "clsx";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck,
  ClipboardList,
  ScanLine,
  Keyboard,
  BadgeInfo,
} from "lucide-react";
import type { Equipment, NonQRItem } from "@/lib/types";
import { repairCategories, utilityCategories } from "@/lib/data";

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtLong(ym: string) {
  const [y, m] = ym.split("-");
  return `${MONTHS_LONG[Number(m) - 1]} ${y}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function isImageFile(name: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

export default function ExpenditureUploadPage({
  type,
  title,
  barColor,
  showEquipmentDetails = false,
}: {
  type: "utility" | "repair";
  title: string;
  barColor: string;
  showEquipmentDetails?: boolean;
}) {
  const router = useRouter();
  const { addBill, equipmentAssets, nonQRItems } = useStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIdentity, setSelectedIdentity] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const categories = type === "utility" ? utilityCategories : repairCategories;
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    month: currentMonth(),
    reference: "",
    billCopyName: "",
    billCopyDataUrl: "",
  });

  const iconBg = `${barColor}20`;
  const chips = useMemo(
    () => [
      { label: "Fast entry", icon: ClipboardList },
      { label: "Optional copy", icon: Paperclip },
      { label: "Saved instantly", icon: CheckCircle2 },
    ],
    [],
  );

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setForm((current) => ({ ...current, billCopyName: "", billCopyDataUrl: "" }));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, billCopyName: file.name, billCopyDataUrl: dataUrl }));
  };

  const qrOptions = equipmentAssets.map((asset) => ({
    source: "qr" as const,
    identity: asset.id,
    label: asset.name,
    sublabel: asset.location,
  }));
  const nonQrOptions = nonQRItems.map((item) => ({
    source: "nonqr" as const,
    identity: item.identity,
    label: item.name,
    sublabel: item.location,
  }));
  const identityOptions = [...qrOptions, ...nonQrOptions];
  const selectedIdentityItem = identityOptions.find((item) => item.identity === selectedIdentity);

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.category) nextErrors.category = "Select a category";
    if (!form.description.trim()) nextErrors.description = "Required";
    const amount = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) nextErrors.amount = "Enter a valid amount";
    if (!form.month) nextErrors.month = "Required";
    if (showEquipmentDetails) {
      if (!selectedIdentity.trim()) {
        nextErrors.identity = "Enter or scan an identity";
      } else if (!selectedIdentityItem) {
        nextErrors.identity = "Identity not found in registry";
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      addBill({
        type,
        category: form.category,
        description: form.description.trim(),
        amount,
        month: form.month,
        reference: form.reference.trim(),
        billCopyName: form.billCopyName || undefined,
        billCopyDataUrl: form.billCopyDataUrl || undefined,
        equipmentIdentity: showEquipmentDetails ? selectedIdentity : undefined,
        equipmentIdentityLabel: showEquipmentDetails ? selectedIdentityItem?.label : undefined,
        equipmentIdentityType: showEquipmentDetails ? selectedIdentityItem?.source : undefined,
      });
      router.push(`/insights/${type}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden card border border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
        <div className="absolute -top-16 -right-12 w-52 h-52 rounded-full blur-3xl bg-slate-100/70" />
        <div className="absolute -bottom-20 left-12 w-64 h-64 rounded-full blur-3xl bg-slate-100/60" />

        <div className="relative p-5 sm:p-6 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button className="btn btn-sm self-start" onClick={() => router.push(`/insights/${type}`)}>
                <ArrowLeft size={14} /> Back
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
                <UploadCloud size={22} style={{ color: barColor }} />
              </div>
              <div>
                <p className="eyebrow">Bill Upload</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-0.5">{title}</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Add the bill details, attach a copy if available, and save it to the {type} register.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {chips.map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <Icon size={13} className="text-slate-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-5 items-start">
            <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bill details</p>
                  <p className="text-sm text-slate-400 mt-1">Everything needed to record a single expense.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {fmtLong(form.month)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Category <span className="text-red-500">*</span></label>
                  <select
                    className="select"
                    value={form.category}
                    onChange={(e) => { setForm((v) => ({ ...v, category: e.target.value })); setErrors((v) => ({ ...v, category: "" })); }}
                  >
                    <option value="">— Select MIS category —</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="label">Description <span className="text-red-500">*</span></label>
                  <input
                    className="input"
                    placeholder={type === "utility" ? "Electricity bill, water charges, diesel…" : "Vendor service, replacement parts, contractor work…"}
                    value={form.description}
                    onChange={(e) => { setForm((value) => ({ ...value, description: e.target.value })); setErrors((value) => ({ ...value, description: "" })); }}
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="label">Amount (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    placeholder="450000"
                    value={form.amount}
                    onChange={(e) => { setForm((value) => ({ ...value, amount: e.target.value })); setErrors((value) => ({ ...value, amount: "" })); }}
                  />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <label className="label">Month <span className="text-red-500">*</span></label>
                  <input
                    type="month"
                    className="input"
                    value={form.month}
                    onChange={(e) => setForm((value) => ({ ...value, month: e.target.value }))}
                  />
                  {errors.month && <p className="text-xs text-red-500 mt-1">{errors.month}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="label">Bill Reference / Invoice No.</label>
                  <input
                    className="input"
                    placeholder="e.g. INV-2026-0481"
                    value={form.reference}
                    onChange={(e) => setForm((value) => ({ ...value, reference: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Bill Copy</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      className="input file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                      accept=".pdf,image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] ?? null;
                        await handleFileChange(file);
                      }}
                    />
                    {form.billCopyName && (
                      <button
                        className="btn btn-sm"
                        onClick={() => setForm((value) => ({ ...value, billCopyName: "", billCopyDataUrl: "" }))}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Optional. PDFs and common image formats are supported.</p>
                </div>
              </div>

              {showEquipmentDetails && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipment identity</p>
                      <p className="text-sm text-slate-400 mt-1">Type the identity or use the mock scanner.</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
                      QR + Non-QR supported
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">Registry identity</label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <input
                            className="input pr-10"
                            placeholder="Type identity like EQ-HVAC-0118 or NQI-123456-AB"
                            value={selectedIdentity}
                            onChange={(e) => {
                              setSelectedIdentity(e.target.value.toUpperCase().trim());
                              setErrors((current) => ({ ...current, identity: "" }));
                            }}
                          />
                          <Keyboard size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm sm:min-w-36"
                          onClick={() => setScannerOpen((current) => !current)}
                        >
                          <ScanLine size={14} /> {scannerOpen ? "Close scanner" : "Mock scan"}
                        </button>
                      </div>
                      {errors.identity && <p className="text-xs text-red-500 mt-1">{errors.identity}</p>}
                      <p className="text-xs text-slate-400 mt-2">The identity must match one item from the registry.</p>
                    </div>

                    {scannerOpen && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <BadgeInfo size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">Mock scanner</p>
                            <p className="text-xs text-slate-500 mt-1">Pick any registry item to simulate a scan. No backend or camera is used yet.</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {identityOptions.slice(0, 4).map((item) => (
                            <button
                              key={item.identity}
                              type="button"
                              className={clsx(
                                "rounded-2xl border p-4 text-left transition",
                                selectedIdentity === item.identity ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                              )}
                              onClick={() => {
                                setSelectedIdentity(item.identity);
                                setScannerOpen(false);
                                setErrors((current) => ({ ...current, identity: "" }));
                              }}
                            >
                              <p className="text-sm font-semibold text-slate-900 truncate">{item.identity}</p>
                              <p className="text-xs text-slate-500 mt-1 truncate">{item.label}</p>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-2">{item.source === "qr" ? "QR asset" : "Non-QR item"}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIdentityItem && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-700 font-semibold uppercase tracking-wide">Selected identity</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1 truncate">{selectedIdentityItem.identity}</p>
                        <p className="text-xs text-slate-600 mt-1 truncate">{selectedIdentityItem.label} · {selectedIdentityItem.source === "qr" ? "QR asset" : "Non-QR item"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
                  <UploadCloud size={14} /> {saving ? "Saving..." : "Save Bill"}
                </button>
                <button className="btn btn-sm" onClick={() => router.push(`/insights/${type}`)}>
                  Cancel
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-5 shadow-lg shadow-slate-200/60 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.35),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_28%)]" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                    <Sparkles size={12} /> Upload summary
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-xs text-white/60">Category</p>
                      <p className={clsx("text-sm font-semibold mt-1 truncate", form.category ? "text-white" : "text-white/40")}>
                        {form.category || "Not selected"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-xs text-white/60">Type</p>
                      <p className="text-lg font-semibold mt-1">{title}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-xs text-white/60">Attached copy</p>
                      <p className={clsx("text-sm font-semibold mt-1 truncate", form.billCopyName ? "text-white" : "text-white/60")}>
                        {form.billCopyName || "No file selected"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-xs text-white/60">Current month</p>
                      <p className="text-lg font-semibold mt-1">{fmtLong(form.month)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Preview</p>
                    <p className="text-xs text-slate-400">Your bill copy will appear here before saving.</p>
                  </div>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>

                {form.billCopyDataUrl ? (
                  <div className="space-y-3">
                    {isImageFile(form.billCopyName) ? (
                      <img
                        src={form.billCopyDataUrl}
                        alt={form.billCopyName}
                        className="w-full h-48 object-cover rounded-2xl border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                        <FileText size={36} className="mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Bill document attached</p>
                        <p className="text-xs mt-1">PDF preview is represented as a document card.</p>
                      </div>
                    )}
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Selected file</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{form.billCopyName}</p>
                      </div>
                      <button className="btn btn-sm" onClick={() => setForm((value) => ({ ...value, billCopyName: "", billCopyDataUrl: "" }))}>
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <ImageIcon size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No file attached yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Add a PDF or image of the bill to keep the expense record complete.
                    </p>
                  </div>
                )}
              </div>

              {showEquipmentDetails && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800 mb-3">Selected identity</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Registry ID</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{selectedIdentity || "Not selected"}</p>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    This is the only reference that will be stored with the repair bill.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
