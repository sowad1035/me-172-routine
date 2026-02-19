import prisma from "@/lib/prisma";
import CourseForm from "./CourseForm";

export const dynamic = 'force-dynamic';

export default async function Sections() {

    const teachers = await prisma.teacher.findMany({
        select: {
            id: true,
            name: true
        }
    })

    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Add Course Information</h1>
                <CourseForm teachers={teachers} />
            </div >
        </div >
    );
}