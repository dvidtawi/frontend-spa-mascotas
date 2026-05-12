import {
  useEffect,
  useState
} from "react";

import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";

const eventLabels = {
  LOGIN_SUCCESS: "Usuario logueado",
  LOGIN_FAILURE: "Inicio de sesión fallido",
  ADMIN_UPDATE_USER: "Admin actualizó usuario",
  ADMIN_TOGGLE_USER: "Admin cambió estado de usuario",
  PASSWORD_RESET: "Contraseña reseteada",
  PASSWORD_RESET_REQUESTED: "Solicitud de recuperación",
  LOGOUT: "Cierre de sesión",
  LOGOUT_ALL: "Cierre de sesión en todos los dispositivos",
  EMAIL_VERIFIED: "Email verificado",
  "2FA_FAILED": "2FA fallido",
  "2FA_ENABLED": "2FA activado",
  "2FA_VERIFIED": "2FA verificado",
};

export default function AuditLogs() {

  const [logs, setLogs] =
    useState([]);

  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {

    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/audit-logs");
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLogs();

  }, []);

  const formatEvent = (evento) => {
    return eventLabels[evento] || evento || "Evento desconocido";
  };

  const renderDetail = (log) => {
    const description = log.descripcion || "No hay descripción";
    const details = log.detalles_json || {};
    const affectedId = details.usuario_afectado_id || details.usuario_afectado || null;
    const newData = details.nuevos_datos || null;
    const newState = details.nuevo_estado;

    return (
      <div className="space-y-2 text-sm text-gray-700">
        <p>{description}</p>
        {affectedId && (
          <p className="text-gray-500">Usuario afectado: {affectedId}</p>
        )}
        {newData && (
          <div className="text-gray-500">
            <p className="font-medium">Nuevos datos:</p>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(newData, null, 2)}</pre>
          </div>
        )}
        {typeof newState === "boolean" && (
          <p className="text-gray-500">Nuevo estado: {newState ? "Activo" : "Inactivo"}</p>
        )}
        {Object.keys(details).length > 0 && !newData && !newState && !affectedId && (
          <pre className="whitespace-pre-wrap text-sm text-gray-500">{JSON.stringify(details, null, 2)}</pre>
        )}
      </div>
    );
  };

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="flex">

        <Sidebar onChangePassword={() => setShowChangePassword(true)} />

        <main className="flex-1 p-8">

          <h1 className="text-4xl font-bold mb-6">Audit Logs</h1>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">User Agent</th>
                  <th className="px-4 py-3">Detalles</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 align-top font-medium">
                      {formatEvent(log.evento)}
                    </td>
                    <td className="px-4 py-3 align-top">{log.descripcion || "No hay descripción"}</td>
                    <td className="px-4 py-3 align-top">
                      {log.email_usuario || "Desconocido"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {log.user_agent || "-"}
                    </td>
                    <td className="px-4 py-3 align-top max-w-sm break-words">{renderDetail(log)}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {log.fecha_hora ? new Date(log.fecha_hora).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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