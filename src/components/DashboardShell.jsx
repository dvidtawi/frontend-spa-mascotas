import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ModalChangePassword from './ModalChangePassword';

export default function DashboardShell({
  title,
  tabs = [],
  activeTab = '',
  onTabChange,
  children,
}) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar
        title={title}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onMenuToggle={() => setSidebarOpen((value) => !value)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
        {children}
      </main>

      <ModalChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
