import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function create(formData: FormData) {
    'use server'
    const name = formData.get('name')
    const seniority = formData.get('seniority')
    const rank = formData.get('rank')
    const maxLoad = formData.get('max_load')

    if (typeof name !== 'string' || typeof seniority !== 'string' || typeof rank !== 'string' || typeof maxLoad !== 'string') {
        redirect('/teachers')
    }
    else if (!name || !seniority || !rank || !maxLoad) {
        redirect('/teachers')
    }

    await prisma.teacher.create({
        data: {
            name,
            seniority,
            rank: parseInt(rank),
            maxLoad: parseInt(maxLoad)
        }
    })

    redirect('/teachers')

}
