import {
  useForm
} from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';

import { useAuth } from '../../auth/AuthContext';
import { getUserFromToken } from '../../utils/token';

const TwoFactor = ({
  credentials
}) => {

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log('TwoFactor mounted', credentials);
  }, [credentials]);

  console.log('TwoFactor rendered', credentials);

  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = async (data) => {
    setErrorMessage("");

    console.log('onSubmit called', data);

    if (!data.twoFactorCode) {
      const message = 'Ingresa el código 2FA';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    console.log('Submitting 2FA', data);

    try {

      const response =
        await login({

          ...credentials,

          twoFactorCode:
            data.twoFactorCode
        });

      console.log('2FA response', response);

      toast.success('2FA correcto');

      const decoded = getUserFromToken();

      if (response.primer_inicio) {
        if (decoded?.rol === 1) {
          navigate('/admin/setup-2fa');
          return;
        }

        navigate('/change-password');
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
          console.log('Decoded rol after 2FA:', decoded?.rol);
          navigate('/login');
      }

    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Código 2FA inválido'
          : 'Error de verificación 2FA');

      console.log('2FA error', err);
      setErrorMessage(message);
      toast.error(message);
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
        p-8
        rounded-2xl
        shadow-xl
        w-full
        max-w-md
        "
      >

        <h1
          className="
          text-2xl
          font-bold
          mb-6
          text-center
          "
        >
          Verificación 2FA
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Código Google Authenticator"
            className="
            w-full
            border
            p-3
            rounded-lg
            "
            {...register(
              'twoFactorCode'
            )}
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
            Verificar
          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">
              {errorMessage}
            </p>
          )}

        </form>

      </div>

    </div>
  );
};

export default TwoFactor;