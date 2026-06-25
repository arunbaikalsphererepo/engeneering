import AppShell from "@/components/AppShell";
import EditContent from "@/components/equipment/EditContent";

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell title="Edit Equipment">
      <EditContent id={id} />
    </AppShell>
  );
}
