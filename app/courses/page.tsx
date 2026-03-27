import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Course() {

    const courses = await prisma.course.findMany()

    return (
        <main className="lg:ml-80 pt-24 min-h-screen">
            <div className="mx-auto px-8 py-20">
                <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1
                            className="my-4 font-headline text-8xl font-black uppercase tracking-tighter text-primary leading-none">
                            Courses
                        </h1>
                        <Link href="/courses/add"
                            className="mb-4 bg-primary text-white font-label font-bold uppercase tracking-[0.2em] px-12 py-6 flex items-center gap-4 hover:bg-[#a50034] transition-all transform active:scale-95">
                            <span className="material-symbols-outlined" data-icon="add">add</span>
                            <span>Add Course</span>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white/10 border-b border-white/20">
                                        <th className="border-b-2 p-4 text-left border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Title</th>
                                        <th className="border-b-2 p-4 text-left border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Code</th>
                                        <th className="border-b-2 p-4 text-left border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Credits</th>
                                        <th className="border-b-2 p-4 text-left border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Type</th>
                                        <th className="border-b-2 p-4 text-right border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course, idx) => (
                                        <tr key={course.id} className="font-label text-[22px] border-b border-white/20 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-slate-200 dark:text-slate-700 font-medium">
                                                <a href={"/courses/" + course.id} className="hover:text-yellow-300 dark:hover:text-blue-400 transition-colors">
                                                    {course.title}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 dark:text-slate-600 font-mono">{course.shortCode}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 dark:bg-blue-500/20 text-yellow-300 dark:text-blue-400">
                                                    {course.creditHours} hrs
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${course.type === 'Lab' ? 'bg-blue-500/20 text-blue-300 dark:bg-purple-500/20 dark:text-purple-400' :
                                                    'bg-yellow-500/20 text-yellow-300 dark:bg-amber-500/20 dark:text-amber-400'
                                                    }`}>
                                                    {course.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-200 dark:text-slate-700 font-semibold">{course.duration}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}