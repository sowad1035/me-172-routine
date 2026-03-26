"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";

interface TimetablePageProps {
    searchParams: Promise<{
        dept: string;
        section: string;
        term: string;
    }>;
}

export default function TimetablePage({
    searchParams,
}: {
    searchParams: Promise<{ dept: string; section: string; term: string }>;
}) {
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
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
                <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-yellow-400/20 mb-4 animate-pulse">
                        <svg
                            className="w-8 h-8 text-yellow-400 animate-spin"
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
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
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
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-8 flex-wrap gap-6">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent mb-2">
                            Timetable
                        </h1>
                        <p className="text-slate-400 text-lg">
                            <span className="text-yellow-300 font-semibold">{dept}</span> • <span className="text-blue-300 font-semibold">{section}</span> • <span className="text-blue-300 font-semibold">{term}</span>
                        </p>
                    </div>
                    <button
                        onClick={downloadImage}
                        className="group relative px-6 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-80 rounded-xl blur-lg group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40 backdrop-blur-xl rounded-xl border border-yellow-300/50"></div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="relative w-5 h-5 text-blue-950"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21"
                            />
                        </svg>
                        <span className="relative text-blue-950">Download</span>
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 overflow-x-auto shadow-2xl hover:border-yellow-400/30 transition-all duration-300">
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                </div>
            </div>
        </div>
    );
}
