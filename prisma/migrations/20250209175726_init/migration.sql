-- CreateTable
CREATE TABLE "Empleado" (
    "id_empleados" SERIAL NOT NULL,
    "id_departamento" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id_empleados")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id_noticias" SERIAL NOT NULL,
    "id_empleados" INTEGER NOT NULL,
    "id_departamentos" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "descripcion_general" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id_noticias")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id_departamentos" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id_departamentos")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_email_key" ON "Empleado"("email");

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamento"("id_departamentos") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_id_empleados_fkey" FOREIGN KEY ("id_empleados") REFERENCES "Empleado"("id_empleados") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_id_departamentos_fkey" FOREIGN KEY ("id_departamentos") REFERENCES "Departamento"("id_departamentos") ON DELETE RESTRICT ON UPDATE CASCADE;
