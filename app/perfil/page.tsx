"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PerfilData {
  nombre: string;
  email: string;
  rol: string;
  departamento: string; // Añadido campo departamento
}

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const router = useRouter();

  useEffect(() => {
    const fetchPerfilData = async () => {
      try {
        // Primero, verificar la sesión a través de la API de verificación de token
        const verifyRes = await fetch('/api/auth/verify-token');
        if (!verifyRes.ok) {
          // Si la verificación falla, redirigir a login
          alert("No tienes una sesión activa o ha expirado.");
          router.push('/');
          return;
        }
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          alert("No se pudo verificar tu sesión.");
          router.push('/');
          return;
        }

        // Si la sesión es válida, obtener los datos completos del perfil
        const perfilRes = await fetch('/api/perfil');
        if (!perfilRes.ok) {
          // Si hay un error al obtener el perfil, manejarlo
          const errorData = await perfilRes.json();
          throw new Error(errorData.message || "Error al cargar los datos del perfil.");
        }
        const data: PerfilData = await perfilRes.json();
        setPerfil(data);

      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        alert("Ocurrió un error al cargar tu perfil. Intenta de nuevo.");
        router.push('/'); // Redirigir en caso de error
      } finally {
        setIsLoading(false); // Finalizar la carga
      }
    };

    fetchPerfilData();
  }, [router]); // Dependencia del router

  // Mostrar un estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Cargando perfil...</p>
      </div>
    );
  }

  // Si no se pudo cargar el perfil, se asume que router.push('/') ya se encargó
  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        <p className="text-xl font-semibold">Acceso denegado. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black p-6"
         style={{ backgroundImage: "url('/fondonoticias.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Perfil</h1>
        <p className="text-lg">
          <strong>Nombre:</strong> {perfil.nombre}
        </p>
        <p className="text-lg">
          <strong>Email:</strong> {perfil.email}
        </p>
        <p className="text-lg">
          <strong>Rol:</strong> {perfil.rol}
        </p>
        <p className="text-lg">
          <strong>Departamento:</strong> {perfil.departamento}
        </p>
        <button
          onClick={() => router.push("/noticias")} 
          className="mt-4 bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-900 transition"
        >
          Volver a Noticias
        </button>
      </div>
    </div>
  );
}
