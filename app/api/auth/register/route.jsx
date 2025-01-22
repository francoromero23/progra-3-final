import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Parsear la solicitud JSON
    const {
      nombre,
      apellido,
      email,
      contraseña,
      fechaNacimiento,
      departamentoId,
      rol,
    } = await req.json();

    // Verificar si el usuario ya existe
    const existingUser = await prisma.empleado.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: "El usuario ya existe" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener la IP del cliente
    const ip = req.headers.get("x-forwarded-for") || req.socket.remoteAddress;

    // Validar y formatear la fecha de nacimiento
    const fechaValida = new Date(fechaNacimiento);
    if (isNaN(fechaValida)) {
      return new Response(
        JSON.stringify({ message: "Fecha de nacimiento no válida" }),
        { status: 400 }
      );
    }
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el nuevo empleado en la base de datos
    await prisma.empleado.create({
      data: {
        nombre,
        apellido,
        email,
        contraseña: hashedPassword,
        fecha_nacimiento: fechaValida,
        id_departamento: Number(departamentoId),
        rol,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuario registrado con éxito",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en el registro:", error);

    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
