/*
  Warnings:

  - You are about to drop the column `fullName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `maxTeachingLoadPerWeek` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `seniorityLevel` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `maxLoad` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seniority` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "maxLoad" INTEGER NOT NULL
);
INSERT INTO "new_Teacher" ("id", "rank") SELECT "id", "rank" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
