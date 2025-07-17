import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Eliminar la cookie
    cookieStore.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, 
      expires: new Date(0),
    });

    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json({ success: false, message: 'Error al cerrar sesión' }, { status: 500 });
  }
}