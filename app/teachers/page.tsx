import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {

  const teachers = await prisma.teacher.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="lg:ml-80 pt-24 min-h-screen">
      <div className="mx-auto px-8 py-20">
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1
              className="my-4 font-headline text-8xl font-black uppercase tracking-tighter text-primary leading-none">
              Teachers
            </h1>
            <Link href="/teachers/add"
              className="bg-primary text-white font-label font-bold uppercase tracking-[0.2em] px-12 py-6 flex items-center gap-4 hover:bg-[#a50034] transition-all transform active:scale-95">
              <span className="material-symbols-outlined" data-icon="add">add</span>
              <span>Add Teacher</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    <th className="border-b-2 p-4 text-left border-outline-variant font-label text-[16px] uppercase tracking-[0.2em] font-bold text-stone-400">Name</th>
                    <th className="border-b-2 border-outline-variant font-label text-[16px] text-left uppercase tracking-[0.2em] font-bold text-stone-400">Seniority</th>
                    <th className="border-b-2 border-outline-variant font-label text-[16px] text-left uppercase tracking-[0.2em] font-bold text-stone-400">Rank</th>
                    <th className="border-b-2 border-outline-variant font-label text-[16px] text-right uppercase tracking-[0.2em] font-bold text-stone-400">Max Hours/Week</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, idx) => (
                    <tr key={teacher.id} className="font-label text-[22px] border-b border-white/20 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{teacher.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-sm font-semibold bg-primary/20 text-primary rounded-full">
                          {teacher.seniority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-secondary/20 text-secondary">
                          {teacher.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-200 dark:text-slate-700 font-semibold">{teacher.maxLoad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}