import { PrismaClient, Prisma } from "@prisma/client";
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
    console.error('Error al verificar el token en authenticateRequest:', error);
    throw new Error('Token inválido o expirado');
  }
}

// --- GET Request ---
export async function GET(req: Request): Promise<Response> {
  try {
    // Autenticar la solicitud para obtener los datos del usuario logueado
    const authPayload = await authenticateRequest();
    const authenticatedEmpleadoId = authPayload.id_empleado;
    const authenticatedDepartamentoId = authPayload.id_departamento;
    const authenticatedRol = authPayload.rol.toLowerCase(); // Convertir a minúsculas para comparación

    // Validar que el ID de departamento del token sea un número válido
    const authenticatedDepartamentoIdNum = Number(authenticatedDepartamentoId);
    if (isNaN(authenticatedDepartamentoIdNum)) {
        console.error(`ERROR: ID de departamento inválido en el token para empleado ${authenticatedEmpleadoId}: ${authenticatedDepartamentoId}`);
        return NextResponse.json({ message: "ID de departamento de usuario inválido en el token." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const queryDepartamentoId = searchParams.get("departamentoId");
    const queryEmpleadoId = searchParams.get("empleadoId");

    const whereClause: Prisma.NoticiaWhereInput = {};

    console.log(`--- Debugging GET /api/noticias ---`);
    console.log(`Authenticated Employee ID: ${authenticatedEmpleadoId}`);
    console.log(`Authenticated Department ID (from token): ${authenticatedDepartamentoIdNum}`);
    console.log(`Authenticated Role: ${authenticatedRol}`);
    console.log(`Query Parameter - departamentoId: ${queryDepartamentoId}`);
    console.log(`Query Parameter - empleadoId: ${queryEmpleadoId}`);


    if (queryEmpleadoId) {
      // Si se solicita filtrar por empleadoId (usado por "Mis Noticias")
      // Validar que el ID de empleado en la consulta sea un número válido
      const queryEmpleadoIdNum = Number(queryEmpleadoId);
      if (isNaN(queryEmpleadoIdNum)) {
          return NextResponse.json({ message: "ID de empleado en la consulta inválido." }, { status: 400 });
      }

      // Comprobar autorización: solo el propio empleado o un jefe/gerente puede ver las noticias de un empleado específico
      if (queryEmpleadoId !== authenticatedEmpleadoId && authenticatedRol !== "jefe" && authenticatedRol !== "gerente") {
        console.log(`Authorization DENIED: User ${authenticatedEmpleadoId} (Role: ${authenticatedRol}) tried to view news of employee ${queryEmpleadoId}`);
        return NextResponse.json(
          { message: "No tienes permisos para ver las noticias de este empleado." },
          { status: 403 } // Forbidden
        );
      }
      whereClause.id_empleados = queryEmpleadoIdNum;
    } else if (queryDepartamentoId) {
      // Si se solicita filtrar por departamentoId (usado por la página principal de noticias)
      // Validar que el ID de departamento en la consulta sea un número válido
      const queryDepartamentoIdNum = Number(queryDepartamentoId);
      if (isNaN(queryDepartamentoIdNum)) {
          return NextResponse.json({ message: "ID de departamento en la consulta inválido." }, { status: 400 });
      }

      console.log(`Comparing requested department (${queryDepartamentoIdNum}) with authenticated department (${authenticatedDepartamentoIdNum})`);

      // Lógica de autorización para ver noticias de un departamento:
      // Si el departamento solicitado NO es el del usuario autenticado
      if (queryDepartamentoIdNum !== authenticatedDepartamentoIdNum) {
        // Solo jefe/gerente pueden ver noticias de otros departamentos
        if (authenticatedRol !== "jefe" && authenticatedRol !== "gerente") {
          console.log(`Authorization DENIED: User ${authenticatedEmpleadoId} (Role: ${authenticatedRol}) tried to view news of department ${queryDepartamentoIdNum} (not their own)`);
          return NextResponse.json(
            { message: "No tienes permisos para ver las noticias de este departamento." },
            { status: 403 } // Forbidden
          );
        }
      }
      // Si es su propio departamento, o si es jefe/gerente viendo otro departamento, se permite.
      whereClause.id_departamentos = queryDepartamentoIdNum;
    } else {
      // Si no se especifica ni empleadoId ni departamentoId, por defecto se muestran las del departamento del usuario autenticado
      console.log(`No specific query ID, defaulting to authenticated user's department: ${authenticatedDepartamentoIdNum}`);
      whereClause.id_departamentos = authenticatedDepartamentoIdNum;
    }

    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(hoy.getDate() - 7); // Restar 7 días a la fecha actual

    // Añadir el filtro de fechas a la cláusula where
    whereClause.OR = [
      { fecha_evento: { gte: hoy } }, // Futuras
      { fecha_evento: { gte: haceUnaSemana, lt: hoy } }, // Última semana
    ];

    // Obtener noticias con datos del creador y con el rango deseado
    const noticias = await prisma.noticia.findMany({
      where: whereClause, // Usar la cláusula where construida dinámicamente
      include: {
        creador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fecha_evento: "asc", // Ordenar de más cercano a más lejano
      },
    });

    // Formatear las noticias con el nombre completo del creador
    const formattedNoticias = noticias.map((noticia) => ({
      id_noticias: noticia.id_noticias,
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      descripcion_general: noticia.descripcion_general,
      fecha_evento: noticia.fecha_evento.toISOString(), // Convertir Date a string ISO para JSON
      color: noticia.color,
      creador_nombre: `${noticia.creador.nombre} ${noticia.creador.apellido}`,
    }));

    return NextResponse.json(formattedNoticias, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener las noticias:", error);
    let errorMessage = "Error al obtener las noticias.";
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

interface PostRequestBody {
  titulo: string;
  contenido: string;
  descripcion: string;
  color: string;
  fecha_evento?: string; 
}

// --- POST Request ---
export async function POST(req: Request): Promise<Response> {
  try {
    // Autenticar y obtener los datos del usuario del token
    const authPayload = await authenticateRequest();
    const id_empleado = authPayload.id_empleado;
    const id_departamento = authPayload.id_departamento;
    const rol = authPayload.rol.toLowerCase(); // Convertir el rol a minúsculas para comparación

    // Autorización basada en el rol
    if (rol !== "jefe" && rol !== "gerente") {
      return NextResponse.json({ success: false, message: "No tienes permisos para crear noticias" }, { status: 403 }); // Forbidden
    }

    const {
      titulo,
      contenido,
      descripcion,
      color,
      fecha_evento, 
    }: PostRequestBody = await req.json();

    // Si no se proporciona una fecha, usa la fecha actual
    const fecha = fecha_evento ? new Date(fecha_evento) : new Date();

    // Validar que el color no sea null o vacío
    if (!color) {
      return NextResponse.json(
        { success: false, message: "El color es obligatorio" },
        { status: 400 }
      );
    }

    // Crear nueva noticia
    const nuevaNoticia = await prisma.noticia.create({
      data: {
        id_empleados: Number(id_empleado), // Usar id_empleado del token
        id_departamentos: Number(id_departamento), // Usar id_departamento del token
        titulo,
        contenido,
        descripcion_general: descripcion,
        color,
        fecha_evento: fecha, // Guardar la fecha seleccionada
      },
    });

    return NextResponse.json(
      { success: true, noticia: nuevaNoticia },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error al crear noticia:", error);
    let errorMessage = "Error al crear noticia.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (errorMessage === 'No autenticado' || errorMessage === 'Token inválido o expirado') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === 'No tienes permisos para crear noticias') {
        return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
