import { useEffect, useState } from 'react';
import { petServices, scheduleUtils } from '../api/scheduleService';
import ModalPetForm from './ModalPetForm';
import FilePreviewModal from './FilePreviewModal';

export default function PetManager() {
  const [mascotas, setMascotas] = useState([]);
  const [temperamentos, setTemperamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [previewFile, setPreviewFile] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, metadataRes] = await Promise.all([
        petServices.getMascotasCliente(),
        petServices.getCaracteristicas(),
      ]);

      setMascotas(mascotasRes.data || []);
      setTemperamentos(metadataRes.data?.temperamentos || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (mascotaId) => {
    if (!window.confirm('¿Estas seguro de que deseas eliminar esta mascota?')) return;

    try {
      await petServices.deleteMascota(mascotaId);
      setMascotas((prev) => prev.filter((m) => m.id !== mascotaId));
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
    return <div className="py-8 text-center">Cargando mascotas...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Mascotas</h2>
        <button
          onClick={() => {
            setEditingPet(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          + Agregar Mascota
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {mascotas.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p>No tienes mascotas registradas</p>
          <button
            onClick={() => {
              setEditingPet(null);
              setShowModal(true);
            }}
            className="mt-4 font-semibold text-blue-600 hover:text-blue-800"
          >
            Crear la primera mascota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mascotas.map((mascota) => {
            const edad = scheduleUtils.calcularEdad(mascota.fecha_nacimiento);

            return (
              <div key={mascota.id} className="rounded-lg border p-4 transition hover:shadow-lg">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{mascota.nombre}</h3>
                    <p className="text-sm text-gray-500">{mascota.especie}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
                    {mascota.tamano}
                  </span>
                </div>

                <div className="mb-4 space-y-1 text-sm text-gray-600">
                  <p><strong>Raza:</strong> {mascota.raza || 'No registrada'}</p>
                  <p><strong>Temperamento:</strong> {mascota.temperamento || 'No registrado'}</p>
                  {edad !== null && <p><strong>Edad:</strong> {edad} anios</p>}
                  {mascota.alergias && <p><strong>Alergias:</strong> {mascota.alergias}</p>}
                  {mascota.ruta_foto_carnet && (
                    <p>
                      <strong>Carnet:</strong>{' '}
                      <button
                        type="button"
                        onClick={() => setPreviewFile(mascota.ruta_foto_carnet)}
                        className="text-blue-600 underline"
                      >
                        Ver archivo
                      </button>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPet(mascota);
                      setShowModal(true);
                    }}
                    className="flex-1 rounded bg-gray-500 px-3 py-2 text-sm text-white transition hover:bg-gray-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletePet(mascota.id)}
                    className="flex-1 rounded bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ModalPetForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePet}
          pet={editingPet}
          temperamentos={temperamentos}
        />
      )}

      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        filePath={previewFile}
        title="Carnet de vacunas"
        onClose={() => setPreviewFile('')}
      />
    </div>
  );
}
