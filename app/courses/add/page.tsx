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
        <main className="lg:ml-80 pt-24 min-h-screen">
            <div className="mx-auto px-8 py-20">
                <div className="mb-8">
                    <h1
                        className="font-headline text-5xl md:text-7xl font-black text-on-background tracking-tighter leading-[0.85] uppercase">
                        Add New<br /><span className="text-primary">Course</span>
                    </h1>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
                    < CourseForm teachers={teachers} />
                </div >
            </div >
        </main >
    );
}