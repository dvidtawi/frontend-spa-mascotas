import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    // Redirect based on role
    switch (user.rol) {
      case 1:
        return <Navigate to="/admin" />;
      case 2:
        return <Navigate to="/groomer" />;
      case 3:
        return <Navigate to="/recepcion" />;
      case 4:
        return <Navigate to="/cliente" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PetSpa de Mascotas</h1>
          <p className="text-gray-600 mb-8">Bienvenido a nuestro servicio de spa para mascotas. Inicia sesión o regístrate para acceder a nuestros servicios.</p>
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 block text-center"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 block text-center"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;