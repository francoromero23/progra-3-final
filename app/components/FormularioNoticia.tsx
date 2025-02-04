"use client";

import InputField from "./InputField";
import { ChangeEvent } from "react";

interface FormData {
  titulo: string;
  contenido: string;
  descripcion: string;
  color: string;
  fecha_evento: string;
}

interface FormularioNoticiaProps {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormularioNoticia({
  formData,
  onChange,
  onSubmit,
}: FormularioNoticiaProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md mx-auto max-w-4xl"
    >
      <InputField
        label="Título"
        name="titulo"
        type="text"
        value={formData.titulo}
        onChange={onChange}
      />
      <div className="mb-4">
        <label
          htmlFor="contenido"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Contenido
        </label>
        <textarea
          name="contenido"
          id="contenido"
          placeholder="Contenido"
          value={formData.contenido}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="descripcion"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Descripción General
        </label>
        <textarea
          name="descripcion"
          id="descripcion"
          placeholder="Descripción General"
          value={formData.descripcion}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <InputField
        label="Fecha del Evento"
        name="fecha_evento"
        type="date"
        value={formData.fecha_evento}
        onChange={onChange}
      />

      <InputField
        label="Color"
        name="color"
        type="color"
        value={formData.color}
        onChange={onChange}
      />

      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          Crear Noticia
        </button>
      </div>
    </form>
  );
}
