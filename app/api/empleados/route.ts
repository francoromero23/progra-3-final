import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(): Promise<Response> {
  try {
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
    }));

    // Retornar la respuesta con los datos de los empleados
    return new Response(JSON.stringify(empleadosFormatted), { status: 200 });
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return new Response(
      JSON.stringify({ message: "Error al obtener empleados" }),
      { status: 500 }
    );
  }
}

interface DeleteRequestBody {
  id_empleados: number;
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { id_empleados }: DeleteRequestBody = await req.json();
    await prisma.empleado.delete({
      where: { id_empleados: id_empleados },
    });
    return new Response(
      JSON.stringify({ message: "Empleado eliminado correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return new Response(
      JSON.stringify({ message: "Error al eliminar empleado" }),
      { status: 500 }
    );
  }
}

interface PutRequestBody {
  id_empleados: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const { id_empleados, nombre, apellido, email, rol }: PutRequestBody =
      await req.json();

    const empleadoActualizado = await prisma.empleado.update({
      where: { id_empleados },
      data: { nombre, apellido, email, rol },
    });

    return new Response(JSON.stringify(empleadoActualizado), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return new Response(JSON.stringify({ message: "Error al actualizar" }), {
      status: 500,
    });
  }
}
