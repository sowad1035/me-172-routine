"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ text = "Add Information" }) {
    const { pending } = useFormStatus();

    return (
        <button
            disabled={pending}
            type="submit"
            className="group relative flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-75 disabled:cursor-wait disabled:hover:scale-100 overflow-hidden"
        >
            {/* Dark mode: Gold gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 dark:opacity-100 group-hover:opacity-90 transition-opacity duration-300 rounded-xl" />

            {/* Light mode: Blue gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-100 dark:opacity-0 group-hover:dark:opacity-0 transition-opacity duration-300 rounded-xl" />

            {/* Blur backdrop effect */}
            <div className="absolute inset-0 backdrop-blur-lg opacity-20 rounded-xl" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {pending ? "Saving..." : text}
            </span>

            {pending && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="relative z-10 size-5 animate-spin"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
            )}
        </button>
    );
}