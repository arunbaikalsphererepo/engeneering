import AppShell from "@/components/AppShell";
import ExpenditureUploadPage from "@/components/expenditure/ExpenditureUploadPage";

export default function UtilityBillUploadPage() {
  return (
    <AppShell title="Upload Utility Bill">
      <ExpenditureUploadPage type="utility" title="Utility Bill Upload" barColor="#0ea5e9" />
    </AppShell>
  );
}
