import AppShell from "@/components/AppShell";
import EquipmentDetail from "@/components/equipment/EquipmentDetail";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell title="Equipment Detail">
      <EquipmentDetail assetId={id} />
    </AppShell>
  );
}
