import { useState } from "react";

const roleOptions = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Groomer" },
  { value: 3, label: "Recepcionista" },
  { value: 4, label: "Cliente" },
];

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ModalUserForm({
  isOpen,
  editingUser,
  form,
  setForm,
  onClose,
  onSave,
}) {
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!form.email.trim()) {
      setError("El correo es obligatorio.");
      return;
    }

    if (!validateEmail(form.email.trim())) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (!form.telefono.trim()) {
      setError("El teléfono es obligatorio.");
      return;
    }

    setError("");
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold">{editingUser ? "Editar usuario" : "Registrar usuario"}</h2>
            <p className="text-sm text-gray-600">{editingUser ? "Modifica los datos del usuario." : "Completa el formulario para crear un usuario."}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">Cerrar</button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Nombre"
              className="border p-3 rounded-xl w-full"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-3 rounded-xl w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={Boolean(editingUser)}
            />
            <input
              placeholder="Teléfono"
              className="border p-3 rounded-xl w-full"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <select
              className="border p-3 rounded-xl w-full"
              value={form.rol_id}
              onChange={(e) => setForm({ ...form, rol_id: Number(e.target.value) })}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700"
            >
              {editingUser ? "Guardar cambios" : "Registrar usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
