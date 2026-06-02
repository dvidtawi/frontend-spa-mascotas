import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';

const services = [
  {
    title: 'Grooming profesional',
    description: 'Baño, corte, peinado y servicio completo con seguimiento técnico.',
  },
  {
    title: 'Agenda y reservas',
    description: 'Solicita citas, revisa disponibilidad y recibe confirmaciones operativas.',
  },
  {
    title: 'Tienda para mascotas',
    description: 'Productos de higiene, accesorios y promociones de temporada.',
  },
];

const Landing = () => {
  const { user } = useAuth();

  if (user) {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_transparent_30%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#f8fafc_100%)]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 md:p-12">
              <p className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
                PetSpa Mascotas
              </p>
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
                Un spa, agenda y tienda pensados para cuidar a tu mascota.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                Reserva servicios, organiza tu historial y explora nuestra tienda con productos de higiene, accesorios y promociones activas.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Registrarse
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-8 text-white lg:border-l lg:border-t-0 md:p-10">
              <h2 className="text-2xl font-bold">Lo que puedes hacer</h2>
              <div className="mt-6 space-y-4">
                {services.map((service) => (
                  <article key={service.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{service.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
