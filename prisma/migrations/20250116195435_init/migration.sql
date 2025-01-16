-- CreateTable
CREATE TABLE "Departamento" (
    "id_departamentos" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id_empleados" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_departamento" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    CONSTRAINT "Empleado_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamento" ("id_departamentos") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id_noticias" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_empleados" INTEGER NOT NULL,
    "id_departamentos" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "descripcion_general" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    CONSTRAINT "Noticia_id_empleados_fkey" FOREIGN KEY ("id_empleados") REFERENCES "Empleado" ("id_empleados") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Noticia_id_departamentos_fkey" FOREIGN KEY ("id_departamentos") REFERENCES "Departamento" ("id_departamentos") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_email_key" ON "Empleado"("email");
