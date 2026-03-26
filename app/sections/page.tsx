import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Sections() {

    const sections = await prisma.section.findMany({
        orderBy: { department: 'asc' },
        include: { homeClassroom: true }
    });

    return (
        <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-blue-600 dark:to-blue-700 bg-clip-text text-transparent mb-2">Sections</h1>
                    <p className="text-slate-400 dark:text-slate-600">Manage student sections and groups</p>
                </div>
                <a className="w-full sm:w-auto group relative px-6 py-3 rounded-lg font-semibold overflow-hidden" href="/sections/add">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-blue-600 dark:to-blue-700 opacity-80 rounded-lg blur-lg group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400/40 to-yellow-500/40 dark:from-blue-600/40 dark:to-blue-700/40 backdrop-blur-xl rounded-lg border border-yellow-300/50 dark:border-blue-400/50 px-6 py-3 text-blue-950 dark:text-white group-hover:scale-105 transition-transform">
                        + Add Section
                    </div>
                </a>
            </div>

            <div className="overflow-x-auto">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-yellow-400/10 dark:from-blue-600/10 to-yellow-500/10 dark:to-blue-700/10 border-b border-white/10 dark:border-white/5">
                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-300 dark:text-blue-400">Code</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-300 dark:text-blue-400">Department</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-300 dark:text-blue-400">Home Classroom</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-yellow-300 dark:text-blue-400">Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((section, idx) => (
                                <tr key={section.id} className={`border-b border-white/5 dark:border-white/5 hover:bg-white/5 dark:hover:bg-white/10 transition-colors ${idx % 2 === 0 ? 'bg-white/[0.02] dark:bg-white/[0.02]' : ''}`}>
                                    <td className="px-6 py-4 text-slate-200 dark:text-slate-700 font-mono font-semibold">{section.code}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 dark:bg-blue-500/20 text-yellow-300 dark:text-blue-400">
                                            {section.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-200 dark:text-slate-700">{section.homeClassroom.name}</td>
                                    <td className="px-6 py-4 text-right text-slate-200 dark:text-slate-700 font-semibold">{section.numberOfStudents}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}