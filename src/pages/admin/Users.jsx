import {
  useEffect,
  useState
} from "react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ModalChangePassword from "../../components/ModalChangePassword";

export default function Users() {

  const [users, setUsers] =
    useState([]);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [form, setForm] =
    useState({

      nombre: "",
      email: "",
      telefono: "",
      rol_id: 4
    });

  const fetchUsers = async () => {

    try {

      const res =
        await api.get(
          "/admin/users"
        );

      setUsers(res.data);

    } catch (err) {

      toast.error(
        "Error cargando usuarios"
      );
    }
  };

  useEffect(() => {

    fetchUsers();

  }, []);

  const createUser = async () => {

    try {

      await api.post(
        "/admin/users",
        form
      );

      toast.success(
        "Usuario creado"
      );

      fetchUsers();

    } catch (err) {

      toast.error(
        err.response?.data?.message
      );
    }
  };

  const toggleUser = async (id) => {

    try {

      await api.patch(
        `/admin/users/${id}/toggle`
      );

      toast.success(
        "Estado actualizado"
      );

      fetchUsers();

    } catch (err) {

      toast.error("Error");
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
            Usuarios
          </h1>

          {/* CREATE */}

          <div
            className="
            bg-white
            p-6
            rounded-xl
            shadow
            mb-8
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-4
              "
            >
              Crear Usuario
            </h2>

            <div
              className="
              grid
              grid-cols-2
              gap-4
              "
            >

              <input
                placeholder="Nombre"
                className="border p-3 rounded-lg"

                onChange={(e) =>
                  setForm({
                    ...form,
                    nombre:
                      e.target.value
                  })
                }
              />

              <input
                placeholder="Email"
                className="border p-3 rounded-lg"

                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target.value
                  })
                }
              />

              <input
                placeholder="Teléfono"
                className="border p-3 rounded-lg"

                onChange={(e) =>
                  setForm({
                    ...form,
                    telefono:
                      e.target.value
                  })
                }
              />

              <select
                className="border p-3 rounded-lg"

                onChange={(e) =>
                  setForm({
                    ...form,
                    rol_id:
                      Number(e.target.value)
                  })
                }
              >

                <option value={2}>
                  Groomer
                </option>

                <option value={3}>
                  Recepcionista
                </option>

                <option value={4}>
                  Cliente
                </option>

              </select>

            </div>

            <button
              onClick={createUser}
              className="
              mt-4
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
              "
            >
              Crear
            </button>

          </div>

          {/* TABLE */}

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
                    Nombre
                  </th>

                  <th>Email</th>

                  <th>Rol</th>

                  <th>Estado</th>

                  <th>Acción</th>

                </tr>

              </thead>

              <tbody>

                {
                  users.map((u) => (

                    <tr
                      key={u.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        {u.nombre}
                      </td>

                      <td>
                        {u.email}
                      </td>

                      <td>
                        {u.rol_id}
                      </td>

                      <td>
                        {
                          u.estado_activo
                            ? "Activo"
                            : "Inactivo"
                        }
                      </td>

                      <td>

                        <button
                          onClick={() =>
                            toggleUser(u.id)
                          }

                          className="
                          bg-red-500
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          "
                        >
                          Toggle
                        </button>

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