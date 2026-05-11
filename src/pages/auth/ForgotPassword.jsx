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

export default function ForgotPassword() {

  const navigate =
    useNavigate();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = async (data) => {

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {

      await api.post(
        "/auth/forgot-password",
        data
      );

      toast.success(
        "Código enviado"
      );

      navigate(
        "/reset-password",
        {
          state: {
            email: data.email
          }
        }
      );

    } catch (err) {

      toast.error("Error");
    } finally {

      setIsSubmitting(false);
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
            Recuperar Contraseña
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            <input
              type="email"
              placeholder="Correo"
              className="w-full border p-3 rounded-lg"
              {...register("email")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="
              w-full
              bg-blue-600
              text-white
              p-3
              rounded-lg
              disabled:opacity-50
              "
            >
              {isSubmitting ? "Enviando..." : "Enviar Código"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}