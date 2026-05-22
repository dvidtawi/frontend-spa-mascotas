import { useEffect, useState } from 'react';
import FilePreviewModal from './FilePreviewModal';

const EMPTY_FORM = {
  nombre: '',
  especie: '',
  raza: '',
  tamano: '',
  fecha_nacimiento: '',
  alergias: '',
  temperamento: '',
  ruta_foto_carnet: '',
  notas: '',
  carnet: null,
};

export default function ModalPetForm({ isOpen, onClose, onSave, pet, temperamentos = [] }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        nombre: pet.nombre || '',
        especie: pet.especie || '',
        raza: pet.raza || '',
        tamano: pet.tamano || pet['tamaño'] || '',
        fecha_nacimiento: pet.fecha_nacimiento ? pet.fecha_nacimiento.slice(0, 10) : '',
        alergias: pet.alergias || '',
        temperamento: pet.temperamento || '',
        ruta_foto_carnet: pet.ruta_foto_carnet || '',
        notas: pet.notas || '',
        carnet: null,
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setErrors({});
  }, [pet, isOpen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'carnet' ? files?.[0] || null : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!formData.tamano) newErrors.tamano = 'El tamano es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          {pet ? 'Editar Mascota' : 'Agregar Mascota'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Especie *</label>
            <select
              name="especie"
              value={formData.especie}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.especie ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar especie...</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.especie && <p className="mt-1 text-xs text-red-500">{errors.especie}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Raza</label>
            <input
              type="text"
              name="raza"
              value={formData.raza}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Tamano *</label>
            <select
              name="tamano"
              value={formData.tamano}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.tamano ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar tamano...</option>
              <option value="Pequeno">Pequeno</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
              <option value="Gigante">Gigante</option>
            </select>
            {errors.tamano && <p className="mt-1 text-xs text-red-500">{errors.tamano}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Temperamento
            </label>
            <select
              name="temperamento"
              value={formData.temperamento}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar temperamento...</option>
              {temperamentos.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Carnet de vacunas (PDF o imagen)
            </label>
            <input
              type="file"
              name="carnet"
              accept=".pdf,image/*"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.ruta_foto_carnet && (
              <div className="mt-2 rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-900">Ya existe un carnet cargado.</p>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="mt-2 text-sm font-semibold text-blue-600 underline"
                >
                  Ver carnet actual
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Alergias</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

        <FilePreviewModal
          isOpen={showPreview}
          filePath={formData.ruta_foto_carnet}
          title="Carnet de vacunas"
          onClose={() => setShowPreview(false)}
        />
      </div>
    </div>
  );
}
