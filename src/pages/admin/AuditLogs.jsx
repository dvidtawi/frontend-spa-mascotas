import {
  useEffect,
  useState
} from "react";

import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";

export default function AuditLogs() {

  const [logs, setLogs] =
    useState([]);

  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {

    const fetchLogs = async () => {

      const res =
        await api.get(
          "/admin/audit-logs"
        );

      setLogs(res.data);
    };

    fetchLogs();

  }, []);

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
            Audit Logs
          </h1>

          <div
            className="
            bg-white
            rounded-xl
            shadow
            overflow-hidden
            "
          >

            <table className="w-full">

              <thead
                className="
                bg-gray-200
                "
              >

                <tr>

                  <th className="p-4">
                    Evento
                  </th>

                  <th>Usuario</th>

                  <th>IP</th>

                  <th>Fecha</th>

                </tr>

              </thead>

              <tbody>

                {
                  logs.map((log) => (

                    <tr
                      key={log.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        {log.evento}
                      </td>

                      <td>
                        {log.usuario_email}
                      </td>

                      <td>
                        {log.ip_address}
                      </td>

                      <td>
                        {
                          new Date(
                            log.fecha_hora
                          ).toLocaleString()
                        }
                      </td>

                    </tr>
                  ))
                }

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