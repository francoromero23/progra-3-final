import { PrismaClient, Departamento } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(): Promise<Response> {
  try {
    // Obtener todos los departamentos desde la base de datos
    const departamentos: Departamento[] = await prisma.departamento.findMany();
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

