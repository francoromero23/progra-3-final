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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 to-teal-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Registrarse
        </h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduzca su Nombre
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduzca su Apellido
            </label>
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduzca su Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduzca su Contraseña
            </label>
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduzca su Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              placeholder="Fecha de Nacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un Departamento
            </label>
            <select
              name="departamentoId"
              value={formData.departamentoId}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un Rol
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="empleado">Empleado</option>
              <option value="jefe">Jefe</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
