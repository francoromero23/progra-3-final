"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FormularioNoticia from "../components/FormularioNoticia"; // Asegúrate de que esta ruta sea correcta

interface Noticia {
  id_noticias: number;
  titulo: string;
  contenido: string;
  descripcion_general: string;
  fecha_evento: string;
  color: string;
  creador_nombre?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const fetchNoticias = useCallback(
    async (departamentoId: string) => {
      try {
        const res = await fetch(
          `/api/noticias?departamentoId=${departamentoId}`
        );
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage =
            errorData.message || "Error desconocido al cargar noticias.";

          if (res.status === 401 || res.status === 403) {
            alert(
              `Error de autenticación/autorización: ${errorMessage}. Por favor, inicia sesión de nuevo.`
            );
            router.push("/");
            return;
          }
          alert(`Error al cargar noticias: ${errorMessage}`);
          throw new Error(errorMessage);
        }
        const data: Noticia[] = await res.json();
        setNoticias(data);
      } catch (error) {
        console.error("Error al cargar noticias:", error);
      }
    },
    [router]
  );

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/verify-token");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setRol(data.rol);
          setIdDepartamento(data.id_departamento);
          setIdEmpleado(data.id_empleado);
          fetchNoticias(data.id_departamento);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router, fetchNoticias]);

  const handleAddNoticia = () => {
    const currentRol = rol?.toLowerCase();
    if (currentRol !== "jefe" && currentRol !== "gerente") {
      alert("No tienes los permisos necesarios para crear noticias.");
      return;
    }
    setShowForm(true);
    setFormData({
      titulo: "",
      contenido: "",
      descripcion: "",
      color: "",
      fecha_evento: "",
    });
  };

  const handleCancelAddNoticia = () => {
    setShowForm(false);
    setFormData({
      titulo: "",
      contenido: "",
      descripcion: "",
      color: "",
      fecha_evento: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!idEmpleado || !idDepartamento) {
      alert(
        "No se encontró la información del empleado o departamento. Por favor, recarga la página."
      );
      return;
    }

    try {
      const newNoticia = {
        ...formData,
      };
      const res = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNoticia),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage =
          errorData.message || "Error desconocido al crear la noticia.";

        if (res.status === 401 || res.status === 403) {
          alert(
            `No autorizado para crear noticias o sesión expirada: ${errorMessage}. Por favor, inicia sesión de nuevo.`
          );
          router.push("/");
          return;
        }
        alert(`Hubo un error al crear la noticia: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      setShowForm(false);
      if (idDepartamento) {
        fetchNoticias(idDepartamento);
      }
    } catch (error: unknown) {
      console.error("Error al crear noticia:", error);
    }
  };

  const handleSelectNoticia = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
  };

  const handleCloseDetails = () => {
    setSelectedNoticia(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
      } else {
        alert("Error al cerrar sesión. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Ocurrió un error de red al intentar cerrar sesión.");
    }
  };

  const navigateToEmpleados = () => {
    router.push("/empleados");
  };

  const navigateToGraficas = () => {
    router.push("/graficas");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Cargando noticias...
        </p>
      </div>
    );
  }

  if (!idDepartamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        <p className="text-xl font-semibold">
          Acceso denegado. Redirigiendo...
        </p>
      </div>
    );
  }

  // Convertir el rol a minúsculas para comparaciones consistentes en el renderizado
  const displayRol = rol?.toLowerCase();

  return (
    <div
      className="p-4 bg-cover bg-center min-h-screen text-black"
      style={{ backgroundImage: "url('/fondonoticias.jpg')" }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {displayRol === "jefe" && (
            <button
              onClick={navigateToEmpleados}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-900 transition text-lg"
            >
              Ver Empleados
            </button>
          )}
          {displayRol === "jefe" && (
            <button
              onClick={navigateToGraficas}
              className="bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-800 transition text-lg"
            >
              Gráficas
            </button>
          )}
        </div>

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
                    <Image
                      src="/perfil.png"
                      alt="Perfil"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Perfil
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 hover:bg-gray-200 text-left"
                  >
                    <Image
                      src="/logout.png"
                      alt="Logout"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Logout
                  </button>
                </li>
                {/* CORRECCIÓN: El botón "Mis Noticias" solo se muestra para jefe y gerente */}
                {(displayRol === "jefe" || displayRol === "gerente") && (
                  <li>
                    <button
                      onClick={() => router.push("/mis-noticias")}
                      className="flex items-center w-full p-2 hover:bg-gray-200 text-left"
                    >
                      <Image
                        src="/misnoticias.png"
                        alt="Mis Noticias"
                        width={28}
                        height={20}
                        className="mr-2"
                      />
                      Mis Noticias
                    </button>
                  </li>
                )}
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
          onCancel={handleCancelAddNoticia}
        />
      )}
    </div>
  );
}
