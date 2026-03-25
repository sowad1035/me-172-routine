"use client";

import { useEffect, useState } from "react";
import { departments } from "./lib/helper";
import { useFormState } from "react-dom";
import { fetchSectionsByDept } from "./lib/section-client";
import prisma from "@/lib/prisma";
import { Departments } from "@/generated/prisma/enums";
import Form from "next/form";
import generate, { downloadAsStudent, downloadAsTeacher } from "./lib/generatet";
import { getAll } from "./lib/teachers-client";

export default function Home() {

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            Class Routine Generator
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Generate and download optimized academic timetables for students and teachers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Section Downloads Card */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 border border-slate-600 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60 60 0 0 0-.491 6.347A48.4 48.4 0 0 1 12 20.904a48.4 48.4 0 0 1 8.232-4.41.75.75 0 1 0-.92-1.22A49.373 49.373 0 0 0 12 19.5a49.372 49.372 0 0 0-7.674-3.568.75.75 0 0 0-.919 1.215ZM6.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12-8.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-white">Student Schedule</h2>
            </div>
            <Form action={downloadAsStudent} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department
                </label>
                <select
                  onChange={getSections}
                  name="department"
                  className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="">{loading ? "Loading..." : "Select Department"}</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Section
                </label>
                <select
                  name="section"
                  className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="">Select Section</option>
                  {sections.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Term
                </label>
                <select
                  name="term"
                  className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="">Select Term</option>
                  <option value="L1_T1">L1 T1</option>
                  <option value="L1_T2">L1 T2</option>
                  <option value="L2_T1">L2 T1</option>
                  <option value="L2_T2">L2 T2</option>
                  <option value="L3_T1">L3 T1</option>
                  <option value="L3_T2">L3 T2</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                Download Schedule
              </button>
            </Form>
          </div>

          {/* Teacher Schedule Card */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 border border-slate-600 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-purple-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-white">Teacher Schedule</h2>
            </div>
            <Form action={downloadAsTeacher} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Teacher
                </label>
                <select
                  name="teacherId"
                  className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 active:from-purple-700 active:to-purple-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
              >
                Download Schedule
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
