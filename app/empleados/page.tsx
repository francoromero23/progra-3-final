"use client";

import { useEffect, useState } from "react";

interface Empleado {
  id_empleados: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  email: string;
  rol: string;
  departamento: {
    nombre: string;
  };
}

const ROLES = ["empleado", "gerente", "jefe"];

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await fetch(`/api/empleados`);
        if (!res.ok) throw new Error("Error al cargar los empleados");

        const data: Empleado[] = await res.json();
        setEmpleados(data);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/empleados`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_empleados: id }),
    });

    if (res.ok) {
      setEmpleados((prevEmpleados) =>
        prevEmpleados.filter((empleado) => empleado.id_empleados !== id)
      );
    } else {
      console.error("Error al eliminar el empleado");
    }
    setConfirmDelete(null); // Cerrar el cuadro de confirmación
  };

  const handleEdit = async () => {
    if (!editingEmpleado) return;

    const res = await fetch(`/api/empleados`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingEmpleado),
    });

    if (res.ok) {
      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id_empleados === editingEmpleado.id_empleados
            ? editingEmpleado
            : emp
        )
      );
      setEditingEmpleado(null);
    } else {
      console.error("Error al actualizar empleado");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-6 text-lg text-gray-700">
        Cargando empleados...
      </p>
    );

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-100 to-teal-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Lista de Empleados
      </h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-indigo-200">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Nombre</th>
              <th className="border border-gray-300 px-4 py-2">Apellido</th>
              <th className="border border-gray-300 px-4 py-2">
                Fecha de Nacimiento
              </th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Rol</th>
              <th className="border border-gray-300 px-4 py-2">Departamento</th>
              <th className="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id_empleados}>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.id_empleados}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.nombre}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.apellido}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(empleado.fecha_nacimiento).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.email}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.rol}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {empleado.departamento.nombre}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 font-semibold mr-2"
                    onClick={() => setEditingEmpleado(empleado)}
                  >
                    Editar
                  </button>

                  <button
                    className="text-red-500 hover:text-red-700 font-semibold"
                    onClick={() => setConfirmDelete(empleado.id_empleados)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEmpleado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Editar Empleado
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                value={editingEmpleado.nombre}
                onChange={(e) =>
                  setEditingEmpleado({
                    ...editingEmpleado,
                    nombre: e.target.value,
                  })
                }
                placeholder="Nombre"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                value={editingEmpleado.apellido}
                onChange={(e) =>
                  setEditingEmpleado({
                    ...editingEmpleado,
                    apellido: e.target.value,
                  })
                }
                placeholder="Apellido"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                value={editingEmpleado.fecha_nacimiento}
                onChange={(e) =>
                  setEditingEmpleado({
                    ...editingEmpleado,
                    fecha_nacimiento: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                value={editingEmpleado.email}
                onChange={(e) =>
                  setEditingEmpleado({
                    ...editingEmpleado,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Rol
              </label>
              <select
                className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                value={editingEmpleado.rol}
                onChange={(e) =>
                  setEditingEmpleado({
                    ...editingEmpleado,
                    rol: e.target.value,
                  })
                }
              >
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                onClick={handleEdit}
              >
                Guardar
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                onClick={() => setEditingEmpleado(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar a este empleado? Esto también
              eliminará todas las noticias que ha escrito.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="mr-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={() => handleDelete(confirmDelete)}
              >
                Sí, eliminar
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
