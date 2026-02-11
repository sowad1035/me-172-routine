import { departments } from "@/app/lib/helper";
import { create } from "@/app/lib/sections";
import SubmitButton from "@/app/lib/SubmitButton";
import prisma from "@/lib/prisma";
import Form from "next/form";

export default async function Sections() {

    const classrooms = await prisma.classroom.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        where: { sections: { none: {} } }
    });

    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Add Section Information</h1>
                <Form action={create}>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2">Code:</label>
                            <input type="text" name="code" className="w-full border rounded p-2" placeholder="Enter section  code" />
                        </div>
                        <div>
                            <label className="block mb-2">Department:</label>
                            <select name="department" className="w-full border rounded p-2">
                                <option value="">Select department</option>
                                {departments.map((department) => (
                                    <option key={department} value={department}>{department}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Home Classroom</label>
                            <select name="home_classroom_id" className="w-full border rounded p-2">
                                <option value="">Select home classroom</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Number of Students</label>
                            <input type="number" name="number_of_students" className="w-full border rounded p-2" placeholder="Enter number of students" />
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <a href="/sections" className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="ml-2">Cancel</span>
                            </a>
                            <SubmitButton />
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}