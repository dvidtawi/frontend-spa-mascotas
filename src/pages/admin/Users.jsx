import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ModalUserForm from '../../components/ModalUserForm';
import DashboardShell from '../../components/DashboardShell';

const roleLabels = {
  admin: 'Administrador',
  groomer: 'Groomer',
  recepcionista: 'Recepcionista',
  cliente: 'Cliente',
  1: 'Administrador',
  2: 'Groomer',
  3: 'Recepcionista',
  4: 'Cliente',
};

const roleValueFromApi = {
  admin: 1,
  groomer: 2,
  recepcionista: 3,
  cliente: 4,
};

const getRoleIdFromUser = (user) => {
  if (user?.rol_id) return user.rol_id;
  if (user?.rol && roleValueFromApi[user.rol]) return roleValueFromApi[user.rol];
  return 4;
};

const getRoleLabelFromUser = (user) => {
  if (user?.rol && roleLabels[user.rol]) return roleLabels[user.rol];
  if (user?.rol_id && roleLabels[user.rol_id]) return roleLabels[user.rol_id];
  return user?.rol || `Rol ${user?.rol_id || 'desconocido'}`;
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', rol_id: 4 });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Error cargando usuarios');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateForm = () => {
    setEditingUser(null);
    setForm({ nombre: '', email: '', telefono: '', rol_id: 4 });
    setShowUserForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({
      nombre: user.nombre || '',
      email: user.email || '',
      telefono: user.telefono || '',
      rol_id: getRoleIdFromUser(user),
    });
    setShowUserForm(true);
  };

  const closeForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setForm({ nombre: '', email: '', telefono: '', rol_id: 4 });
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.email.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Ingresa un correo válido.';
    if (!form.telefono.trim()) return 'El teléfono es obligatorio.';
    return null;
  };

  const saveUser = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, form);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/admin/users', form);
        toast.success('Usuario registrado');
      }
      fetchUsers();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const toggleUser = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('No puedes cambiar tu propio estado');
      return;
    }

    const action = user.estado_activo ? 'inactivar' : 'activar';
    const confirmed = window.confirm(`¿Estás seguro de ${action} al usuario ${user.email}?`);
    if (!confirmed) return;

    try {
      await api.patch(`/admin/users/${user.id}/toggle`);
      toast.success(`Usuario ${action}o correctamente`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  return (
    <DashboardShell title="Usuarios" tabs={[]} activeTab="" onTabChange={null}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-slate-600">Administra las cuentas del sistema.</p>
          </div>
          <button
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Registrar usuario
          </button>
        </div>

        <ModalUserForm
          isOpen={showUserForm}
          editingUser={editingUser}
          form={form}
          setForm={setForm}
          onClose={closeForm}
          onSave={saveUser}
        />

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{u.nombre}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{getRoleLabelFromUser(u)}</td>
                  <td className="px-4 py-3">{u.telefono || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm ${u.estado_activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.estado_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditForm(u)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleUser(u)}
                        className={`rounded-lg px-3 py-2 text-white ${u.estado_activo ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {u.estado_activo ? 'Inactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
