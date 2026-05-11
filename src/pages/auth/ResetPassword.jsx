import {
  useForm
} from "react-hook-form";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PasswordStrengthMeter
from "../../components/PasswordStrengthMeter";

export default function ResetPassword() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const email =
    location.state?.email;

  const {
    register,
    handleSubmit,
    watch
  } = useForm();

  const password = watch("newPassword", "");

  const onSubmit = async (data) => {

    if (!data.code.trim()) {
      toast.error('Ingresa el código de verificación');
      return;
    }

    if (!data.newPassword) {
      toast.error('Ingresa la nueva contraseña');
      return;
    }

    try {

      await api.post(
        "/auth/reset-password",
        {
          email,
          code: data.code,
          newPassword:
            data.newPassword
        }
      );

      toast.success(
        "Contraseña cambiada"
      );

      navigate("/login");

    } catch (err) {

      toast.error(
        err.response?.data?.message || 'Error al cambiar contraseña'
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
          max-w-md
          "
        >

          <h1
            className="
            text-3xl
            font-bold
            mb-6
            "
          >
            Nueva Contraseña
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            <input
              type="text"
              placeholder="Código"
              className="w-full border p-3 rounded-lg"
              {...register("code")}
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full border p-3 rounded-lg"
              {...register("newPassword")}
            />

            <PasswordStrengthMeter
              password={password}
            />

            <button
              type="submit"
              className="
              w-full
              bg-green-600
              text-white
              p-3
              rounded-lg
              "
            >
              Cambiar Contraseña
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}