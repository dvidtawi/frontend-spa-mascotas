import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { clearTokens } from "../utils/token";

export default function Navbar() {

  const { user, logout, setUser } = useAuth();

  const logoutAll = async () => {

    try {

      await api.post("/auth/logout-all");

      toast.success("Sesiones cerradas");

    } catch (err) {

      console.log(err);

    }

    clearTokens();

    setUser(null);

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
            <>
              <button
                onClick={logout}
                className="
                bg-red-500
                text-white
                px-4
                py-2
                rounded-lg
                "
              >
                Logout
              </button>

              <button
                onClick={logoutAll}
                className="
                bg-black
                text-white
                px-4
                py-2
                rounded-lg
                "
              >
                Logout All
              </button>
            </>
          )
        }

      </div>

    </header>
  );
}