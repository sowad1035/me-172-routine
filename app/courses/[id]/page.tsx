import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { remove } from "@/app/lib/course";
import Form from "next/form";
import SubmitButton from "@/app/lib/SubmitButton";

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function Sections({ params }: PageProps) {

    const { id } = await params

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            offeredTo: {
                select: {
                    department: true,
                    term: true,
                    offeredToTeachers: {
                        select: {
                            teacher: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!course) {
        notFound()
    }

    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">View Course Information</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2">Title</label>
                        <input type="text" className="w-full border rounded p-2" value={course.title} readOnly />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <div className="w-1/2">
                            <label className="block mb-2">Short Code</label>
                            <input type="text" className="w-full border rounded p-2" value={course.shortCode} readOnly />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-2">Credit Hours</label>
                            <input type="number" step="0.25" className="w-full border rounded p-2" value={course.creditHours} readOnly />
                        </div>
                    </div>
                    <div className="space-y-4 bg-red-50 p-4 rounded">
                        {course.offeredTo.map((_, i) => (
                            <div key={i} className="space-y-4 bg-red-100 p-4 rounded">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label className="block mb-2">Department:</label>
                                        <select disabled className="w-full border rounded p-2">
                                            <option>{_.department}</option>
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-2">Term:</label>
                                        <select disabled className="w-full border rounded p-2">
                                            <option>{_.term}</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    {_.offeredToTeachers.map((__, j) => (
                                        <div key={i + "t" + j} className="mb-4">
                                            <label className="block mb-2">Teacher {j + 1}:</label>
                                            <select disabled className="w-full border rounded p-2">
                                                <option>{__.teacher.name}</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <div className="w-1/2">
                            <label className="block mb-2">Duration:</label>
                            <input readOnly type="number" className="w-full border rounded p-2" value={course.duration} />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-2">Type:</label>
                            <select disabled name="type" className="w-full border rounded p-2">
                                <option >{course.type}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <a href="/courses" className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="ml-2">Go back</span>
                        </a>
                        <Form action={remove}>
                            <input readOnly value={course.id} name="id" hidden />
                            <SubmitButton text="Delete" />
                        </Form>
                    </div>
                </div>
            </div >
        </div >
    );
}