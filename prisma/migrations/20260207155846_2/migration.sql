-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "numberOfStudents" INTEGER NOT NULL,
    "homeClassroomId" TEXT NOT NULL,
    CONSTRAINT "Section_homeClassroomId_fkey" FOREIGN KEY ("homeClassroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
