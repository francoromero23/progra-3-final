/*
  Warnings:

  - You are about to drop the column `fecha_creacion` on the `Noticia` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Noticia" (
    "id_noticias" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_empleados" INTEGER NOT NULL,
    "id_departamentos" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "descripcion_general" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fecha_evento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Noticia_id_empleados_fkey" FOREIGN KEY ("id_empleados") REFERENCES "Empleado" ("id_empleados") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Noticia_id_departamentos_fkey" FOREIGN KEY ("id_departamentos") REFERENCES "Departamento" ("id_departamentos") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Noticia" ("color", "contenido", "descripcion_general", "id_departamentos", "id_empleados", "id_noticias", "titulo") SELECT "color", "contenido", "descripcion_general", "id_departamentos", "id_empleados", "id_noticias", "titulo" FROM "Noticia";
DROP TABLE "Noticia";
ALTER TABLE "new_Noticia" RENAME TO "Noticia";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
