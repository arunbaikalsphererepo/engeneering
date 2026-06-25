"use client";

import { useState } from "react";
import Field from "@/components/ui/Field";
import { QrCode } from "lucide-react";

export interface EquipmentFormValues {
  name: string;
  category: string;
  location: string;
  criticality: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  owner: string;
  purchaseDate: string;
  warrantyStatus: string;
  warrantyExpiry: string;
  amcVendor: string;
  amcExpiry: string;
  nextService: string;
}

const emptyForm: EquipmentFormValues = {
  name: "", category: "HVAC", location: "", criticality: "High",
  manufacturer: "", model: "", serialNumber: "", owner: "",
  purchaseDate: "", warrantyStatus: "Active", warrantyExpiry: "",
  amcVendor: "", amcExpiry: "", nextService: "",
};

interface EquipmentFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<EquipmentFormValues>;
  onSubmit: (values: EquipmentFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function EquipmentForm({ mode = "create", initialValues = {}, onSubmit, onCancel, loading }: EquipmentFormProps) {
  const [values, setValues] = useState<EquipmentFormValues>({ ...emptyForm, ...initialValues });
  const [errors, setErrors] = useState<Partial<Record<keyof EquipmentFormValues, string>>>({});

  const update = (field: keyof EquipmentFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof EquipmentFormValues)[] = ["name", "location", "manufacturer", "serialNumber", "owner", "warrantyExpiry", "nextService"];
    const next: typeof errors = {};
    for (const f of required) if (!values[f]) next[f] = "Required";
    if (Object.keys(next).length) { setErrors(next); return; }
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic Info */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Equipment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Equipment Name" error={errors.name}>
            <input className="input" value={values.name} onChange={(e) => update("name", e.target.value)} placeholder="Boiler Feed Pump 2" />
          </Field>
          <Field label="Category">
            <select className="select" value={values.category} onChange={(e) => update("category", e.target.value)}>
              {["HVAC", "Electrical", "Fire & Safety", "Kitchen", "Plumbing", "Laundry", "Vertical Transport", "IT / BMS"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Location" error={errors.location}>
            <input className="input" value={values.location} onChange={(e) => update("location", e.target.value)} placeholder="Basement Utility Room" />
          </Field>
          <Field label="Criticality">
            <select className="select" value={values.criticality} onChange={(e) => update("criticality", e.target.value)}>
              {["Critical", "High", "Medium", "Low"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Manufacturer" error={errors.manufacturer}>
            <input className="input" value={values.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} placeholder="Carrier" />
          </Field>
          <Field label="Model">
            <input className="input" value={values.model} onChange={(e) => update("model", e.target.value)} placeholder="30XA-1402" />
          </Field>
          <Field label="Serial Number" error={errors.serialNumber}>
            <input className="input" value={values.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} placeholder="SN-2026-8842" />
          </Field>
          <Field label="Responsible Owner" error={errors.owner}>
            <input className="input" value={values.owner} onChange={(e) => update("owner", e.target.value)} placeholder="Duty Engineer" />
          </Field>
        </div>
      </div>

      {/* Warranty & AMC */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Warranty & AMC</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Purchase Date">
            <input type="date" className="input" value={values.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} />
          </Field>
          <Field label="Warranty Status">
            <select className="select" value={values.warrantyStatus} onChange={(e) => update("warrantyStatus", e.target.value)}>
              {["Active", "Expired", "Due Soon"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Warranty Expiry" error={errors.warrantyExpiry}>
            <input type="date" className="input" value={values.warrantyExpiry} onChange={(e) => update("warrantyExpiry", e.target.value)} />
          </Field>
          <Field label="AMC Vendor">
            <input className="input" value={values.amcVendor} onChange={(e) => update("amcVendor", e.target.value)} placeholder="OEM Premium AMC" />
          </Field>
          <Field label="AMC Expiry">
            <input type="date" className="input" value={values.amcExpiry} onChange={(e) => update("amcExpiry", e.target.value)} />
          </Field>
          <Field label="Next Service Date" error={errors.nextService}>
            <input type="date" className="input" value={values.nextService} onChange={(e) => update("nextService", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* QR Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <QrCode size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          {mode === "edit"
            ? "Saving changes updates the asset record while keeping the same equipment ID and QR code."
            : "After registration, the system generates a unique equipment ID and QR code containing the asset record."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <QrCode size={15} />
          {mode === "edit" ? "Save Changes" : "Register & Generate QR"}
        </button>
      </div>
    </form>
  );
}

export function equipmentFormFromAsset(asset: Partial<{
  name: string; category: string; location: string; criticality: string;
  manufacturer?: string; model?: string; serialNumber?: string; owner?: string;
  purchaseDate?: string; warranty: string; warrantyExpiry?: string;
  amc: string; amcExpiry?: string; nextService: string;
}>): Partial<EquipmentFormValues> {
  return {
    name: asset.name ?? "", category: asset.category ?? "HVAC",
    location: asset.location ?? "", criticality: asset.criticality ?? "High",
    manufacturer: asset.manufacturer ?? "", model: asset.model ?? "",
    serialNumber: asset.serialNumber ?? "", owner: asset.owner ?? "",
    purchaseDate: asset.purchaseDate ?? "", warrantyStatus: asset.warranty ?? "Active",
    warrantyExpiry: asset.warrantyExpiry ?? "",
    amcVendor: asset.amc === "Not assigned" ? "" : asset.amc ?? "",
    amcExpiry: asset.amcExpiry ?? "", nextService: asset.nextService ?? "",
  };
}
