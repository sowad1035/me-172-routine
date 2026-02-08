"use server"

import prisma from "@/lib/prisma";

export default async function Course() {

    const courses = await prisma.course.findMany({
        include: { teacher: true }
    })

    return (
        <div>
            <div className="pb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Course Information</h1>
                <a className="bg-red-800 text-white px-4 py-2 rounded mb-4" href="/courses/add">Add Course Information</a>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Short Code</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Credit Hours</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Term</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Teacher</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td className="border border-gray-300 px-4 py-2">{course.title}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.shortCode}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.creditHours}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.department}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.term}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.teacher.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{course.type}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{course.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}