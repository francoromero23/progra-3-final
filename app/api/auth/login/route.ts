import { PrismaClient, Empleado } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod"; // Importa Zod para la validación
import jwt from "jsonwebtoken"; // Importa jsonwebtoken

const prisma = new PrismaClient();

// **Esquema de validación con Zod**
const loginSchema = z.object({
  email: z.string().email({ message: "Formato de email inválido" }),
  contraseña: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    // **Validación 
    const validatedData = loginSchema.parse(body);
    const { email, contraseña } = validatedData;

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

    // **Generación y envío del JWT como HttpOnly cookie**
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET no está definido en las variables de entorno.");
      return new Response(
        JSON.stringify({ success: false, message: "Error de configuración del servidor." }),
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id_empleado: user.id_empleados,
        id_departamento: user.id_departamento,
        rol: user.rol,
      },
      jwtSecret,
      { expiresIn: "1h" } 
    );

    // Devolver la respuesta con el token
    return new Response(
      JSON.stringify({
        success: true,
        message: "Inicio de sesión exitoso",
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // **Manejo de errores de Zod y otros errores**
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, message: error.issues[0].message }),
        { status: 400 } // Bad Request para errores de validación de entrada
      );
    }
    console.error("Error en la API de login:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error interno del servidor" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Asegura la desconexión de Prisma
  }
}