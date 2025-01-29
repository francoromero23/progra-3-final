import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const departamentoId = searchParams.get("departamentoId");

    if (!departamentoId) {
      return new Response(
        JSON.stringify({ message: "Falta el ID del departamento" }),
        { status: 400 }
      );
    }

    // Obtener noticias con datos del creador
    const noticias = await prisma.noticia.findMany({
      where: { id_departamentos: Number(departamentoId) },
      include: {
        creador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fecha_evento: "desc", // Ordenar por la fecha del evento, más recientes primero
      },
    });

    // Formatear las noticias con el nombre completo del creador
    const formattedNoticias = noticias.map((noticia) => ({
      id_noticias: noticia.id_noticias,
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      descripcion_general: noticia.descripcion_general,
      fecha_evento: noticia.fecha_evento,
      color: noticia.color,
      creador_nombre: `${noticia.creador.nombre} ${noticia.creador.apellido}`,
    }));

    return new Response(JSON.stringify(formattedNoticias), { status: 200 });
  } catch (error) {
    console.error("Error al obtener las noticias:", error);
    return new Response(
      JSON.stringify({ message: "Error al obtener las noticias" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const {
      id_empleado,
      id_departamento,
      titulo,
      contenido,
      descripcion,
      color,
      fecha_evento, // Recibir la fecha
    } = await req.json();

    // Si no se proporciona una fecha, usa la fecha actual
    const fecha = fecha_evento ? new Date(fecha_evento) : new Date();

    // Validar que el color no sea null o vacío
    if (!color) {
      return new Response(
        JSON.stringify({ success: false, message: "El color es obligatorio" }),
        { status: 400 }
      );
    }

    // Crear nueva noticia
    const nuevaNoticia = await prisma.noticia.create({
      data: {
        id_empleados: Number(id_empleado),
        id_departamentos: Number(id_departamento),
        titulo,
        contenido,
        descripcion_general: descripcion,
        color,
        fecha_evento: fecha, // Guardar la fecha seleccionada
      },
    });

    return new Response(
      JSON.stringify({ success: true, noticia: nuevaNoticia }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear noticia:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error al crear noticia" }),
      { status: 500 }
    );
  }
}
