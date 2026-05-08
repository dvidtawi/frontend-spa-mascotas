import {
  useForm
} from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

import { useAuth } from '../../auth/AuthContext';

const TwoFactor = ({
  credentials
}) => {

  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = async (data) => {

    try {

      const response =
        await login({

          ...credentials,

          twoFactorCode:
            data.twoFactorCode
        });

      toast.success(
        '2FA correcto'
      );

      navigate('/admin');

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
  );
};

export default TwoFactor;