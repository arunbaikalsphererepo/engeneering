"use client";

import AppShell from "@/components/AppShell";
import EquipmentForm from "@/components/equipment/EquipmentForm";
import AssetQr from "@/components/ui/AssetQr";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, HardHat, Plus } from "lucide-react";
import type { Equipment } from "@/lib/types";
import type { EquipmentFormValues } from "@/components/equipment/EquipmentForm";

function RegisterContent() {
  const { registerEquipment } = useStore();
  const router = useRouter();
  const [registered, setRegistered] = useState<Equipment | null>(null);

  const handleSubmit = async (values: EquipmentFormValues) => {
    const asset = await registerEquipment(values as unknown as Parameters<typeof registerEquipment>[0]);
    setRegistered(asset);
  };

  if (registered) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="eyebrow">Registration complete</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{registered.name}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                <span className="font-mono font-semibold">{registered.id}</span> has been added to the engineering asset register. Attach the QR code to the equipment for quick access.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => router.push("/equipment")}>
                <HardHat size={15} /> View Registry
              </button>
              <button className="btn" onClick={() => setRegistered(null)}>
                <Plus size={15} /> Register Another
              </button>
            </div>
          </div>
          <AssetQr asset={registered} size={180} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="eyebrow">Asset onboarding</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Register Equipment</h2>
      </div>
      <EquipmentForm onSubmit={handleSubmit} onCancel={() => router.push("/equipment")} />
    </div>
  );
}

export default function NewEquipmentPage() {
  return (
    <AppShell title="Register Equipment">
      <RegisterContent />
    </AppShell>
  );
}
