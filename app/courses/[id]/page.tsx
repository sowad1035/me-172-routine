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
        <main className="lg:ml-80 pt-24 min-h-screen">
            <div className="mx-auto px-8 py-20">
                <div className="mb-8">
                    <h1
                        className="font-headline text-5xl md:text-7xl font-black text-on-background tracking-tighter leading-[0.85] uppercase">
                        View<br /><span className="text-primary">Course Information</span>
                    </h1>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                        <div className="relative group col-span-2">
                            <label
                                className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                                Title</label>
                            <input
                                name="title"
                                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-4 text-3xl font-headline tracking-tight focus:ring-0 placeholder:text-stone-300"
                                value={course.title}
                                readOnly
                                type="text" />
                        </div>
                        <div className="relative group">
                            <label
                                className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Short Code</label>
                            <input
                                name="short_code"
                                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                                value={course.shortCode}
                                readOnly
                                type="text" />
                        </div>
                        <div className="relative group">
                            <label
                                className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Credit Hours</label>
                            <input
                                name="credit_hours"
                                value={course.creditHours}
                                readOnly
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
                                value={course.duration}
                                readOnly
                                type="text" />
                        </div>
                        <div className="relative group">
                            <label
                                className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Type</label>
                            <select
                                name="type"
                                value={course.type}
                                disabled
                                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                <option value="">Select type</option>
                                <option value="Theory">Theory</option>
                                <option value="Lab">Lab</option>
                                <option value="ComputerLab">Computer Lab</option>
                            </select>
                        </div>
                        <div className="relative group col-span-2 space-y-4 p-4 rounded">
                            {course.offeredTo.map((_, i) => (
                                <div key={i} className="space-y-4 p-4 rounded border-2 border-primary border-dashed">
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="w-1/2">
                                            <label className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Department:</label>
                                            <select disabled className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                                <option>{_.department}</option>
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Term:</label>
                                            <select disabled className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                                <option>{_.term}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        {_.offeredToTeachers.map((__, j) => (
                                            <div key={i + "t" + j} className="mb-4">
                                                <label className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Teacher {j + 1}:</label>
                                                <select disabled className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                                    <option>{__.teacher.name}</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <Form action={remove}>
                                <input readOnly value={course.id} name="id" hidden />
                                <SubmitButton text="Delete" />
                            </Form>
                        </div>

                    </div>

                </div >
            </div>
        </main >
    );
}