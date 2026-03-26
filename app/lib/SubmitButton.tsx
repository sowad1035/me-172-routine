"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ text = "Add Information" }) {
    const { pending } = useFormStatus();

    return (
        <button
            disabled={pending}
            className={`${pending ? 'opacity-50 cursor-wait' : 'hover:bg-[#a50034]'} bg-primary text-white px-12 py-6 font-label text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-colors group`}
            type="submit">
            <span>{text}</span>
            <span
                className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
        </button>
    );
}