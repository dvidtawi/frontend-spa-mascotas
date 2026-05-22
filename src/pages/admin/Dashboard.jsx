import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";

export default function DashboardAdmin() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar onChangePassword={() => setShowChangePassword(true)} />

        <main className="flex-1 p-8">
          <h1 className="mb-6 text-4xl font-bold">Panel Administrador</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              to="/admin/schedule"
              className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">Agenda Operativa</h2>
              <p>Calendario maestro, solicitudes, bloqueos y caja simulada.</p>
            </Link>

            <Link
              to="/admin/users"
              className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">Gestion Usuarios</h2>
              <p>Crear, editar y gestionar usuarios del sistema.</p>
            </Link>

            <Link
              to="/admin/audit"
              className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">Auditoria</h2>
              <p>Ver logs de auditoria del sistema.</p>
            </Link>
          </div>
        </main>
      </div>

      <ModalChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
