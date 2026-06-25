import AppShell from "@/components/AppShell";
import NewRequest from "@/components/maintenance/NewRequest";

export default function NewMaintenanceRequestPage() {
  return (
    <AppShell title="New Maintenance Request">
      <NewRequest />
    </AppShell>
  );
}
