import GroomerWorkspace from '../../components/GroomerWorkspace';
import DashboardShell from '../../components/DashboardShell';

export default function DashboardGroomer() {
  const tabs = [{ id: 'agenda', label: 'Mi agenda' }];

  return (
    <DashboardShell title="Groomer" tabs={tabs} activeTab="agenda">
      <GroomerWorkspace />
    </DashboardShell>
  );
}
