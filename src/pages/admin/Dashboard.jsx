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

          <h1
            className="
            text-4xl
            font-bold
            mb-6
            "
          >
            Panel Administrador
          </h1>

          <div
            className="
            grid
            grid-cols-2
            gap-6
            "
          >

            <Link
              to="/admin/users"
              className="
              bg-white
              p-6
              rounded-xl
              shadow
              hover:shadow-lg
              transition
              block
              "
            >
              <h2 className="text-xl font-semibold mb-2">Gestión Usuarios</h2>
              <p>Crear, editar y gestionar usuarios del sistema.</p>
            </Link>

            <Link
              to="/admin/audit"
              className="
              bg-white
              p-6
              rounded-xl
              shadow
              hover:shadow-lg
              transition
              block
              "
            >
              <h2 className="text-xl font-semibold mb-2">Auditoría</h2>
              <p>Ver logs de auditoría del sistema.</p>
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