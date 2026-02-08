"use server"

import { create } from "@/app/lib/classrooms";
import Form from "next/form";

export default async function Home() {
    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Add Classroom Information</h1>
                <Form action={create}>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2">Name:</label>
                            <input type="text" name="name" className="w-full border rounded p-2" placeholder="Enter classroom name" />
                        </div>
                        <div>
                            <label className="block mb-2">Code:</label>
                            <input type="text" name="code" className="w-full border rounded p-2" placeholder="Enter classroom code" />
                        </div>
                        <div>
                            <label className="block mb-2">Type:</label>
                            <select name="type" className="w-full border rounded p-2">
                                <option value="">Select classroom type</option>
                                <option value="Theory">Theory</option>
                                <option value="Lab">Lab</option>
                                <option value="ComputerLab">Computer Lab</option>

                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Capacity</label>
                            <input type="number" name="capacity" className="w-full border rounded p-2" placeholder="Enter classroom capacity" />
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <a href="/classrooms" className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-2">
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
            </div>
        </div>
    );
}