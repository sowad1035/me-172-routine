/*
  Warnings:

  - You are about to drop the column `department` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `Course` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "OfferedTo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    CONSTRAINT "OfferedTo_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfferedToTeacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offeredToId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "OfferedToTeacher_offeredToId_fkey" FOREIGN KEY ("offeredToId") REFERENCES "OfferedTo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OfferedToTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "creditHours" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL
);
INSERT INTO "new_Course" ("creditHours", "duration", "id", "shortCode", "title", "type") SELECT "creditHours", "duration", "id", "shortCode", "title", "type" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
