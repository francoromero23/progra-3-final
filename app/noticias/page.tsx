"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormularioNoticia from "../components/FormularioNoticia";

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
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    descripcion: "",
    color: "",
    fecha_evento: "",
  });
  const [rol, setRol] = useState<string | null>(null);
  const [idDepartamento, setIdDepartamento] = useState<string | null>(null);
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedRol = localStorage.getItem("rol") ?? null;
    const storedDepartamentoId = localStorage.getItem("departamentoId") ?? null;
    const storedEmpleadoId = localStorage.getItem("empleadoId") ?? null;

    setRol(storedRol);
    setIdDepartamento(storedDepartamentoId);
    setIdEmpleado(storedEmpleadoId);

    if (storedDepartamentoId) {
      fetchNoticias(storedDepartamentoId);
    }
  }, []);

  const fetchNoticias = async (departamentoId: string) => {
    try {
      const res = await fetch(`/api/noticias?departamentoId=${departamentoId}`);
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
      setShowForm(false);
      fetchNoticias(idDepartamento);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      alert("Hubo un error al crear la noticia.");
    }
  };

  const handleSelectNoticia = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
  };

  const handleCloseDetails = () => {
    setSelectedNoticia(null); // Cerrar los detalles de la noticia
  };

  const handleLogout = () => {
    // Eliminar la información del usuario del localStorage
    localStorage.removeItem("rol");
    localStorage.removeItem("departamentoId");
    localStorage.removeItem("empleadoId");

    // Redirigir al usuario a la página de inicio (app/page.jsx)
    router.push("/");
  };

  const navigateToEmpleados = () => {
    router.push("/empleados");
  };

  return (
    <div
      className="p-4 bg-cover bg-center min-h-screen text-black"
      style={{ backgroundImage: "url('/fondonoticias.jpg')" }}
    >
      <div className="flex justify-between items-center mb-4">
        {/* Mostrar el botón de Ver Empleados solo si el rol es "jefe" */}
        {rol === "jefe" && (
          <button
            onClick={navigateToEmpleados}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-900 transition text-lg"
          >
            Ver Empleados
          </button>
        )}

        <div className="ml-auto relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-900 transition text-lg"
          >
            ☰
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 text-black">
              <ul className="w-full">
                <li>
                  <button
                    onClick={() => router.push("/perfil")}
                    className="flex items-center w-full p-2 hover:bg-gray-200 text-left"
                  >
                    <img
                      src="/perfil.png"
                      alt="Perfil"
                      className="w-5 h-5 mr-2"
                    />
                    Perfil
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 hover:bg-gray-200 text-left"
                  >
                    <img
                      src="/logout.png"
                      alt="Logout"
                      className="w-5 h-5 mr-2"
                    />
                    Logout
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/mis-noticias")}
                    className="flex items-center w-full p-2 hover:bg-gray-200 text-left"
                  >
                    <img
                      src="/misnoticias.png"
                      alt="Mis Noticias"
                      className="w-7 h-5 mr-2"
                    />
                    Mis Noticias
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-5xl font-bold text-center mb-20">
        Noticias del Departamento
      </h1>

      {selectedNoticia ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-violet-300 p-6 rounded-2xl shadow-lg w-11/12 sm:w-2/3 lg:w-1/2 relative text-black"
            style={{ borderColor: selectedNoticia.color, borderWidth: "6px" }}
          >
            <button
              onClick={handleCloseDetails}
              className="absolute top-1 right-1 text-white bg-red-600 p-1 rounded-full shadow-lg hover:bg-red-700 transition"
            >
              ✖
            </button>
            <h2 className="text-3xl font-semibold mb-4">
              {selectedNoticia.titulo}
            </h2>
            <p className="text-xl mb-4">{selectedNoticia.contenido}</p>
            <p className="text-lg mb-2">
              Fecha del evento:{" "}
              {new Date(selectedNoticia.fecha_evento).toLocaleDateString()}
            </p>
            <p className="text-lg">
              Creador: {selectedNoticia.creador_nombre ?? "Desconocido"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.length > 0 ? (
            noticias.map((noticia) => (
              <button
                key={noticia.id_noticias}
                className="bg-violet-300 shadow-lg rounded-2xl p-6 border-4 cursor-pointer hover:shadow-xl transition text-black"
                style={{ borderColor: noticia.color }}
                onClick={() => handleSelectNoticia(noticia)}
              >
                <h2 className="text-2xl font-semibold mb-2">
                  {noticia.titulo}
                </h2>
                <p className="text-xl mb-4">{noticia.descripcion_general}</p>
                <p className="text-lg">
                  Fecha: {new Date(noticia.fecha_evento).toLocaleDateString()}
                </p>
              </button>
            ))
          ) : (
            <p className="text-xl">No hay noticias disponibles.</p>
          )}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleAddNoticia}
          className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-900 transition text-xl"
        >
          Agregar Noticia
        </button>
      </div>

      {showForm && (
        <FormularioNoticia
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
