import AppShell from "@/components/AppShell";
import ExpenditureUploadPage from "@/components/expenditure/ExpenditureUploadPage";

export default function RepairBillUploadPage() {
  return (
    <AppShell title="Upload Repair Bill">
      <ExpenditureUploadPage type="repair" title="Repair Bill Upload" barColor="#10b981" showEquipmentDetails />
    </AppShell>
  );
}
