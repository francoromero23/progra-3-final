"use client";

import { ChangeEvent } from "react";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: { value: string | number; label: string }[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
