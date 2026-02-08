-- CreateTable
CREATE TABLE "Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "maxTeachingLoadPerWeek" INTEGER NOT NULL
);
