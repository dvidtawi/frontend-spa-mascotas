import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../api/axios";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

export default function ModalChangePassword({ isOpen, onClose }) {
  const { register, handleSubmit, watch } = useForm();
  const password = watch("newPassword", "");

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/change-password", data);
      toast.success("Contraseña actualizada");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Cambiar Contraseña</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <PasswordStrengthMeter password={password} />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            Actualizar
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 text-gray-600 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}