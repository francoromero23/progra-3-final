"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Colores para los segmentos del gráfico de torta
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
];

interface ChartData {
  name: string;
  value: number;
}

export default function Graficas() {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchChartData = useCallback(
    async (period: "month" | "week") => {
      setIsLoading(true);
      try {
        const today = new Date();
        let startDate: Date;
        const endDate = today; // La fecha final es hoy

        if (period === "month") {
          startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate()
          );
        } else {
          // 'week'
          startDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 7
          );
        }

        const res = await fetch(
          `/api/graficas?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage =
            errorData.message ||
            `Error desconocido al cargar datos para el gráfico de ${period}.`;

          if (res.status === 401 || res.status === 403) {
            alert(
              `Error de autenticación/autorización para gráficas: ${errorMessage}. Por favor, inicia sesión de nuevo.`
            );
            router.push("/");
            return []; // Retorna un array vacío para evitar errores de renderizado
          }
          alert(
            `Error al cargar datos para el gráfico de ${period}: ${errorMessage}`
          );
          throw new Error(errorMessage);
        }
        const data: ChartData[] = await res.json();
        return data;
      } catch (error) {
        console.error(
          `Error al cargar datos para el gráfico de ${period}:`,
          error
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const loadAllCharts = async () => {
      // Verificar sesión antes de cargar los gráficos
      const verifyRes = await fetch("/api/auth/verify-token");
      if (!verifyRes.ok) {
        alert(
          "No tienes una sesión activa o ha expirado. Por favor, inicia sesión de nuevo."
        );
        router.push("/");
        return;
      }
      const verifyData = await verifyRes.json();
      const userRol = verifyData.rol?.toLowerCase();

      // Solo permitir el acceso a jefes y gerentes
      if (userRol !== "jefe") {
        alert("No tienes permisos para ver las gráficas.");
        router.push("/"); // Redirigir a la página de noticias si no tiene permisos
        return;
      }

      const monthly = await fetchChartData("month");
      setMonthlyData(monthly);

      const weekly = await fetchChartData("week");
      setWeeklyData(weekly);
    };

    loadAllCharts();
  }, [fetchChartData, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Cargando gráficas...
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-cover bg-center min-h-screen text-black flex flex-col items-center"
      style={{ backgroundImage: "url('/fondonoticias.jpg')" }}
    >
      <h1 className="text-5xl font-bold text-center mb-10 text-white drop-shadow-lg">
        Estadísticas de Noticias por Departamento
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Gráfico de Noticias del Último Mes */}
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Noticias Creadas (Último Mes)
          </h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {monthlyData.map(
                    (
                      entry // Removed 'index' from map arguments
                    ) => (
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[monthlyData.indexOf(entry) % COLORS.length]
                        }
                      /> // Using entry.name as key
                    )
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-lg text-gray-600">
              No hay datos de noticias para el último mes.
            </p>
          )}
        </div>

        {/* Gráfico de Noticias de la Última Semana */}
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Noticias Creadas (Última Semana)
          </h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={weeklyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {weeklyData.map(
                    (
                      entry // Removed 'index' from map arguments
                    ) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[weeklyData.indexOf(entry) % COLORS.length]}
                      /> // Using entry.name as key
                    )
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-lg text-gray-600">
              No hay datos de noticias para la última semana.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push("/noticias")}
          className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-900 transition text-xl"
        >
          Volver a Noticias
        </button>
      </div>
    </div>
  );
}
