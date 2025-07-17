import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Define la interfaz para el payload del JWT
interface JwtPayload {
  id_empleado: string;
  id_departamento: string;
  rol: string;
}
async function authenticateRequest(): Promise<JwtPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('No autenticado');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET no está definido en las variables de entorno.");
    throw new Error('Error de configuración del servidor.');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Error al verificar el token en authenticateRequest:', error);
    throw new Error('Token inválido o expirado');
  }
}

// --- GET Request para Gráficas ---
export async function GET(req: Request): Promise<Response> {
  try {
    // Autenticar la solicitud para obtener los datos del usuario logueado
    const authPayload = await authenticateRequest();
    const authenticatedRol = authPayload.rol.toLowerCase();

    // Solo jefes y gerentes pueden acceder a esta API de gráficas
    if (authenticatedRol !== "jefe" && authenticatedRol !== "gerente") {
      return NextResponse.json(
        { message: "No tienes permisos para ver las gráficas." },
        { status: 403 } // Forbidden
      );
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { message: "Faltan los parámetros startDate y endDate." },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Fechas inválidas proporcionadas." },
        { status: 400 }
      );
    }

    // Obtener la cantidad de noticias por departamento en el rango de fechas
    const noticiasPorDepartamento = await prisma.noticia.groupBy({
      by: ['id_departamentos'],
      _count: {
        id_noticias: true,
      },
      where: {
        fecha_evento: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Obtener los nombres de los departamentos para cada ID
    const departamentoIds = noticiasPorDepartamento.map(item => item.id_departamentos);
    const departamentos = await prisma.departamento.findMany({
      where: {
        id_departamentos: {
          in: departamentoIds,
        },
      },
      select: {
        id_departamentos: true,
        nombre: true,
      },
    });

    // Mapear los resultados para incluir el nombre del departamento
    const chartData = noticiasPorDepartamento.map(item => {
      const departamento = departamentos.find(d => d.id_departamentos === item.id_departamentos);
      return {
        name: departamento ? departamento.nombre : `Departamento ${item.id_departamentos}`,
        value: item._count.id_noticias,
      };
    });

    return NextResponse.json(chartData, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener datos para gráficas:", error);
    let errorMessage = "Error al obtener datos para gráficas.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (errorMessage === 'No autenticado' || errorMessage === 'Token inválido o expirado') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === 'No tienes permisos para ver las gráficas.') {
        return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


