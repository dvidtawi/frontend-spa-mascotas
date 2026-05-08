import {
  useForm
} from 'react-hook-form';

import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

import { FaLock } from 'react-icons/fa';

import { useAuth } from '../../auth/AuthContext';

import TwoFactor from './TwoFactor';

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

  const onSubmit = async (data) => {

    try {

      setLoading(true);

      const response =
        await login(data);

      if (
        response.user.rol === 1
      ) {

        navigate('/admin');
      }

      else if (
        response.user.rol === 2
      ) {

        navigate('/groomer');
      }

      else if (
        response.user.rol === 3
      ) {

        navigate('/recepcion');
      }

      else {

        navigate('/cliente');
      }

      if (
        response.primer_inicio
      ) {

        navigate('/change-password');
      }

      toast.success(
        'Login exitoso'
      );

    } catch (err) {

      if (
        err.response?.data
          ?.requires2FA
      ) {

        setCredentials(data);

        setShow2FA(true);

        return;
      }

      toast.error(
        err.response?.data?.message ||
        'Error login'
      );

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

        </form>

      </div>

    </div>
  );
};

export default Login;