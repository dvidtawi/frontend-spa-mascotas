import {
  useForm
} from 'react-hook-form';

import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

import { FaLock } from 'react-icons/fa';

import { useAuth } from '../../auth/AuthContext';

import TwoFactor from './TwoFactor';
import { getUserFromToken } from '../../utils/token';

const Login = () => {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [show2FA, setShow2FA] =
    useState(false);

  const [credentials, setCredentials] =
    useState(null);

  const {
    register,
    handleSubmit
  } = useForm();

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data) => {
    setErrorMessage("");

    try {
      setLoading(true);

      const response = await login(data);

      if (response.requires2FA) {
        console.log('Requires 2FA, credentials:', data);
        setCredentials(data);
        setShow2FA(true);
        return;
      }

      const decoded = getUserFromToken();

      if (response.primer_inicio) {
        if (decoded?.rol === 1) {
          navigate('/admin/setup-2fa');
          toast.success('Debes activar 2FA antes de continuar');
          return;
        }

        navigate('/change-password');
        toast.success('Debes cambiar tu contraseña');
        return;
      }

      switch (decoded?.rol) {
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
          console.log('Decoded rol:', decoded?.rol);
          navigate('/login');
      }

      toast.success('Login exitoso');
    } catch (err) {
      if (err.response?.data?.requires2FA) {
        setCredentials(data);
        setShow2FA(true);
        return;
      }

      const message =
        err.response?.data?.message ||
        (err.response?.status === 400 ||
        err.response?.status === 401
          ? 'Credenciales inválidas'
          : 'Error de login');

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {

    return (
      <TwoFactor
        credentials={credentials}
      />
    );
  }

  return (

    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
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

        <div className="flex justify-center mb-4">

          <FaLock
            className="
            text-5xl
            text-blue-600
            "
          />

        </div>

        <h1
          className="
          text-3xl
          font-bold
          text-center
          mb-8
          "
        >
          Pet Spa Login
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <input
            type="email"
            placeholder="Correo"
            className="
            w-full
            border
            p-3
            rounded-lg
            "
            {...register('email')}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="
            w-full
            border
            p-3
            rounded-lg
            "
            {...register('password')}
          />

          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            p-3
            rounded-lg
            transition
            "
          >

            {
              loading
                ? 'Ingresando...'
                : 'Ingresar'
            }

          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">
              {errorMessage}
            </p>
          )}

          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <br />
            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              ¿No tienes una cuenta? Regístrate
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
  
        </form>

      </div>

    </div>
  );
};

export default Login;