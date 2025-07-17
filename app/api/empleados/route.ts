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

// --- Función de autenticación y autorización (Middleware-like) ---
// Esta función lee el token de la cookie, lo verifica y devuelve el payload.
// Si no hay token o es inválido, lanza un error.
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
    console.error('Error al verificar el token en authenticateRequest (empleados):', error);
    throw new Error('Token inválido o expirado');
  }
}

// --- GET Request ---
export async function GET(): Promise<Response> {
  try {
    // Autenticar y autorizar: Solo jefes pueden ver la lista de empleados
    const authPayload = await authenticateRequest();
    const authenticatedRol = authPayload.rol.toLowerCase();

    if (authenticatedRol !== "jefe") {
      return NextResponse.json(
        { message: "No tienes permisos para ver la lista de empleados." },
        { status: 403 } // Forbidden
      );
    }

    const empleados = await prisma.empleado.findMany({
      include: {
        departamento: {
          select: {
            nombre: true, 
          },
        },
      },
    });

    // Convertir fecha_nacimiento a formato ISO
    const empleadosFormatted = empleados.map((empleado) => ({
      ...empleado,
      fecha_nacimiento: new Date(empleado.fecha_nacimiento).toISOString(),
      // CORRECCIÓN: Asegurarse de que el nombre del departamento se mapee correctamente
      departamento: {
        nombre: empleado.departamento?.nombre || 'Desconocido',
      },
    }));

    return NextResponse.json(empleadosFormatted, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener empleados:", error);
    let errorMessage = "Error al obtener empleados.";
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

interface DeleteRequestBody {
  id_empleados: number;
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    // Autenticar y autorizar: Solo jefes pueden eliminar empleados
    const authPayload = await authenticateRequest();
    const authenticatedRol = authPayload.rol.toLowerCase();

    if (authenticatedRol !== "jefe") {
      return NextResponse.json(
        { message: "No tienes permisos para eliminar empleados." },
        { status: 403 } // Forbidden
      );
    }

    const { id_empleados }: DeleteRequestBody = await req.json();

    // Opcional: Eliminar noticias asociadas antes de eliminar el empleado
    // Esto es necesario si no tienes onDelete: Cascade configurado en tu schema.prisma
    // Si ya tienes onDelete: Cascade en la relación Empleado-Noticia, puedes omitir esto.
    await prisma.noticia.deleteMany({
      where: { id_empleados: id_empleados },
    });

    await prisma.empleado.delete({
      where: { id_empleados: id_empleados },
    });

    return NextResponse.json(
      { message: "Empleado eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al eliminar empleado:", error);
    let errorMessage = "Error al eliminar empleado.";
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

interface PutRequestBody {
  id_empleados: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  // No se incluye contraseña ni id_departamento para simplificar esta PUT,
  // si necesitas actualizarlos, deberías añadirlos aquí y en la lógica.
}

export async function PUT(req: Request): Promise<Response> {
  try {
    // Autenticar y autorizar: Solo jefes pueden actualizar empleados
    const authPayload = await authenticateRequest();
    const authenticatedRol = authPayload.rol.toLowerCase();

    if (authenticatedRol !== "jefe") {
      return NextResponse.json(
        { message: "No tienes permisos para actualizar empleados." },
        { status: 403 } // Forbidden
      );
    }

    const { id_empleados, nombre, apellido, email, rol }: PutRequestBody =
      await req.json();

    const empleadoActualizado = await prisma.empleado.update({
      where: { id_empleados },
      data: { nombre, apellido, email, rol },
    });

    return NextResponse.json(empleadoActualizado, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al actualizar empleado:", error);
    let errorMessage = "Error al actualizar.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    if (errorMessage === 'No autenticado' || errorMessage === 'Token inválido o expirado') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: errorMessage }, {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}