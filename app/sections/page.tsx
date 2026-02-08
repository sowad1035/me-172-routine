import prisma from "@/lib/prisma";

export default async function Sections() {

    const sections = await prisma.section.findMany({
        orderBy: { department: 'asc' },
        include: { homeClassroom: true }
    });

    return (
        <div>
            <div className="pb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Section Information</h1>
                <a className="bg-red-800 text-white px-4 py-2 rounded mb-4" href="/sections/add">Add Section Information</a>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Home Classroom</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Number of Students</th>
                    </tr>
                </thead>
                <tbody>
                    {sections.map((section) => (
                        <tr key={section.id}>
                            <td className="border border-gray-300 px-4 py-2">{section.code}</td>
                            <td className="border border-gray-300 px-4 py-2">{section.department}</td>
                            <td className="border border-gray-300 px-4 py-2">{section.homeClassroom.name}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{section.numberOfStudents}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}