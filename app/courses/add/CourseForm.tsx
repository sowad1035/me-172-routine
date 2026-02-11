"use client"

import { create } from "@/app/lib/course";
import { departments } from "@/app/lib/helper";
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
            <div className="space-y-4">
                <div>
                    <label className="block mb-2">Title</label>
                    <input type="text" name="title" className="w-full border rounded p-2" placeholder="Enter course title" />
                </div>
                <div className="flex items-center justify-between space-x-4">
                    <div className="w-1/2">
                        <label className="block mb-2">Short Code</label>
                        <input type="text" name="short_code" className="w-full border rounded p-2" placeholder="Enter course short code" />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-2">Credit Hours</label>
                        <input type="number" step="0.25" name="credit_hours" className="w-full border rounded p-2" placeholder="Enter credit hours" />
                    </div>
                </div>
                <div className="space-y-4 bg-red-50 p-4 rounded">
                    {[...Array(departmentCount)].map((_, i) => (
                        <div key={i} className="space-y-4 bg-red-100 p-4 rounded">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="w-1/2">
                                    <label className="block mb-2">Offered To:</label>
                                    <select name={`department_${i + 1}`} className="w-full border rounded p-2">
                                        <option value="">Select department</option>
                                        {departments.map((department) => (
                                            <option key={department} value={department}>{department}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block mb-2">Term:</label>
                                    <select name={`term_${i + 1}`} className="w-full border rounded p-2">
                                        <option value="">Select term</option>
                                        <option value="L1_T1">L1_T1</option>
                                        <option value="L1_T2">L1_T2</option>
                                        <option value="L2_T1">L2_T1</option>
                                        <option value="L2_T2">L2_T2</option>
                                        <option value="L3_T1">L3_T1</option>
                                        <option value="L3_T2">L3_T2</option>
                                        <option value="L4_T1">L4_T1</option>
                                        <option value="L4_T2">L4_T2</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                {Array.from({ length: teacherCount[i] }).map((_, j) => (
                                    <div key={i + "t" + j} className="mb-4">
                                        <label className="block mb-2">Teacher {j + 1}:</label>
                                        <select name={`teacher_${j + 1}_department_${i + 1}`} className="w-full border rounded p-2">
                                            <option value="">Select teacher</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <button onClick={() => addNewTeacher(i)} className="flex items-center bg-green-300 px-2 py-1 rounded mt-4 hover:bg-green-200 hover:cursor-pointer" type="button">
                                    <span className="mr-2">Add Another Teacher</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </button>
                                {teacherCount[i] > 1 && (
                                    <button onClick={() => removeTeacher(i)} className="flex items-center bg-red-800 text-white px-2 py-1 rounded mt-4 hover:bg-red-700 hover:cursor-pointer" type="button">
                                        <span className="mr-2">Remove Teacher</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>

                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between space-x-4 text-sm">
                        <button onClick={addNewDepartment} className="flex items-center bg-green-300 px-2 py-1 rounded mt-4 hover:bg-green-200 hover:cursor-pointer" type="button">
                            <span className="mr-2">Add Another Department</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </button>
                        {departmentCount > 1 && (
                            <button onClick={removeDepartment} className="flex items-center bg-red-800 text-white px-2 py-1 rounded mt-4 hover:bg-red-700 hover:cursor-pointer" type="button">
                                <span className="mr-2">Remove Department</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between space-x-4">
                    <div className="w-1/2">
                        <label className="block mb-2">Duration:</label>
                        <input type="number" name="duration" className="w-full border rounded p-2" placeholder="Enter duration in hours" />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-2">Type:</label>
                        <select name="type" className="w-full border rounded p-2">
                            <option value="">Select type</option>
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                            <option value="ComputerLab">Computer Lab</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                    <a href="/courses" className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="ml-2">Cancel</span>
                    </a>
                    <button className="flex items-cetner bg-red-800 text-white px-4 py-2 rounded hover:cursor-pointer" type="submit">
                        <span className="mr-2">Add Information</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </Form>
    )
}