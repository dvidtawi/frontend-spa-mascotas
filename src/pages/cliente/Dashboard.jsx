import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";
import { useState } from "react";

export default function DashboardCliente() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="flex">

        <Sidebar onChangePassword={() => setShowChangePassword(true)} />

        <main className="flex-1 p-10">

          <h1
            className="
            text-5xl
            font-bold
            text-blue-600
            "
          >
            Bienvenido a PetSpa Mascotas
          </h1>

          <p className="mt-4 text-lg">
            Plataforma para clientes.
          </p>

        </main>

      </div>

      <ModalChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

    </div>
  );
}