import { PrismaClient, Empleado } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface PostRequestBody {
  email: string;
  contraseña: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { email, contraseña }: PostRequestBody = await req.json();

    // Buscar el usuario en la base de datos con el modelo 'Empleado'
    const user: Empleado | null = await prisma.empleado.findUnique({
      where: { email },
    });

    // Verificar si el usuario existe
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "Credenciales incorrectas" }),
        { status: 401 }
      );
    }

    // Comparar la contraseña encriptada con la contraseña ingresada
    const isPasswordCorrect = await bcrypt.compare(contraseña, user.contraseña);

    if (!isPasswordCorrect) {
      return new Response(
        JSON.stringify({ success: false, message: "Credenciales incorrectas" }),
        { status: 401 }
      );
    }

    // Devolver la respuesta con el id_departamento y el rol si la contraseña es correcta
    return new Response(
      JSON.stringify({
        success: true,
        message: "Inicio de sesión exitoso",
        id_departamento: user.id_departamento,
        id_empleado: user.id_empleados,
        rol: user.rol,
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

