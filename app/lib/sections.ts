import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { departments } from "./helper"
import { Departments } from "@/generated/prisma/enums"

export async function create(formData: FormData) {
    'use server'
    const code = formData.get('code')
    const department = formData.get('department')
    const homeClassroomId = formData.get('home_classroom_id')
    const numberOfStudents = formData.get('number_of_students')

    if (typeof code !== 'string' || typeof department !== 'string' || typeof homeClassroomId !== 'string' || typeof numberOfStudents !== 'string') {
        redirect('/sections')
    }
    else if (!code || !department || !homeClassroomId || !numberOfStudents) {
        redirect('/sections')
    }
    else if (departments.indexOf(department) === -1) {
        redirect('/sections')
    }

    await prisma.section.create({
        data: {
            code,
            department: department as Departments,
            homeClassroomId,
            numberOfStudents: parseInt(numberOfStudents)
        }
    })

    redirect('/sections')
}
