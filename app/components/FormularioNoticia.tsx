"use client";

import React from "react";

// Define las interfaces para las props del componente
interface FormularioNoticiaProps {
  formData: {
    titulo: string;
    contenido: string;
    descripcion: string;
    color: string;
    fecha_evento: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void; // Nueva prop para manejar la cancelación
}

export default function FormularioNoticia({
  formData,
  onChange,
  onSubmit,
  onCancel,
}: FormularioNoticiaProps) {
  return (
    // Contenedor del formulario, centrado y con efecto de superposición
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Crear Nueva Noticia
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Campo Título */}
          <div>
            <label
              htmlFor="titulo"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Título:
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Campo Descripción General */}
          <div>
            <label
              htmlFor="descripcion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Descripción General:
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
              required
            ></textarea>
          </div>

          {/* Campo Contenido */}
          <div>
            <label
              htmlFor="contenido"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Contenido Completo:
            </label>
            <textarea
              id="contenido"
              name="contenido"
              value={formData.contenido}
              onChange={onChange}
              rows={5}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
              required
            ></textarea>
          </div>

          {/* Campo Color */}
          <div>
            <label
              htmlFor="color"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Color (Hex):
            </label>
            <input
              type="color" // Usa type="color" para un selector de color nativo
              id="color"
              name="color"
              value={formData.color}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full h-10 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Campo Fecha del Evento */}
          <div>
            <label
              htmlFor="fecha_evento"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Fecha del Evento:
            </label>
            <input
              type="date"
              id="fecha_evento"
              name="fecha_evento"
              value={formData.fecha_evento}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
            >
              Crear Noticia
            </button>
            <button
              type="button" // Importante: type="button" para evitar que envíe el formulario
              onClick={onCancel} // Llama a la función de cancelación
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
