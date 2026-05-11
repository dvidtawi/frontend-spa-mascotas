import {
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useForm
} from "react-hook-form";

import toast from "react-hot-toast";

import api from "../../api/axios";

export default function VerifyEmail() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const userData =
    location.state;

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = async (data) => {

    try {

      await api.post(
        "/auth/verify-email",
        {
          ...userData,
          code: data.code
        }
      );

      toast.success(
        "Cuenta creada"
      );

      navigate("/login");

    } catch (err) {

      toast.error(
        err.response?.data?.message
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
            Verificar Email
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

            <button
              className="
              w-full
              bg-green-600
              text-white
              p-3
              rounded-lg
              "
            >
              Verificar
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}