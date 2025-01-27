import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, contraseña } = await req.json();

    const user = await prisma.empleados.findUnique({
      where: { email },
    });

    if (!user || user.contraseña !== contraseña) {
      return new Response(
        JSON.stringify({ success: false, message: "Credenciales incorrectas" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Inicio de sesión exitoso",
        id_departamento: user.id_departamento,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
