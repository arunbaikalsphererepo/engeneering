"use client";

import { useState } from "react";
import EquipmentForm, { equipmentFormFromAsset } from "@/components/equipment/EquipmentForm";
import AssetQr from "@/components/ui/AssetQr";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { CheckCircle2, HardHat } from "lucide-react";
import type { Equipment } from "@/lib/types";
import type { EquipmentFormValues } from "@/components/equipment/EquipmentForm";

export default function EditContent({ id }: { id: string }) {
  const { equipmentAssets, updateEquipment } = useStore();
  const router = useRouter();
  const [updated, setUpdated] = useState<Equipment | null>(null);

  const asset = equipmentAssets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="text-slate-500">Asset not found.</p>
        <button className="btn" onClick={() => router.push("/equipment")}>Back to Registry</button>
      </div>
    );
  }

  const handleSubmit = (values: EquipmentFormValues) => {
    const result = updateEquipment(id, values as unknown as Parameters<typeof updateEquipment>[1]);
    setUpdated(result);
  };

  if (updated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-slate-700" />
            </div>
            <div>
              <p className="eyebrow">Equipment updated</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{updated.name}</h2>
              <p className="text-sm text-slate-500 mt-2">The existing QR code and equipment ID remain unchanged.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => router.push("/equipment")}>
                <HardHat size={15} /> Back to Registry
              </button>
              <button className="btn" onClick={() => setUpdated(null)}>Edit Again</button>
            </div>
          </div>
          <AssetQr asset={updated} size={180} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="eyebrow">Asset update</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Edit Equipment</h2>
      </div>
      <EquipmentForm
        mode="edit"
        initialValues={equipmentFormFromAsset(asset)}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/equipment/${id}`)}
      />
    </div>
  );
}
