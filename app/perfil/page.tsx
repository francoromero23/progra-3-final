"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedNombre = localStorage.getItem("nombre");
    const storedEmail = localStorage.getItem("email");
    const storedRol = localStorage.getItem("rol");

    if (!storedNombre || !storedEmail || !storedRol) {
      alert("No tienes una sesión activa.");
      router.push("/"); // Redirigir al inicio si no hay sesión
      return;
    }

    setNombre(storedNombre);
    setEmail(storedEmail);
    setRol(storedRol);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Perfil</h1>
        <p className="text-lg">
          <strong>Nombre:</strong> {nombre}
        </p>
        <p className="text-lg">
          <strong>Email:</strong> {email}
        </p>
        <p className="text-lg">
          <strong>Rol:</strong> {rol}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-900 transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
