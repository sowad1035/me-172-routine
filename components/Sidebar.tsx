"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { testUpload } from "@/app/lib/generator";

const navItems = [
    { label: "Generate", href: "/", icon: "wand_stars" },
    { label: "Faculty", href: "/teachers", icon: "groups_3" },
    { label: "Classrooms", href: "/classrooms", icon: "room_preferences" },
    { label: "Sections", href: "/sections", icon: "group_work" },
    { label: "Courses", href: "/courses", icon: "library_books" },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();


    return (
        <>
            <nav
                className="fixed top-0 z-50 w-full px-8 h-20 flex justify-between items-center bg-white/80 backdrop-blur-xl">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="z-50 lg:hidden p-2 rounded-lg transition-all duration-300 pr-4"
                    >
                        <span className="material-symbols-outlined text-red-600">menu</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-[#a50034] tracking-tighter font-['Epilogue'] uppercase">BUET
                            Academic
                            Rebel</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                </div>
            </nav>
            <aside
                className={`fixed lg:flex top-0 left-0 z-40 h-full flex-col p-6 w-80 bg-[#f9f9f9] border-r-0 transition-all duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } w-64 flex flex-col`}
            >
                <div className="text-xl font-black text-[#a50034] tracking-tighter mb-12 mt-20 font-['Epilogue']">
                    BUET<br /><span className="text-stone-400 text-xs tracking-[0.2em] font-label font-bold">ACADEMIC
                        REBEL</span>
                </div>
                <div className="flex flex-col gap-2 flex-grow">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                className={`flex items-center gap-3 p-3 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest ${isActive
                                    ? "bg-[#a50034] text-white"
                                    : "text-stone-600 hover:translate-x-1 transition-transform duration-200"
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto border-t border-outline-variant pt-6">
                    <a className="flex items-center gap-3 p-3 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest text-stone-600"
                        href="/Lab_Report.html" target="_blank">
                        <span className="material-symbols-outlined">
                            assignment
                        </span>
                        Lab report
                    </a>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}
        </>
    );
}
