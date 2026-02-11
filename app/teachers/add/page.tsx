import Form from "next/form";
import { create } from "@/app/lib/teachers";
import SubmitButton from "@/app/lib/SubmitButton";

export default function Home() {
    return (
        <div className="flex h-screen justify-center items-start pt-10">
            <div className="w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Add Teacher Information</h1>
                <Form action={create}>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2">Teacher Name:</label>
                            <input type="text" name="name" className="w-full border rounded p-2" placeholder="Enter teacher name" />
                        </div>
                        <div>
                            <label className="block mb-2">Nickname:</label>
                            <input type="text" name="nickname" className="w-full border rounded p-2" placeholder="Enter teacher nickname" />
                        </div>
                        <div>
                            <label className="block mb-2">Seniority Level:</label>
                            <select name="seniority" className="w-full border rounded p-2">
                                <option value="">Select seniority level</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="AssistantProfessor">Assistant Professor</option>
                                <option value="AssociateProfessor">Associate Professor</option>
                                <option value="Professor">Professor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Rank</label>
                            <input type="number" name="rank" className="w-full border rounded p-2" placeholder="Enter teacher rank" />
                        </div>
                        <div>
                            <label className="block mb-2">Maximum teaching load per week</label>
                            <input type="number" name="max_load" className="w-full border rounded p-2" placeholder="Enter maximum teaching load per week" />
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <a href="/teachers" className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-2">
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