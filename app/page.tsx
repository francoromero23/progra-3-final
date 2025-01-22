import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-blue-700 mb-6">
          Bienvenido a las Noticias Corporativas
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Inicia sesión o regístrate para acceder a las últimas noticias y
          actualizaciones de nuestra empresa.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/auth/register"
            className="bg-green-600 text-white text-lg py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-all"
          >
            Registrarse
          </Link>
        </div>
      </div>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Nombre de la Empresa. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
