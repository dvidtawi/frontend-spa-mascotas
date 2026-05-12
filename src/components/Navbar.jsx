import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de cerrar sesión?"
    );
    if (!confirmed) return;

    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cerrar sesión");
    }
  };

  return (

    <header
      className="
      bg-white
      shadow-md
      px-6
      py-4
      flex
      justify-between
      items-center
      "
    >

      <h1
        className="
        text-2xl
        font-bold
        text-blue-600
        "
      >

        {
          user?.rol === 1
            ? "Administrador"

          : user?.rol === 2
            ? "Groomer"

          : user?.rol === 3
            ? "Recepcionista"

          : "PetSpa Mascotas"
        }

      </h1>

      <div className="flex gap-4">

        {
          !user && (
            <>
              <Link
                to="/login"
                className="
                bg-blue-600
                text-white
                px-4
                py-2
                rounded-lg
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                border
                px-4
                py-2
                rounded-lg
                "
              >
                Registro
              </Link>
            </>
          )
        }

        {
          user && (
            <button
              onClick={handleLogout}
              className="
              bg-red-500
              text-white
              px-4
              py-2
              rounded-lg
              "
            >
              Cerrar sesión
            </button>
          )
        }

      </div>

    </header>
  );
}