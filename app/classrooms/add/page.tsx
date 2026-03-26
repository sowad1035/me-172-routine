"use server"

import { create } from "@/app/lib/classrooms";
import SubmitButton from "@/app/lib/SubmitButton";
import Form from "next/form";

export default async function Home() {
    return (
        <main className="lg:ml-80 pt-24 min-h-screen">
            <div className="mx-auto px-8 py-20">
                <div className="mb-8">
                    <h1
                        className="font-headline text-5xl md:text-7xl font-black text-on-background tracking-tighter leading-[0.85] uppercase">
                        Add New<br /><span className="text-primary">Classroom</span>
                    </h1>
                </div>

                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
                    <Form action={create} className="space-y-20">
                        <section>
                            <div className="flex items-baseline gap-4 mb-10">
                                <h3 className="font-headline text-3xl uppercase font-black tracking-tight">Classroom Info</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="relative group">
                                    <label
                                        className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 block">Name</label>
                                    <input
                                        name="name"
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-3xl font-headline tracking-tight focus:ring-0 placeholder:text-stone-300"
                                        type="text" />
                                </div>
                                <div className="relative group">
                                    <label
                                        className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Code</label>
                                    <input
                                        name="code"
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                                        type="text" />
                                </div>
                                <div className="relative group">
                                    <label
                                        className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Type</label>
                                    <select
                                        name="type"
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 appearance-none">
                                        <option value="Theory">Theory</option>
                                        <option value="Labo">Lab</option>
                                        <option value="ComputerLab">Computer Lab</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <label
                                        className="font-label text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Capacity</label>
                                    <input
                                        name="capacity"
                                        className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-stone-300 py-3 text-xl font-label focus:ring-0 placeholder:text-stone-300"
                                        type="number" />
                                </div>
                            </div>
                        </section>
                        <div className="pt-4 flex flex-col md:flex-row gap-6">
                            <SubmitButton text="Save Classroom" />
                        </div>
                    </Form>
                </div>
            </div>
        </main>
    );
}