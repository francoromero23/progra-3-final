import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Define la interfaz para el payload del JWT
interface JwtPayload {
  id_empleado: string;
  id_departamento: string;
  rol: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      // Si no hay token, el usuario no está autenticado
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET no está definido en las variables de entorno.");
      return NextResponse.json({ message: 'Error de configuración del servidor.' }, { status: 500 });
    }

    // Verificar el token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Devolver la información del usuario del token
    return NextResponse.json({
      success: true,
      id_empleado: decoded.id_empleado,
      id_departamento: decoded.id_departamento,
      rol: decoded.rol,
    }, { status: 200 });

  } catch (error) {
    console.error('Error al verificar el token:', error);
    // Si el token es inválido (expirado, modificado, etc.)
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}