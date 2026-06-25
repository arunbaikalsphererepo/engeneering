import AppShell from "@/components/AppShell";
import ExpenditureSectionPage from "@/components/expenditure/ExpenditureSectionPage";

export default function UtilityExpenditurePage() {
  return (
    <AppShell title="Utility Expenditure">
      <ExpenditureSectionPage type="utility" title="Utility Expenditure" barColor="#0ea5e9" />
    </AppShell>
  );
}
