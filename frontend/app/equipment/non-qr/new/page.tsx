"use client";

import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, PackageX, Plus, ChevronLeft } from "lucide-react";
import Field from "@/components/ui/Field";
import type { NonQRItem } from "@/lib/types";

const CATEGORIES = ["Hardware", "Fixtures", "Electrical Fittings", "Plumbing Fittings", "Civil", "Furniture", "Other"];

interface FormValues {
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: NonQRItem["condition"];
  notes: string;
}

const empty: FormValues = {
  name: "", category: "Hardware", location: "", quantity: 1, condition: "Good", notes: "",
};

function RegisterNonQRContent() {
  const { addNonQRItem } = useStore();
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [registered, setRegistered] = useState<NonQRItem | null>(null);

  const update = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues(v => ({ ...v, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim())     next.name     = "Required";
    if (!values.location.trim()) next.location = "Required";
    if (values.quantity < 1)     next.quantity = "Must be at least 1";
    if (Object.keys(next).length) { setErrors(next); return; }
    const item = await addNonQRItem({ ...values, notes: values.notes || undefined });
    setRegistered(item);
  };

  if (registered) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 flex flex-col gap-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="eyebrow">Registration complete</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{registered.name}</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              <span className="font-mono font-semibold">{registered.id}</span> has been added to the non-QR items register.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Category", value: registered.category },
                { label: "Location", value: registered.location },
                { label: "Quantity", value: `${registered.quantity} units` },
                { label: "Condition", value: registered.condition },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "10px 14px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => router.push("/equipment?tab=nonqr")}>
              <PackageX size={15} /> View Non-QR Items
            </button>
            <button className="btn" onClick={() => { setRegistered(null); setValues(empty); }}>
              <Plus size={15} /> Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/equipment?tab=nonqr")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 20 }}
      >
        <ChevronLeft size={14} /> Back to Equipment Registry
      </button>

      <div className="mb-6">
        <p className="eyebrow">Asset onboarding</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Register Non-QR Item</h2>
        <p className="text-sm text-slate-500 mt-1">Fixtures, fittings, and bulk items that don't carry individual QR codes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Item Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Item Name" error={errors.name}>
                <input className="input" value={values.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Door Handle – Lever Type" />
              </Field>
            </div>
            <Field label="Category">
              <select className="select" value={values.category} onChange={e => update("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Condition">
              <select className="select" value={values.condition} onChange={e => update("condition", e.target.value as NonQRItem["condition"])}>
                {["Good", "Fair", "Poor"].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Location" error={errors.location}>
                <input className="input" value={values.location} onChange={e => update("location", e.target.value)} placeholder="e.g. Tower A – Guest Floors 10–20" />
              </Field>
            </div>
            <Field label="Quantity" error={errors.quantity}>
              <input type="number" min={1} className="input" value={values.quantity} onChange={e => update("quantity", Number(e.target.value))} />
            </Field>
            <Field label="Notes">
              <input className="input" value={values.notes} onChange={e => update("notes", e.target.value)} placeholder="Optional notes about condition, location, etc." />
            </Field>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <PackageX size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            Non-QR items are tracked by category and location rather than individual asset IDs. A unique identity code is generated for inventory reference.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn" onClick={() => router.push("/equipment?tab=nonqr")}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Plus size={15} /> Register Item
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewNonQRPage() {
  return (
    <AppShell title="Register Non-QR Item">
      <RegisterNonQRContent />
    </AppShell>
  );
}
