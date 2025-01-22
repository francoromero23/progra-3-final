"use client";

import { useState, useEffect } from "react";

export default function Register() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contraseña: "",
    fechaNacimiento: "",
    departamentoId: "",
    rol: "empleado", // valor predeterminado
  });

  // Cargar departamentos desde la API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/departamentos");
        if (!res.ok) {
          throw new Error("Error al cargar los departamentos");
        }
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error(error);
        setDepartments([]); // Si hay error, dejar la lista vacía
      }
    };

    fetchDepartments();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Si no es ok, intenta obtener el mensaje de error
        const errorData = await res.json();
        console.error("Error al registrar:", errorData);
        alert(errorData.message || "Ocurrió un error inesperado.");
        return;
      }

      const data = await res.json();
      if (data.success) {
        window.location.href = "/auth/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Registrarse</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            name="contraseña"
            placeholder="Contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="fechaNacimiento"
            placeholder="Fecha de Nacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="" disabled>
              Selecciona un Departamento
            </option>
            {departments.length === 0 ? (
              <option disabled>No hay departamentos disponibles</option>
            ) : (
              departments.map((dept) => (
                <option
                  key={dept.id_departamentos}
                  value={dept.id_departamentos}
                >
                  {dept.nombre}
                </option>
              ))
            )}
          </select>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="empleado">Empleado</option>
            <option value="jefe">Jefe</option>
            <option value="gerente">Gerente</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
