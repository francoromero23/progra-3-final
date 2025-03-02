import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/fondo_principal.webp')] bg-cover bg-center opacity-90"></div>

      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-16 rounded-xl shadow-lg w-full max-w-4xl text-white text-center">
          <h1 className="text-4xl font-bold mb-6">
            Bienvenido a las Noticias Corporativas
          </h1>
          <p className="text-lg mb-8">
            Inicia sesión o regístrate para acceder a las últimas noticias y
            actualizaciones de nuestra empresa.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/auth/login"
              className="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white text-lg py-3 px-6 rounded-lg shadow-md transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-600 bg-opacity-80 hover:bg-opacity-100 text-white text-lg py-3 px-6 rounded-lg shadow-md transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
