import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function Setup2FA() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [qr, setQr] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  if (user.rol !== 1) {
    return <Navigate to="/" replace />;
  }

  if (!user.primer_inicio || user.dos_fa) {
    return <Navigate to="/admin" replace />;
  }

  const generateQR = async () => {
    try {
      const res = await api.post("/auth/setup-2fa");
      setQr(res.data.qrCode);
    } catch (err) {
      toast.error("Error al generar el QR");
    }
  };

  const verify2FA = async () => {
    if (!token.trim()) {
      toast.error("Ingresa el código de tu Authenticator");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/verify-2fa", { token });
      setUser({ ...user, dos_fa: true, primer_inicio: false });
      toast.success("2FA activado");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al verificar 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Configurar 2FA obligatorio</h1>
        <p className="text-gray-600 mb-8 text-center">
          Debes activar la autenticación en dos pasos antes de acceder al panel de administrador.
        </p>

        <div className="space-y-6">
          <button
            onClick={generateQR}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Generar QR
          </button>

          {qr && (
            <div className="rounded-3xl border border-gray-200 p-6 text-center">
              <img src={qr} alt="QR Code" className="mx-auto mb-6 w-64" />
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Código Authenticator"
                className="w-full border p-3 rounded-xl mb-4"
              />
              <button
                onClick={verify2FA}
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                Verificar código
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}