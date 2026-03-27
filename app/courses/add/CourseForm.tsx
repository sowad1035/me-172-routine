"use client"

import { create } from "@/app/lib/course";
import { departments } from "@/app/lib/helper";
import SubmitButton from "@/app/lib/SubmitButton";
import Form from "next/form";
import { useState } from "react";

export default function CourseForm({ teachers }: { teachers: { id: string, name: string }[] }) {

    const [teacherCount, setTeacherCount] = useState<number[]>([1]);

    const addNewTeacher = (index: number) => {
        const newTeacherCount = [...teacherCount];
        newTeacherCount[index] = newTeacherCount[index] + 1;
        setTeacherCount(newTeacherCount);
    }

    const removeTeacher = (index: number) => {
        const newTeacherCount = [...teacherCount];
        if (newTeacherCount[index] > 1) {
            newTeacherCount[index] = newTeacherCount[index] - 1;
            setTeacherCount(newTeacherCount);
        }
    }

    const [departmentCount, setDepartmentCount] = useState(1);

    const addNewDepartment = () => {
        setTeacherCount([...teacherCount, 1]);
        setDepartmentCount(departmentCount + 1);
    }

    const removeDepartment = () => {
        if (departmentCount > 1) {
            setDepartmentCount(departmentCount - 1);
            const newTeacherCount = [...teacherCount];
            newTeacherCount.pop();
            setTeacherCount(newTeacherCount);
        }
    }

    return (
        <Form action={create}>
            {teacherCount.map((count, index) => (
                <input key={index} type="hidden" name={`teacher_count_department_${index + 1}`} value={count} />
            ))}
            <input type="hidden" name="department_count" value={departmentCount} />
            <section className="space-y-4">
                <div className="flex items-baseline gap-4 mb-10">
                    <h3 className="font-headline text-3xl uppercase font-black tracking-tight">Course Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                    <div className="relative group col-span-2">
                        <label
                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                            Title</label>
                        <input
                            name="title"
                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-4 text-3xl font-headline tracking-tight focus:ring-0 placeholder:text-stone-300"
                            type="text" />
                    </div>
                    <div className="relative group">
                        <label
                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Short Code</label>
                        <input
                            name="short_code"
                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                            type="text" />
                    </div>
                    <div className="relative group">
                        <label
                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Credit Hours</label>
                        <input
                            name="credit_hours"
                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                            type="number"
                            step="0.25"
                        />
                    </div>
                    <div className="relative group">
                        <label
                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Duration</label>
                        <input
                            name="duration"
                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                            type="text" />
                    </div>
                    <div className="relative group">
                        <label
                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Type</label>
                        <select
                            name="type"
                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                            <option value="">Select type</option>
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                            <option value="ComputerLab">Computer Lab</option>
                        </select>
                    </div>
                    <div className="relative group col-span-2">
                        {[...Array(departmentCount)].map((_, i) => (
                            <div key={i} className="space-y-4 p-4 my-4 rounded border-2 border-primary border-dashed">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Offered To</label>
                                        <select
                                            name={`department_${i + 1}`}
                                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                            <option value="">Select Department</option>
                                            {departments.map((department) => (
                                                <option key={department} value={department}>{department}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Term:</label>
                                        <select
                                            name={`term_${i + 1}`}
                                            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                            <option value="">Select Term</option>
                                            <option value="L1_T1">L1 T1</option>
                                            <option value="L1_T2">L1 T2</option>
                                            <option value="L2_T1">L2 T1</option>
                                            <option value="L2_T2">L2 T2</option>
                                            <option value="L3_T1">L3 T1</option>
                                            <option value="L3_T2">L3 T2</option>
                                            <option value="L4_T1">L4 T1</option>
                                            <option value="L4_T2">L4 T2</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    {Array.from({ length: teacherCount[i] }).map((_, j) => (
                                        <div key={i + "t" + j} className="mb-4">
                                            <label
                                                className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Teacher {j + 1}:</label>
                                            <select
                                                name={`teacher_${j + 1}_department_${i + 1}`}
                                                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                                <option value="">Select teacher</option>
                                                {teachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <button type="button" onClick={() => addNewTeacher(i)} className="border-2 border-dashed border-secondary text-secondary px-4 py-2 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        <span className="font-label text-xs font-bold uppercase tracking-widest">Add Another Teacher</span>
                                    </button>
                                    {teacherCount[i] > 1 && (
                                        <button type="button" onClick={() => removeTeacher(i)} className="border-2 border-dashed border-stone-300 text-stone-400 px-4 py-2 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                            <span className="font-label text-xs font-bold uppercase tracking-widest">Remove Teacher</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between space-x-4 text-sm">
                            <button type="button" onClick={addNewDepartment} className="border-2 border-dashed border-primary text-primary px-4 py-2 flex items-center gap-2 hover:border-secondary hover:text-secondary transition-colors">
                                <span className="material-symbols-outlined text-sm">add</span>
                                <span className="font-label text-xs font-bold uppercase tracking-widest">Add Dept</span>
                            </button>
                            {departmentCount > 1 && (
                                <button type="button" onClick={removeDepartment} className="border-2 border-dashed border-stone-300 text-stone-400 px-4 py-2 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                    <span className="font-label text-xs font-bold uppercase tracking-widest">Remove Dept</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <SubmitButton />
                    </div>
                </div>
            </section>
        </Form>
    )
}