import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email, contraseña } = await req.json();

  const user = await prisma.empleado.findUnique({
    where: { email },
    select: {
      id_empleados: true,
      email: true,
      rol: true, 
      id_departamento: true, 
      contraseña: true, 
    },
  });
  if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
    return new Response(JSON.stringify({ message: "Credenciales inválidas" }), {
      status: 401,
    });
  }
    // Elimina la contraseña del objeto antes de enviarlo al frontend
  const { contraseña: _, ...userWithoutPassword } = user;
  return new Response(
    JSON.stringify({
      success: true,
      message: "Inicio de sesión exitoso",
      user: userWithoutPassword,
    }),
    { status: 200 }
  );
}
