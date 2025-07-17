"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Noticia {
  id_noticias: number;
  titulo: string;
  contenido: string;
  descripcion_general: string;
  fecha_evento: string;
  color: string;
  creador_nombre?: string; // Asegúrate de que esta propiedad también esté aquí si tu API la devuelve
}

export default function MisNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const router = useRouter();

  // Función para cargar las noticias del empleado, envuelta en useCallback
  const fetchMisNoticias = useCallback(
    async (empleadoId: string) => {
      try {
        // Llama al endpoint /api/noticias y pasa empleadoId como query param
        const res = await fetch(`/api/noticias?empleadoId=${empleadoId}`);
        if (!res.ok) {
          // Si la API responde con 401/403, significa que la sesión no es válida o no hay permisos
          if (res.status === 401 || res.status === 403) {
            alert(
              "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo."
            );
            router.push("/");
            return;
          }
          throw new Error("Error al cargar tus noticias");
        }
        const data: Noticia[] = await res.json();
        setNoticias(data);
      } catch (error) {
        console.error("Error al cargar tus noticias:", error);
      }
    },
    [router]
  ); // Dependencia del router para useCallback

  useEffect(() => {
    // Función para verificar la sesión y cargar datos del usuario
    const verifySessionAndLoadNews = async () => {
      try {
        const res = await fetch("/api/auth/verify-token");
        if (!res.ok) {
          // Si la verificación falla (token inválido/expirado), redirigir a login
          alert("No tienes una sesión activa o ha expirado.");
          router.push("/");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setIdEmpleado(data.id_empleado); // Guarda el idEmpleado del token
          fetchMisNoticias(data.id_empleado); // Llama a fetchMisNoticias con el ID del token
        } else {
          alert("No se pudo verificar tu sesión.");
          router.push("/"); // Redirigir si la verificación no fue exitosa
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        alert("Ocurrió un error al verificar tu sesión. Intenta de nuevo.");
        router.push("/"); // Redirigir en caso de error de red o similar
      } finally {
        setIsLoading(false); // Finalizar la carga
      }
    };

    verifySessionAndLoadNews();
  }, [router, fetchMisNoticias]); // Añadida fetchMisNoticias como dependencia de useEffect

  // Mostrar un estado de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Cargando tus noticias...
        </p>
      </div>
    );
  }

  // Si no hay idEmpleado después de la carga (lo que implica que no se pudo autenticar),
  // se asume que router.push('/') ya se encargó de la redirección.
  if (!idEmpleado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        <p className="text-xl font-semibold">
          Acceso denegado. Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-cover bg-center min-h-screen text-black"
      style={{ backgroundImage: "url('/fondonoticias.jpg')" }}
    >
      <h1 className="text-4xl font-bold text-center mb-6">Mis Noticias</h1>

      {noticias.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <div
              key={noticia.id_noticias}
              className="bg-white p-6 rounded-lg shadow-lg border-4"
              style={{ borderColor: noticia.color }}
            >
              <h2 className="text-2xl font-semibold mb-2">{noticia.titulo}</h2>
              <p className="text-lg mb-4">{noticia.descripcion_general}</p>
              <p className="text-sm">
                Fecha: {new Date(noticia.fecha_evento).toLocaleDateString()}
              </p>
              {noticia.creador_nombre && (
                <p className="text-sm text-gray-600">
                  Creador: {noticia.creador_nombre}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-center">No tienes noticias creadas.</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/noticias")}
          className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-900 transition"
        >
          Volver a Noticias del Departamento
        </button>
      </div>
    </div>
  );
}
