"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function Content() {
    const searchParams = useSearchParams();
    const teacherId = searchParams.get("teacherId");
    const teacherName = searchParams.get("name");

    const [svgContent, setSvgContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSVG = async () => {
            try {
                if (!teacherId) {
                    setError("Missing teacher ID");
                    setLoading(false);
                    return;
                }

                const svgFilename = `teacher_${teacherId}_timetable.svg`;
                const response = await fetch(`/api/timetable/${svgFilename}`);

                if (!response.ok) {
                    throw new Error("Failed to load teacher timetable");
                }

                const svg = await response.text();
                setSvgContent(svg);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load timetable"
                );
            } finally {
                setLoading(false);
            }
        };

        loadSVG();
    }, [teacherId]);

    const downloadImage = async () => {
        if (!teacherId) return;

        try {
            const svgFilename = `teacher_${teacherId}_timetable.svg`;
            const response = await fetch(`/api/timetable/${svgFilename}`);

            if (!response.ok) throw new Error("Failed to download");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${teacherName || teacherId}_schedule.svg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    if (loading) {
        return (
            <main className="lg:ml-80 pt-24 min-h-screen bg-stone-50">
                <div className="max-w-7xl mx-auto px-8 py-20">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 animate-pulse">
                                <svg
                                    className="w-8 h-8 text-primary animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </div>
                            <p className="text-stone-600 font-label font-semibold">Loading teacher schedule...</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="lg:ml-80 pt-24 min-h-screen bg-stone-50">
                <div className="max-w-7xl mx-auto px-8 py-20">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="inline-block p-3 rounded-full bg-red-100 mb-4 border-2 border-red-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-red-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-red-600 font-label font-bold mb-6">Error: {error}</p>
                            <Link href="/" className="bg-primary text-white font-label font-bold uppercase tracking-[0.2em] px-8 py-3 inline-block hover:opacity-90 transition-opacity border-2 border-primary">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="lg:ml-80 pt-24 min-h-screen bg-stone-50 brutal-grid">
            <div className="max-w-7xl mx-auto px-8 pb-20">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 bg-white p-10 border-2 border-primary">
                        <div className="flex-1">
                            <h1
                                className="font-headline text-7xl md:text-9xl font-black uppercase tracking-tighter text-primary leading-none mb-4">
                                Teacher Schedule
                            </h1>
                            <p className="text-2xl font-label font-bold uppercase tracking-[0.2em] text-secondary">
                                <span className="text-primary font-black">{teacherName || "Unknown"}</span>
                            </p>
                        </div>
                        <button
                            onClick={downloadImage}
                            className="bg-primary text-white font-label font-black uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-3 hover:bg-stone-900 transition-all transform active:scale-95 border-2 border-primary whitespace-nowrap">
                            <span className="material-symbols-outlined text-2xl">download</span>
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="bg-white border-2 border-primary overflow-hidden shadow-lg p-8">
                            <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svgContent }} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default async function TeacherTimetablePage() {

    return <Suspense fallback={<div>Loading...</div>}><Content /></Suspense>;

}
