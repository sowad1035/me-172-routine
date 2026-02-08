/*
  Warnings:

  - A unique constraint covering the columns `[homeClassroomId]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_homeClassroomId_key" ON "Section"("homeClassroomId");
