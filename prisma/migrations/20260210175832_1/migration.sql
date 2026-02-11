/*
  Warnings:

  - Added the required column `nickname` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "maxLoad" INTEGER NOT NULL
);
INSERT INTO "new_Teacher" ("id", "maxLoad", "name", "rank", "seniority") SELECT "id", "maxLoad", "name", "rank", "seniority" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
