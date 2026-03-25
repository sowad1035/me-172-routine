"use server"
import prisma from "@/lib/prisma";

export async function getAll() {
    return await prisma.teacher.findMany({
        select: {
            id: true,
            name: true,
        }
    })
}