-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('Lecturer', 'AssistantProfessor', 'AssociateProfessor', 'Professor');

-- CreateEnum
CREATE TYPE "ClassroomType" AS ENUM ('Theory', 'Lab', 'ComputerLab');

-- CreateEnum
CREATE TYPE "Terms" AS ENUM ('L1_T1', 'L1_T2', 'L2_T1', 'L2_T2', 'L3_T1', 'L3_T2', 'L4_T1', 'L4_T2');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('Theory', 'Lab', 'ComputerLab');

-- CreateEnum
CREATE TYPE "Departments" AS ENUM ('CSE', 'EEE', 'ME', 'CE', 'ARCH', 'BME', 'URP', 'NAME', 'MME', 'CHEM', 'IPE', 'NCE', 'WRE');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "seniority" "Seniority" NOT NULL,
    "rank" INTEGER NOT NULL,
    "maxLoad" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" "ClassroomType" NOT NULL DEFAULT 'Theory',

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "department" "Departments" NOT NULL,
    "numberOfStudents" INTEGER NOT NULL,
    "homeClassroomId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "creditHours" DOUBLE PRECISION NOT NULL,
    "type" "CourseType" NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferedTo" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "department" "Departments" NOT NULL,
    "term" "Terms" NOT NULL,

    CONSTRAINT "OfferedTo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferedToTeacher" (
    "id" TEXT NOT NULL,
    "offeredToId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "OfferedToTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_homeClassroomId_key" ON "Section"("homeClassroomId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_homeClassroomId_fkey" FOREIGN KEY ("homeClassroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedTo" ADD CONSTRAINT "OfferedTo_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedToTeacher" ADD CONSTRAINT "OfferedToTeacher_offeredToId_fkey" FOREIGN KEY ("offeredToId") REFERENCES "OfferedTo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedToTeacher" ADD CONSTRAINT "OfferedToTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
