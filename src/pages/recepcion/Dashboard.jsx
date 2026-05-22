import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function DashboardRecepcion() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar onChangePassword={() => setShowChangePassword(true)} />

        <main className="flex-1 p-10">
          <h1 className="text-5xl font-bold">Recepcionista Dashboard</h1>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              to="/admin/schedule"
              className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">Agenda y Solicitudes</h2>
              <p>Controlar citas, aprobar solicitudes, bloquear horarios y reprogramar.</p>
            </Link>

            <Link
              to="/admin/schedule"
              className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">POS Simulado</h2>
              <p>Registrar cobros base y revisar el cierre diario por metodo de pago.</p>
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
