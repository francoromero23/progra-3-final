"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Noticia {
  id_noticias: number;
  titulo: string;
  contenido: string;
  descripcion_general: string;
  fecha_evento: string;
  color: string;
}

export default function MisNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedIdEmpleado = localStorage.getItem("empleadoId");

    if (!storedIdEmpleado) {
      alert("No tienes una sesión activa.");
      router.push("/"); // Redirigir al inicio si no hay sesión
      return;
    }

    setIdEmpleado(storedIdEmpleado);
    fetchMisNoticias(storedIdEmpleado);
  }, [router]);

  const fetchMisNoticias = async (idEmpleado: string) => {
    try {
      const res = await fetch(`/api/noticias?empleadoId=${idEmpleado}`);
      if (!res.ok) throw new Error("Error al cargar noticias");
      const data: Noticia[] = await res.json();
      setNoticias(data);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black">
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
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-center">No tienes noticias creadas.</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-900 transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
