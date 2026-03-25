"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function TeacherTimetablePage() {
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
                console.log({ svgFilename, teacherId, response })
                console.log({ response })
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
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <p className="text-slate-300">Loading teacher schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Teacher Schedule
                        </h1>
                        <p className="text-slate-300 mt-2">
                            {teacherName || "Unknown"}
                        </p>
                    </div>
                    <button
                        onClick={downloadImage}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21"
                            />
                        </svg>
                        Download
                    </button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-slate-600 p-6 overflow-x-auto shadow-2xl">
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                </div>
            </div>
        </div>
    );
}
