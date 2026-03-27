"use client";

import { Suspense, useEffect, useState } from "react";
import { departments } from "./lib/helper";
import { fetchSectionsByDept } from "./lib/section-client";
import Form from "next/form";
import { downloadAsStudent, downloadAsTeacher } from "./lib/generator";
import { getAll } from "./lib/teachers-client";
import RegenerateButton from "@/components/Regenerate-Button";
import { useSearchParams } from "next/navigation";

function Content() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachersList = await getAll();
      setTeachers(teachersList);
    };

    fetchTeachers();
  }, []);

  const getSections = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dept = e.target.value;
    if (!dept) {
      setSections([]);
      return;
    }

    setLoading(true);
    try {
      // Call the Server Action instead of Prisma directly
      const codes = await fetchSectionsByDept(dept);
      setSections(codes);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lg:ml-80 pt-24 min-h-screen brutal-grid">
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <header className="relative mb-24 mt-12">
          <div className="relative z-10">
            <span
              className="font-label text-sm font-bold uppercase tracking-[0.4em] text-secondary mb-4 block">System
              Portal / V2.0</span>
            {success == "true" ? (

              <h1
                className="text-7xl md:text-9xl font-black font-headline text-green-700 tracking-tighter leading-[0.85] uppercase">
                Generated<br />
                <span className="generator-text-success">Succcessfully</span>
              </h1>
            ) : (
              <h1
                className="text-7xl md:text-9xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
                Routine<br />
                <span className="generator-text">Generator</span>
              </h1>
            )}
            <p className="max-w-xl mt-8 font-body text-xl text-on-surface-variant leading-relaxed">
              The ultimate scheduling engine for the engineering elite. Precision-mapped routines generated in
              real-time using optimized departmental algorithms.
            </p>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-2 border-primary">
          <section
            className="lg:col-span-5 bg-white p-10 border-r-0 lg:border-r border-b-2 lg:border-b-0 border-primary">
            <div className="flex justify-between items-start mb-12">
              <h2 className="font-headline text-4xl font-black text-primary leading-none uppercase">
                Student<br />Schedule</h2>
              <span className="material-symbols-outlined text-4xl text-secondary">school</span>
            </div>
            <Form action={downloadAsStudent} className="space-y-10">
              <div className="group">
                <label
                  className="block font-label text-xs font-bold uppercase tracking-widest text-primary mb-2">Department</label>
                <select
                  name="department"
                  onChange={getSections}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                  <option value="">{loading ? "Loading..." : "Select Department"}</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="group">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-widest text-primary mb-2">Level
                    / Term</label>
                  <select
                    name="term"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                    <option value="L1_T1">L1 T1</option>
                    <option value="L1_T2">L1 T2</option>
                    <option value="L2_T1">L2 T1</option>
                    <option value="L2_T2">L2 T2</option>
                    <option value="L3_T1">L3 T1</option>
                    <option value="L3_T2">L3 T2</option>
                  </select>
                </div>
                <div className="group">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-widest text-primary mb-2">Section</label>
                  <select
                    name="section"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                    <option value="">Select Section</option>
                    {sections.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="w-full bg-primary text-white py-6 font-label font-bold uppercase tracking-[0.2em] group relative overflow-hidden flex items-center justify-center gap-4 hover:bg-primary-container transition-all">
                <span>Download Full Schedule</span>
                <span className="material-symbols-outlined text-white">download</span>
              </button>
            </Form>
          </section>
          <div className="lg:col-span-7 grid grid-cols-1">
            <section className="bg-surface-container-low p-10 border-b-2 border-primary">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="font-headline text-4xl font-black text-primary leading-none uppercase">
                    Faculty<br />Master-Log</h2>
                  <p className="font-body text-lg text-on-surface-variant mt-2 italic italic">Personalized
                    schedules for academic mentors.</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-secondary">co_present</span>
              </div>
              <Form action={downloadAsTeacher} className="space-y-10">
                <div className="group">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-widest text-primary mb-2">Teachers</label>
                  <select
                    name="teacherId"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                    <option value="">Select</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full bg-primary text-white py-6 font-label font-bold uppercase tracking-[0.2em] group relative overflow-hidden flex items-center justify-center gap-4 hover:bg-primary-container transition-all">
                  <span>Download Full Schedule</span>
                  <span className="material-symbols-outlined text-white">download</span>
                </button>
              </Form>
            </section>
          </div>
        </div>

        <RegenerateButton />

        <footer className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">

          <div className="col-span-1 lg:col-span-12">
            <h2 className="text-4xl mb-10 font-headline font-black text-on-surface/70">ME-172 Section-C2 Group-3</h2>
            <h1
              className="pb-4 text-3xl md:text-5xl font-black font-headline text-secondary tracking-tighter leading-[0.85] uppercase">
              Designed and Developed by
            </h1>
            <h1
              className="pb-4 text-3xl md:text-5xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              <span className="mr-4 generator-text-name">Syed Mohammad</span>
              Sowad
            </h1>
            <h1
              className="pt-8 pb-4 text-2xl md:text-4xl font-black font-headline text-slate-700 tracking-tighter leading-[0.85] uppercase">
              With the support of
            </h1>
            <h1
              className="pb-4 text-2xl md:text-4xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              NIJUM
              <span className="ml-4 generator-text-name"> CHANDRA DEY</span>
            </h1>
            <h1
              className="pb-4 text-2xl md:text-4xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              ASIF
              <span className="ml-4 generator-text-name">IBNE MAHBUB</span>
            </h1>
            <h1
              className="pb-4 text-2xl md:text-4xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              <span className="mr-4 generator-text-name">MD. ROKNUJJAMAN</span>

              SAFEIN
            </h1>

            <h1
              className="pb-4 text-2xl md:text-4xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              <span className="mr-4 generator-text-name">Mahrus</span>
              Arif
            </h1>

            <h1
              className="pb-4 text-2xl md:text-4xl font-black font-headline text-primary tracking-tighter leading-[0.85] uppercase">
              <span className="mr-4 generator-text-name">MD.</span>
              MUHTADI
              <span className="ml-4 generator-text-name">
                JUNAYED
              </span>
            </h1>

          </div>

          <div className="lg:col-span-8">
            <blockquote className="font-body text-4xl lg:text-5xl italic text-on-surface/40 leading-tight">
              "The architecture of time is the <span className="text-primary not-italic font-black">foundation
                of
                progress</span>."
            </blockquote>
          </div>
          <div className="lg:col-span-4 flex flex-col items-end">
            <div className="w-24 h-24 bg-secondary-container mb-4 overflow-hidden relative">
              <img className="w-full h-full object-cover grayscale opacity-50"
                data-alt="architectural detail of a brutalist concrete university building with strong geometric shadows"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl_8REemX9enwLpMy0XykY-rJVf9FnGjDWBOSvNS0LZRSes4P8jpSvoFsduza-TRuufBY0_Rp-rY6VNX8SAJ7DOoxeLZ2CxkH7754Rjg_ziWwwiSPjGPunS1-KHPfgl1qVhWxW9jWP7q6Z9eGx8LJV6vZquEcdMtDUdMXSV934OTCJ6GyxATrZsoX0NrUHZqMIazc-gkRJRd4sVkaJH-M1ZNWUINZP7YbpQsKwIi6QeAQ1ELVq1yYsdwtHqT8UjIR2DM_O2t_MtPTB" />
              <div className="absolute inset-0 bg-primary/20"></div>
            </div>
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.5em] text-stone-400">BUET
              REBEL
              TECH // 2026</span>
          </div>

        </footer>
      </div>
    </main>
  )
}

export default function Home() {

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Content />
    </Suspense>
  );
}