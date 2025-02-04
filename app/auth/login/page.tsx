"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import InputField from "@/app/components/InputField";

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
  const [formData, setFormData] = useState<FormData>({
    email: "",
    contraseña: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al iniciar sesión.");

      const data: LoginResponse = await res.json();

      if (data.success) {
        localStorage.setItem("empleadoId", data.id_empleado ?? "");
        localStorage.setItem("departamentoId", data.id_departamento ?? "");
        localStorage.setItem("rol", data.rol ?? "");

        window.location.href = "/noticias";
      } else {
        alert(data.message ?? "Error desconocido.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 to-teal-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
