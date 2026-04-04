"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";

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
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const svgContainerRef = useRef<HTMLDivElement>(null);

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

    const downloadSVG = async () => {
        if (!dept || !section || !term) return;

        try {
            setDownloading(true);
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
            setShowDownloadMenu(false);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    const downloadAsImage = async (format: 'png' | 'jpg') => {
        if (!svgContainerRef.current) return;

        try {
            setDownloading(true);

            // Get SVG element dimensions
            const svgElement = svgContainerRef.current.querySelector('svg') as SVGElement;
            if (!svgElement) throw new Error("SVG element not found");

            const width = svgElement.viewBox?.baseVal?.width || svgElement.clientWidth || 1200;
            const height = svgElement.viewBox?.baseVal?.height || svgElement.clientHeight || 800;

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Failed to get canvas context");

            // Convert SVG to image
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svg = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svg);

            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) return;

                    const downloadUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = `${section}_${term}_timetable.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(downloadUrl);
                    setShowDownloadMenu(false);
                    setDownloading(false);
                }, `image/${format === 'jpg' ? 'jpeg' : format}`, format === 'jpg' ? 0.95 : 1);
            };

            img.onerror = () => {
                console.error("Failed to load SVG as image");
                setDownloading(false);
            };

            img.src = url;
        } catch (err) {
            console.error("Image download failed:", err);
            setDownloading(false);
        }
    };

    const downloadAsPDF = async () => {
        if (!svgContainerRef.current) return;

        try {
            setDownloading(true);

            // Dynamic import of jsPDF
            const { jsPDF } = await import('jspdf');

            const svgElement = svgContainerRef.current.querySelector('svg') as SVGElement;
            if (!svgElement) throw new Error("SVG element not found");

            const width = svgElement.viewBox?.baseVal?.width || svgElement.clientWidth || 1200;
            const height = svgElement.viewBox?.baseVal?.height || svgElement.clientHeight || 800;

            // Create canvas from SVG
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Failed to get canvas context");

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svg = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svg);

            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);

                // Create PDF - landscape orientation for better timetable fit
                const pdf = new jsPDF({
                    orientation: width > height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [width, height]
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                pdf.save(`${section}_${term}_timetable.pdf`);

                URL.revokeObjectURL(url);
                setShowDownloadMenu(false);
                setDownloading(false);
            };

            img.onerror = () => {
                console.error("Failed to load SVG for PDF");
                setDownloading(false);
            };

            img.src = url;
        } catch (err) {
            console.error("PDF download failed:", err);
            setDownloading(false);
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
                            <p className="text-stone-600 font-label font-semibold">Loading timetable...</p>
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
                                Timetable
                            </h1>
                            <p className="text-2xl font-label font-bold uppercase tracking-[0.2em] text-secondary">
                                <span className="text-primary font-black">{dept}</span> • <span className="text-primary font-black">{section}</span> • <span className="text-primary font-black">{term}</span>
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                disabled={downloading}
                                className="bg-primary text-white font-label font-black uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-3 hover:bg-stone-900 transition-all transform active:scale-95 border-2 border-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined text-2xl">download</span>
                                <span>{downloading ? 'Downloading...' : 'Download'}</span>
                            </button>

                            {showDownloadMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white border-2 border-primary shadow-lg z-50">
                                    <button
                                        onClick={downloadSVG}
                                        disabled={downloading}
                                        className="w-full text-left px-6 py-3 hover:bg-stone-100 font-label font-semibold text-primary border-b-2 border-primary last:border-b-0 uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        📄 Download as SVG
                                    </button>
                                    <button
                                        onClick={() => downloadAsImage('png')}
                                        disabled={downloading}
                                        className="w-full text-left px-6 py-3 hover:bg-stone-100 font-label font-semibold text-primary border-b-2 border-primary last:border-b-0 uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        🖼️ Download as PNG
                                    </button>
                                    <button
                                        onClick={() => downloadAsImage('jpg')}
                                        disabled={downloading}
                                        className="w-full text-left px-6 py-3 hover:bg-stone-100 font-label font-semibold text-primary border-b-2 border-primary last:border-b-0 uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        🖼️ Download as JPG
                                    </button>
                                    <button
                                        onClick={downloadAsPDF}
                                        disabled={downloading}
                                        className="w-full text-left px-6 py-3 hover:bg-stone-100 font-label font-semibold text-primary uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        📕 Download as PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div ref={svgContainerRef} className="bg-white border-2 border-primary overflow-hidden shadow-lg p-8">
                            <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svgContent }} />
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