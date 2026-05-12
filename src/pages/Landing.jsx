import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">Bienvenido a PetSpa Mascotas</h1>
          <p className="text-gray-600 text-lg mb-8">Explora nuestros servicios y accede con tu cuenta para gestionar tus mascotas y citas.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              to="/login"
              className="block bg-blue-600 text-white py-4 rounded-xl text-center font-semibold hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="block bg-green-600 text-white py-4 rounded-xl text-center font-semibold hover:bg-green-700 transition"
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