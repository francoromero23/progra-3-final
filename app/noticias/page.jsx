 "use client";

import { useState, useEffect } from "react";

interface Noticia {
  id_noticias: number;
  titulo: string;
  contenido: string;
  descripcion_general: string;
  fecha_evento: string;
  color: string;
  creador_nombre?: string; // Nombre del creador de la noticia
}

export default function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null); // Noticia seleccionada
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    descripcion: "",
    color: "",
  });
  const [rol, setRol] = useState<string | null>(null);
  const [idDepartamento, setIdDepartamento] = useState<string | null>(null);
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedRol = localStorage.getItem("rol") || null;
    const storedDepartamentoId = localStorage.getItem("departamentoId") || null;
    const storedEmpleadoId = localStorage.getItem("empleadoId") || null;

    setRol(storedRol);
    setIdDepartamento(storedDepartamentoId);
    setIdEmpleado(storedEmpleadoId);

    if (storedDepartamentoId) {
      fetchNoticias(storedDepartamentoId);
    }
  }, []);

  const fetchNoticias = async (departamentoId: string) => {
    try {
      const res = await fetch(/api/noticias?departamentoId=${departamentoId});
      if (!res.ok) throw new Error("Error al cargar noticias");
      const data: Noticia[] = await res.json();
      setNoticias(data);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };

  const handleAddNoticia = () => {
    if (rol !== "jefe" && rol !== "gerente") {
      alert("No tienes los permisos necesarios para realizar noticias.");
      return;
    }
    setShowForm(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!idEmpleado || !idDepartamento) {
        alert(
          "No se encontró el empleado o departamento para crear la noticia."
        );
        return;
      }

      const newNoticia = {
        ...formData,
        id_empleado: idEmpleado,
        id_departamento: idDepartamento,
      };

      const res = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNoticia),
      });

      if (!res.ok) throw new Error("Error al crear la noticia");

      alert("Noticia creada exitosamente.");
      setShowForm(false);
      fetchNoticias(idDepartamento);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      alert("Hubo un error al crear la noticia.");
    }
  };

  const handleSelectNoticia = (noticia: Noticia) => {
    setSelectedNoticia(noticia); // Guardar la noticia seleccionada
  };

  const handleCloseDetails = () => {
    setSelectedNoticia(null); // Cerrar los detalles de la noticia
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Noticias del Departamento
      </h1>

      {/* Detalles de la noticia */}
      {selectedNoticia ? (
        <div
          className="bg-white shadow-lg rounded-2xl p-6 border-t-4 mb-6"
          style={{ borderColor: selectedNoticia.color }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {selectedNoticia.titulo}
          </h2>
          <p className="text-gray-600 mb-4">{selectedNoticia.contenido}</p>
          <p className="text-sm text-gray-500 mb-2">
            Fecha del evento:{" "}
            {new Date(selectedNoticia.fecha_evento).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Creador: {selectedNoticia.creador_nombre || "Desconocido"}
          </p>
          <button
            onClick={handleCloseDetails}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
          >
            Cerrar
          </button>
        </div>
      ) : (
        // Lista de noticias
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.length > 0 ? (
            noticias.map((noticia) => (
              <div
                key={noticia.id_noticias}
                className="bg-white shadow-lg rounded-2xl p-6 border-t-4 cursor-pointer hover:shadow-xl transition"
                style={{ borderColor: noticia.color }}
                onClick={() => handleSelectNoticia(noticia)}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {noticia.titulo}
                </h2>
                <p className="text-gray-600 mb-4">
                  {noticia.descripcion_general}
                </p>
                <p className="text-sm text-gray-500">
                  Fecha: {new Date(noticia.fecha_evento).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No hay noticias disponibles.</p>
          )}
        </div>
      )}

      {rol === "jefe" || rol === "gerente" ? (
        <button
          onClick={handleAddNoticia}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Agregar Noticia
        </button>
      ) : null}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md"
        >
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            className="border p-3 rounded w-full mb-4"
            required
          />
          <textarea
            name="contenido"
            placeholder="Contenido"
            value={formData.contenido}
            onChange={handleChange}
            className="border p-3 rounded w-full mb-4"
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripción General"
            value={formData.descripcion}
            onChange={handleChange}
            className="border p-3 rounded w-full mb-4"
            required
          />
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="border p-3 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Crear Noticia
          </button>
        </form>
      )}
    </div>
  );
}