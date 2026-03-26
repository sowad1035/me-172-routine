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
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-blue-600 dark:to-blue-700 bg-clip-text text-transparent mb-2">Add Course</h1>
                    <p className="text-slate-400 dark:text-slate-600">Create a new academic course</p>
                </div >

                <div className="backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
                    < CourseForm teachers={teachers} />
                </div >
            </div >
        </div >
    );
}