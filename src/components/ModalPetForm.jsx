import { useState, useEffect } from 'react';

export default function ModalPetForm({ isOpen, onClose, onSave, pet, características }) {
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    tamaño: '',
    caracteristica_id: '',
    edad: '',
    peso: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        nombre: pet.nombre || '',
        especie: pet.especie || '',
        raza: pet.raza || '',
        tamaño: pet.tamaño || '',
        caracteristica_id: pet.caracteristica_id || '',
        edad: pet.edad || '',
        peso: pet.peso || '',
        observaciones: pet.observaciones || ''
      });
    } else {
      setFormData({
        nombre: '',
        especie: '',
        raza: '',
        tamaño: '',
        caracteristica_id: '',
        edad: '',
        peso: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [pet, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.especie) newErrors.especie = 'La especie es requerida';
    if (!formData.raza.trim()) newErrors.raza = 'La raza es requerida';
    if (!formData.tamaño) newErrors.tamaño = 'El tamaño es requerido';
    if (!formData.caracteristica_id) newErrors.caracteristica_id = 'La característica es requerida';
    
    if (formData.edad && isNaN(formData.edad)) newErrors.edad = 'La edad debe ser un número';
    if (formData.peso && isNaN(formData.peso)) newErrors.peso = 'El peso debe ser un número';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        edad: formData.edad ? parseInt(formData.edad) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        caracteristica_id: parseInt(formData.caracteristica_id)
      };
      
      await onSave(submitData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {pet ? 'Editar Mascota' : 'Agregar Mascota'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Max"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
          </div>

          {/* Especie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Especie *
            </label>
            <select
              name="especie"
              value={formData.especie}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.especie ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar especie...</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Conejo">Conejo</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.especie && <p className="text-red-500 text-xs mt-1">{errors.especie}</p>}
          </div>

          {/* Raza */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Raza *
            </label>
            <input
              type="text"
              name="raza"
              value={formData.raza}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.raza ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Labrador"
            />
            {errors.raza && <p className="text-red-500 text-xs mt-1">{errors.raza}</p>}
          </div>

          {/* Tamaño */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tamaño *
            </label>
            <select
              name="tamaño"
              value={formData.tamaño}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.tamaño ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar tamaño...</option>
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
              <option value="Gigante">Gigante</option>
            </select>
            {errors.tamaño && <p className="text-red-500 text-xs mt-1">{errors.tamaño}</p>}
          </div>

          {/* Característica */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Característica *
            </label>
            <select
              name="caracteristica_id"
              value={formData.caracteristica_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caracteristica_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar característica...</option>
              {Array.isArray(características) && características.map((carac) => (
                <option key={carac.id} value={carac.id}>
                  {carac.nombre} ({carac.ajuste_porcentaje}%)
                </option>
              ))}
            </select>
            {errors.caracteristica_id && (
              <p className="text-red-500 text-xs mt-1">{errors.caracteristica_id}</p>
            )}
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Edad (años)
            </label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.edad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 3"
              min="0"
              max="50"
            />
            {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad}</p>}
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              name="peso"
              value={formData.peso}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.peso ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 25"
              min="0"
              step="0.1"
            />
            {errors.peso && <p className="text-red-500 text-xs mt-1">{errors.peso}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas sobre la mascota..."
              rows="3"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
