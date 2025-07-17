"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import InputField from "@/app/components/InputField";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  contraseña: string;
}

interface LoginResponse {
  success: boolean;
  id_empleado?: string;
  id_departamento?: string;
  rol?: string;
  message?: string;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    contraseña: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

        if (!formData.email || !formData.contraseña) {
      alert("Por favor, ingresa tu email y contraseña.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, ingresa un formato de email válido.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data: LoginResponse = await res.json();

      if (data.success) {
        // ya no guardo id_empleado, id_departamento o rol en localStorage aquí.
        // Si el token se envía como HttpOnly cookie, el navegador lo manejará automáticamente.
        router.push("/noticias");
      } else {
        alert(data.message ?? "Error desconocido.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/fondo.jpeg')] bg-cover bg-center opacity-90"></div>
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-xl shadow-lg w-full max-w-lg">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Iniciar Sesión
          </h1>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <InputField
              label="Introduzca su Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="Introduzca su Contraseña"
              name="contraseña"
              type="password"
              value={formData.contraseña}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-3 rounded-lg transition duration-300 w-full"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/auth/register" className="text-white hover:underline">
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
