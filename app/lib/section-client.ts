"use server"

import prisma from "@/lib/prisma";
import { Departments } from "@/generated/prisma/enums";

export async function fetchSectionsByDept(dept: string) {
    if (!dept) return [];

    try {
        const data = await prisma.section.findMany({
            where: {
                department: dept as Departments
            },
            select: {
                code: true
            }
        });
        // Return just the codes as a simple string array
        return data.map(s => s.code);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to fetch sections");
    }
}