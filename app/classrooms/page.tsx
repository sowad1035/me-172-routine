import prisma from "@/lib/prisma";

export default async function Classrooms() {

    const classrooms = await prisma.classroom.findMany({ orderBy: { name: 'asc' } });

    return (
        <div>
            <div className="pb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Classroom Information</h1>
                <a className="bg-red-800 text-white px-4 py-2 rounded mb-4" href="/classrooms/add">Add Classroom Information</a>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Code</th>
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-right w-1/4">Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {classrooms.map((classroom) => (
                        <tr key={classroom.id}>
                            <td className="border border-gray-300 px-4 py-2">{classroom.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{classroom.code}</td>
                            <td className="border border-gray-300 px-4 py-2">{classroom.type}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{classroom.capacity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}