import { departments } from "@/app/lib/helper";
import { create } from "@/app/lib/sections";
import SubmitButton from "@/app/lib/SubmitButton";
import prisma from "@/lib/prisma";
import Form from "next/form";

export const dynamic = 'force-dynamic';

export default async function Sections() {

    const classrooms = await prisma.classroom.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        where: { sections: { none: {} } }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-blue-600 dark:to-blue-700 bg-clip-text text-transparent mb-2">Add Section</h1>
                    <p className="text-slate-400 dark:text-slate-600">Create a new student section</p>
                </div>

                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
                    <Form action={create}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-yellow-300 dark:text-blue-400 mb-2">Section Code</label>
                                <input type="text" name="code" className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-white dark:text-slate-800 placeholder-white/40 dark:placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-blue-400/30 transition-all" placeholder="e.g., CSE-01" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yellow-300 dark:text-blue-400 mb-2">Department</label>
                                <select name="department" className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-white dark:text-slate-800 focus:outline-none focus:border-yellow-400/50 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-blue-400/30 transition-all">
                                    <option value="" className="bg-slate-900 dark:bg-slate-100">Select department</option>
                                    {departments.map((department) => (
                                        <option key={department} value={department} className="bg-slate-900 dark:bg-slate-100">{department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yellow-300 dark:text-blue-400 mb-2">Home Classroom</label>
                                <select name="home_classroom_id" className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-white dark:text-slate-800 focus:outline-none focus:border-yellow-400/50 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-blue-400/30 transition-all">
                                    <option value="" className="bg-slate-900 dark:bg-slate-100">Select home classroom</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id} className="bg-slate-900 dark:bg-slate-100">{classroom.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-yellow-300 dark:text-blue-400 mb-2">Number of Students</label>
                                <input type="number" name="number_of_students" className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-white dark:text-slate-800 placeholder-white/40 dark:placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-yellow-400/30 dark:focus:ring-blue-400/30 transition-all" placeholder="e.g., 60" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-white/10">
                                <a href="/sections" className="flex-1 group relative px-6 py-3 rounded-lg font-semibold overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-400 dark:to-slate-500 opacity-80 rounded-lg blur-lg group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-r from-slate-500/40 to-slate-600/40 dark:from-slate-400/40 dark:to-slate-500/40 backdrop-blur-xl rounded-lg border border-slate-400/50 dark:border-slate-300/50 px-6 py-3 text-white group-hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        Cancel
                                    </div>
                                </a>
                                <SubmitButton />
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
        </div >
    );
}