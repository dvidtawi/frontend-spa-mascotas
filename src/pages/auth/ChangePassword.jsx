import {
  useForm
} from "react-hook-form";

import {
  useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PasswordStrengthMeter
from "../../components/PasswordStrengthMeter";

import { useAuth } from "../../auth/AuthContext";

export default function ChangePassword() {

  const navigate =
    useNavigate();

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch
  } = useForm();

  const password = watch("newPassword", "");

  const onSubmit = async (data) => {

    try {

      await api.post(
        "/auth/change-password",
        data
      );

      toast.success(
        "Contraseña actualizada"
      );

      // Redirect based on role
      switch (user.rol) {
        case 1:
          navigate('/admin');
          break;
        case 2:
          navigate('/groomer');
          break;
        case 3:
          navigate('/recepcion');
          break;
        case 4:
          navigate('/cliente');
          break;
        default:
          navigate('/login');
      }

    } catch (err) {

      toast.error(
        err.response?.data?.message
      );
    }
  };

  return (

    <div
      className="
      min-h-screen
      flex
      justify-center
      items-center
      bg-gray-100
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
          Cambiar Contraseña
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <input
            type="password"
            placeholder="Contraseña actual"
            className="w-full border p-3 rounded-lg"
            {...register("currentPassword")}
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
            bg-blue-600
            text-white
            p-3
            rounded-lg
            "
          >
            Actualizar
          </button>

        </form>

      </div>

    </div>
  );
}