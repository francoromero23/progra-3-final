"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Empleado {
  id_empleados: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  email: string;
  rol: string;
  departamento: {
    nombre: string; // CORRECCIÓN: Asegurarse de que coincida con el mapeo de la API
  };
}

const ROLES = ["empleado", "gerente", "jefe"];

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null); // Estado para el rol del usuario
  const router = useRouter();

  useEffect(() => {
    const verifySessionAndFetchEmpleados = async () => {
      try {
        // 1. Verificar la sesión del usuario
        const verifyRes = await fetch("/api/auth/verify-token");
        if (!verifyRes.ok) {
          alert(
            "No tienes una sesión activa o ha expirado. Por favor, inicia sesión de nuevo."
          );
          router.push("/"); // Redirigir al login si no está autenticado
          return;
        }
        const verifyData = await verifyRes.json();
        const authenticatedRol = verifyData.rol?.toLowerCase();
        setUserRol(authenticatedRol); 

        // 2. Autorizar: Solo jefes pueden ver esta página
        if (authenticatedRol !== "jefe") {
          alert("No tienes permisos para ver esta página.");
          router.push("/noticias"); // Redirigir a noticias si no es jefe
          return;
        }

        // 3. Si es jefe, cargar los empleados
        const res = await fetch(`/api/empleados`);
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage =
            errorData.message || "Error desconocido al cargar los empleados.";
          alert(`Error al cargar empleados: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        const data: Empleado[] = await res.json();
        setEmpleados(data);
      } catch (error) {
        console.error(
          "Error en la carga de empleados o verificación de sesión:",
          error
        );
        // Si el error ya mostró un alert, no es necesario otro aquí
      } finally {
        setLoading(false);
      }
    };

    verifySessionAndFetchEmpleados();
  }, [router]); // Dependencia del router

  const handleDelete = async (id: number) => {
    // Comprobación de rol adicional en el cliente (aunque la API también lo hace)
    if (userRol !== "jefe") {
      alert("No tienes permisos para eliminar empleados.");
      return;
    }

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
      const errorData = await res.json();
      const errorMessage =
        errorData.message || "Error desconocido al eliminar el empleado.";
      alert(`Error al eliminar el empleado: ${errorMessage}`);
      console.error("Error al eliminar el empleado:", errorData);
    }
    setConfirmDelete(null); // Cerrar el cuadro de confirmación
  };

  const handleEdit = async () => {
    if (!editingEmpleado) return;

    // Comprobación de rol adicional en el cliente
    if (userRol !== "jefe") {
      alert("No tienes permisos para editar empleados.");
      setEditingEmpleado(null); // Cerrar el modal de edición
      return;
    }

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
      const errorData = await res.json();
      const errorMessage =
        errorData.message || "Error desconocido al actualizar empleado.";
      alert(`Error al actualizar empleado: ${errorMessage}`);
      console.error("Error al actualizar empleado:", errorData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Cargando empleados...
        </p>
      </div>
    );
  }

  // Si no es jefe y ya terminó de cargar, redirigir
  if (userRol !== "jefe") {
    // Esto ya debería manejarse en el useEffect con el alert y router.push
    // Pero como fallback, podemos mostrar un mensaje o un spinner si la redirección tarda.
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
      className="p-4 bg-cover bg-center min-h-screen text-black"
      style={{ backgroundImage: "url('/fondonoticias.jpg')" }}
    >
      <h1 className="text-5xl font-bold text-center mb-10">
        Lista de Empleados
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-violet-300 shadow-lg rounded-2xl text-black">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Apellido</th>
              <th className="px-4 py-3">Nacimiento</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr
                key={empleado.id_empleados}
                className="border-b border-gray-300 last:border-b-0"
              >
                <td className="px-4 py-2 text-center">
                  {empleado.id_empleados}
                </td>
                <td className="px-4 py-2 text-center">{empleado.nombre}</td>
                <td className="px-4 py-2 text-center">{empleado.apellido}</td>
                <td className="px-4 py-2 text-center">
                  {new Date(empleado.fecha_nacimiento).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">{empleado.email}</td>
                <td className="px-4 py-2 text-center">{empleado.rol}</td>
                <td className="px-4 py-2 text-center">
                  {empleado.departamento.nombre}
                </td>
                <td className="px-4 py-2">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
                value={editingEmpleado.fecha_nacimiento.split("T")[0]} // Formato YYYY-MM-DD para input type="date"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
