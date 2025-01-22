// api/departamentos/route.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener todos los departamentos desde la base de datos
    const departamentos = await prisma.departamento.findMany();
    return new Response(JSON.stringify(departamentos), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error al obtener los departamentos" }),
      { status: 500 }
    );
  }
}
