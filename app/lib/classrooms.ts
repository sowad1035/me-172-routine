import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function create(formData: FormData) {
    'use server'
    const name = formData.get('name')
    const code = formData.get('code')
    const type = formData.get('type')
    const capacity = formData.get('capacity')

    if (typeof name !== 'string' || typeof code !== 'string' || typeof type !== 'string' || typeof capacity !== 'string') {
        redirect('/classrooms')
    }
    else if (!name || !code || !type || !capacity) {
        redirect('/classrooms')
    }
    else if (type !== 'Theory' && type !== 'Lab' && type !== 'ComputerLab') {
        redirect('/classrooms')
    }

    await prisma.classroom.create({
        data: {
            name,
            code,
            type,
            capacity: parseInt(capacity)
        }
    })
    redirect('/classrooms')
}
