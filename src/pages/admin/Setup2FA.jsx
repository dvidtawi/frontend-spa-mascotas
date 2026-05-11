import {
  useState
} from "react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";

export default function Setup2FA() {

  const [qr, setQr] =
    useState(null);

  const [token, setToken] =
    useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);

  const generateQR = async () => {

    try {

      const res =
        await api.post(
          "/auth/setup-2fa"
        );

      setQr(res.data.qrCode);

    } catch (err) {

      toast.error("Error");
    }
  };

  const verify2FA = async () => {

    try {

      await api.post(
        "/auth/verify-2fa",
        { token }
      );

      toast.success(
        "2FA activado"
      );

    } catch (err) {

      toast.error(
        err.response?.data?.message
      );
    }
  };

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
            Configurar 2FA
          </h1>

          <div
            className="
            bg-white
            p-8
            rounded-xl
            shadow
            "
          >

            <button
              onClick={generateQR}
              className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
              "
            >
              Generar QR
            </button>

            {
              qr && (
                <div className="mt-6">

                  <img
                    src={qr}
                    alt="QR"
                    className="w-64"
                  />

                  <input
                    placeholder="Código Authenticator"
                    className="
                    border
                    p-3
                    rounded-lg
                    w-full
                    mt-4
                    "

                    onChange={(e) =>
                      setToken(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={verify2FA}
                    className="
                    mt-4
                    bg-green-600
                    text-white
                    px-6
                    py-3
                    rounded-lg
                    "
                  >
                    Verificar
                  </button>

                </div>
              )
            }

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