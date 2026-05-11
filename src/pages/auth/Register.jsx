import {
  useForm
} from "react-hook-form";

import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PasswordStrengthMeter
from "../../components/PasswordStrengthMeter";

export default function Register() {

  const navigate =
    useNavigate();

  const [password, setPassword] =
    useState("");

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = async (data) => {

    try {

      await api.post(
        "/auth/register",
        data
      );

      toast.success(
        "Código enviado al correo"
      );

      navigate(
        "/verify-email",
        {
          state: data
        }
      );

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Error"
      );
    }
  };

  return (

    <div className="min-h-screen bg-gray-100">

      <div
        className="
        flex
        justify-center
        items-center
        p-10
        "
      >

        <div
          className="
          bg-white
          p-10
          rounded-2xl
          shadow-xl
          w-full
          max-w-lg
          "
        >

          <h1
            className="
            text-3xl
            font-bold
            mb-6
            text-center
            "
          >
            Registro
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            <input
              type="text"
              placeholder="Nombre"
              className="w-full border p-3 rounded-lg"
              {...register("nombre")}
            />

            <input
              type="text"
              placeholder="Teléfono"
              className="w-full border p-3 rounded-lg"
              {...register("telefono")}
            />

            <input
              type="email"
              placeholder="Correo"
              className="w-full border p-3 rounded-lg"
              {...register("email")}
            />

            <input
              type="password"
              placeholder="Contraseña"
              className="w-full border p-3 rounded-lg"
              {...register("password")}

              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <PasswordStrengthMeter
              password={password}
            />

            <button
              className="
              w-full
              bg-blue-600
              text-white
              p-3
              rounded-lg
              "
            >
              Registrarse
            </button>

          </form>

          <div className="text-center mt-4">

            <a
                href="/login"
                className="
                text-blue-600
                hover:underline
                "
            >
                ¿Ya tienes una cuenta? Inicia sesión
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}