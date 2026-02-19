"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ text = "Add Information" }) {
    const { pending } = useFormStatus();

    return (
        <button disabled={pending} className="disabled:bg-red-900 disabled:text-gray-100 disabled:cursor-wait! flex items-cetner bg-red-800 text-white px-4 py-2 rounded hover:cursor-pointer" type="submit">
            <span className="mr-2">{text}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </button>
    )
}