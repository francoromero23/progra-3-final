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
    console.error('Error al verificar el token en authenticateRequest (perfil):', error);
    throw new Error('Token inválido o expirado');
  }
}

// --- GET Request para Perfil ---
export async function GET(): Promise<Response> {
  try {
    // Autenticar la solicitud para obtener el id_empleado del token
    const authPayload = await authenticateRequest();
    const idEmpleado = authPayload.id_empleado;

    // Buscar el empleado en la base de datos
    const empleado = await prisma.empleado.findUnique({
      where: {
        id_empleados: Number(idEmpleado),
      },
      select: { // Selecciona solo los campos que necesitas para el perfil
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        departamento: { // Incluye el nombre del departamento si está relacionado
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!empleado) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }

    // Formatear los datos del perfil
    const perfilData = {
      nombre: `${empleado.nombre} ${empleado.apellido}`,
      email: empleado.email,
      rol: empleado.rol,
      departamento: empleado.departamento?.nombre || 'Desconocido',
    };

    return NextResponse.json(perfilData, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener el perfil:", error);
    let errorMessage = "Error al obtener el perfil.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (errorMessage === 'No autenticado' || errorMessage === 'Token inválido o expirado') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}