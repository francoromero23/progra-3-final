"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import InputField from "@/app/components/InputField";
import SelectField from "@/app/components/SelectField";
import Link from "next/link";

interface Department {
  id_departamentos: number;
  nombre: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  fechaNacimiento: string;
  departamentoId: string;
  rol: string;
}

export default function Register() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    contraseña: "",
    fechaNacimiento: "",
    departamentoId: "1",
    rol: "empleado",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/departamentos");
        if (!res.ok) throw new Error("Error al cargar los departamentos");
        const data: Department[] = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error(error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Ocurrió un error inesperado.");
        return;
      }
      const data = await res.json();
      if (data.success) window.location.href = "/auth/login";
      else alert(data.message);
    } catch {
      alert("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/fondo.jpeg')] bg-cover bg-center opacity-90"></div>

      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-xl shadow-lg w-full max-w-lg">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Registrarse
          </h1>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {(
              [
                "nombre",
                "apellido",
                "email",
                "contraseña",
                "fechaNacimiento",
              ] as Array<keyof FormData>
            ).map((name) => (
              <InputField
                key={name}
                label={name.charAt(0).toUpperCase() + name.slice(1)}
                name={name}
                type={
                  name === "fechaNacimiento"
                    ? "date"
                    : name === "contraseña"
                    ? "password"
                    : "text"
                }
                value={formData[name]}
                onChange={handleChange}
              />
            ))}

            <SelectField
              label="Selecciona un Departamento"
              name="departamentoId"
              value={formData.departamentoId}
              options={departments.map((dept) => ({
                value: dept.id_departamentos,
                label: dept.nombre,
              }))}
              onChange={handleChange}
            />
            <SelectField
              label="Selecciona un Rol"
              name="rol"
              value={formData.rol}
              options={[
                { value: "empleado", label: "Empleado" },
                { value: "jefe", label: "Jefe" },
                { value: "gerente", label: "Gerente" },
              ]}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-3 rounded-lg transition duration-300 w-full"
            >
              Registrarse
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-white hover:underline">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
