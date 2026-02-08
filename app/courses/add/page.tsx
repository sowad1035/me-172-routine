import { create } from "@/app/lib/course";
import { departments } from "@/app/lib/helper";
import prisma from "@/lib/prisma";
import Form from "next/form";

export default async function Sections() {

    const teachers = await prisma.teacher.findMany({
        select: {
            id: true,
            name: true
        }
    })

    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Add Course Information</h1>
                <Form action={create}>
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
                        <div className="flex items-center justify-between space-x-4">
                            <div className="w-1/2">
                                <label className="block mb-2">Offered To:</label>
                                <select name="department" className="w-full border rounded p-2">
                                    <option value="">Select department</option>
                                    {departments.map((department) => (
                                        <option key={department} value={department}>{department}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label className="block mb-2">Term:</label>
                                <select name="term" className="w-full border rounded p-2">
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
                            <label className="block mb-2">Offered By:</label>
                            <select name="teacher_id" className="w-full border rounded p-2">
                                <option value="">Select teacher</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                ))}
                            </select>
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
            </div >
        </div >
    );
}