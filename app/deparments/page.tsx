export default function Departments() {
    return (
        <div>
            <div className="pb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Deparment Information</h1>
                <a className="bg-red-800 text-white px-4 py-2 rounded mb-4" href="/teachers/add">Add Teacher Information</a>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left w-1/4">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-right w-1/4">Seniority</th>
                        <th className="border border-gray-300 px-4 py-2 text-right w-1/4">Rank</th>
                        <th className="border border-gray-300 px-4 py-2 text-right w-1/4">Maximum Hours Per week</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </div>
    );
}
