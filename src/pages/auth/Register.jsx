import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";

export default function Register() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await api.post("/auth/register", data);
      toast.success("Código enviado al correo");
      navigate("/verify-email", { state: data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
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

            <div>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full border p-3 rounded-lg"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                })}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Teléfono"
                className="w-full border p-3 rounded-lg"
                {...register("telefono", {
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "El teléfono debe contener sólo números",
                  },
                  minLength: {
                    value: 7,
                    message: "El teléfono es muy corto",
                  },
                })}
              />
              {errors.telefono && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Correo"
                className="w-full border p-3 rounded-lg"
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un correo válido",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              {(() => {
                const passwordRegister = register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 8,
                    message: "La contraseña debe tener al menos 8 caracteres",
                  },
                });

                return (
                  <>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      className="w-full border p-3 rounded-lg"
                      {...passwordRegister}
                      onChange={(e) => {
                        passwordRegister.onChange(e);
                        setPassword(e.target.value);
                      }}
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            <PasswordStrengthMeter
              password={password}
            />

            <button
              type="submit"
              disabled={loading}
              className="
              w-full
              bg-blue-600
              text-white
              p-3
              rounded-lg
              disabled:opacity-50
              disabled:cursor-not-allowed
              "
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>

          </form>

          <div className="text-center mt-4">

            <Link
                to="/login"
                className="
                text-blue-600
                hover:underline
                "
            >
                ¿Ya tienes una cuenta? Inicia sesión
            </Link>

          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver a la vista de cliente
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}