import { useState, useEffect } from 'react';
import { petServices, scheduleUtils } from '../api/scheduleService';
import ModalPetForm from './ModalPetForm';

export default function PetManager() {
  const [mascotas, setMascotas] = useState([]);
  const [características, setCaracterísticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, caracteristicasRes] = await Promise.all([
        petServices.getMascotasCliente(),
        petServices.getCaracteristicas()
      ]);
      
      setMascotas(mascotasRes.data || []);
      
      // Manejar características que pueden venir de diferentes formas
      const caracteristicas = Array.isArray(caracteristicasRes.data) 
        ? caracteristicasRes.data 
        : (caracteristicasRes.data?.caracteristicas || []);
      setCaracterísticas(caracteristicas);
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar mascotas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setShowModal(true);
  };

  const handleEditPet = (mascota) => {
    setEditingPet(mascota);
    setShowModal(true);
  };

  const handleDeletePet = async (mascotaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta mascota?')) return;
    
    try {
      await petServices.deleteMascota(mascotaId);
      setMascotas(mascotas.filter(m => m.id !== mascotaId));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar mascota');
    }
  };

  const handleSavePet = async (petData) => {
    try {
      if (editingPet) {
        await petServices.updateMascota(editingPet.id, petData);
      } else {
        await petServices.createMascota(petData);
      }
      await loadData();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar mascota');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando mascotas...</div>;
  }

  const getCaracteristicaNombre = (caracteristicaId) => {
    const carac = características.find(c => c.id === caracteristicaId);
    return carac ? carac.nombre : 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Mascotas</h2>
        <button
          onClick={handleAddPet}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Agregar Mascota
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {mascotas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No tienes mascotas registradas</p>
          <button
            onClick={handleAddPet}
            className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
          >
            Crear la primera mascota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mascotas.map((mascota) => (
            <div
              key={mascota.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{mascota.nombre}</h3>
                  <p className="text-sm text-gray-500">{mascota.especie}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {mascota.tamaño}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p><strong>Raza:</strong> {mascota.raza}</p>
                <p><strong>Característica:</strong> {getCaracteristicaNombre(mascota.caracteristica_id)}</p>
                {mascota.edad && <p><strong>Edad:</strong> {mascota.edad} años</p>}
                {mascota.peso && <p><strong>Peso:</strong> {mascota.peso} kg</p>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPet(mascota)}
                  className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletePet(mascota.id)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ModalPetForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePet}
          pet={editingPet}
          características={características}
        />
      )}
    </div>
  );
}
