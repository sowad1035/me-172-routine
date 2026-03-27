"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface TimetablePageProps {
    searchParams: Promise<{
        dept: string;
        section: string;
        term: string;
    }>;
}

function Content() {
    const searchParamsObj = useSearchParams();
    const dept = searchParamsObj.get("dept");
    const section = searchParamsObj.get("section");
    const term = searchParamsObj.get("term");

    const [svgContent, setSvgContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSVG = async () => {
            try {
                if (!dept || !section || !term) {
                    setError("Missing parameters");
                    setLoading(false);
                    return;
                }

                const svgFilename = `routine_${dept}_${section}_${term}.svg`;
                const response = await fetch(`/api/timetable/${svgFilename}`);

                if (!response.ok) {
                    throw new Error("Failed to load timetable");
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
    }, [dept, section, term]);

    const downloadImage = async () => {
        if (!dept || !section || !term) return;

        try {
            const svgFilename = `routine_${dept}_${section}_${term}.svg`;
            const response = await fetch(`/api/timetable/${svgFilename}`);

            if (!response.ok) throw new Error("Failed to download");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${section}_${term}_timetable.svg`;
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
            <main className="lg:ml-80 pt-24 min-h-screen">
                <div className="mx-auto px-8 py-20">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="inline-block p-3 rounded-full bg-blue-400/20 mb-4 animate-pulse">
                                <svg
                                    className="w-8 h-8 text-blue-400 animate-spin"
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
                            <p className="text-slate-300">Loading timetable...</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="lg:ml-80 pt-24 min-h-screen">
                <div className="mx-auto px-8 py-20">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="inline-block p-3 rounded-full bg-red-400/20 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-red-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-red-400">Error: {error}</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="lg:ml-80 pt-24 min-h-screen">
            <div className="mx-auto px-8 py-20">
                <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1
                                className="my-4 font-headline text-8xl font-black uppercase tracking-tighter text-primary leading-none">
                                Timetable
                            </h1>
                            <p className="text-3xl font-label font-semibold uppercase tracking-[0.2em] text-secondary">
                                <span>{dept}</span> • <span>{section}</span> • <span>{term}</span>
                            </p>
                        </div>
                        <button
                            onClick={downloadImage}
                            className="bg-primary text-white font-label font-bold uppercase tracking-[0.2em] px-12 py-6 flex items-center gap-4 hover:bg-[#a50034] transition-all transform active:scale-95">
                            <span className="material-symbols-outlined" data-icon="download">download</span>
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden shadow-2xl p-8">
                            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function TimetablePage() {
    return <Suspense fallback={<div>Loading...</div>}><Content /></Suspense>;
}