"use server"

import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { departments } from "./helper"
import { Departments } from "@/generated/prisma/enums"

export async function create(data: FormData) {
    const title = data.get("title") as string
    const shortCode = data.get("short_code") as string
    const creditHours = parseFloat(data.get("credit_hours") as string)
    const departmentCount = parseInt(data.get("department_count") as string)
    const type = data.get("type") as string
    const duration = parseInt(data.get("duration") as string)

    if (!title || !shortCode || isNaN(creditHours) || isNaN(departmentCount) || isNaN(duration)) {
        redirect("/courses")
    }
    else if (departmentCount < 1 || departmentCount > departments.length) {
        redirect("/courses")
    }
    else if (!type || !["Theory", "Lab", "ComputerLab"].includes(type)) {
        redirect("/courses")
    }

    const teacherCount: number[] = []
    Array.from({ length: departmentCount }).map((_, index) => {
        const count = parseInt(data.get(`teacher_count_department_${index + 1}`) as string)
        teacherCount.push(count)
    })

    const course = await prisma.course.create({
        data: {
            title,
            shortCode,
            creditHours,
            type: type as "Theory" | "Lab" | "ComputerLab",
            duration
        }
    })

    for (let i = 0; i < departmentCount; i++) {
        const department = data.get(`department_${i + 1}`) as string
        const term = data.get(`term_${i + 1}`) as string
        const count = teacherCount[i]

        const dept = await prisma.offeredTo.create({
            data: {
                courseId: course.id,
                department: department as Departments,
                term: term as any
            }
        })

        for (let j = 0; j < count; j++) {
            const teacherId = data.get(`teacher_${j + 1}_department_${i + 1}`) as string

            await prisma.offeredToTeacher.create({
                data: {
                    offeredToId: dept.id,
                    teacherId,
                }
            })
        }
    }
    redirect("/courses")
}

export async function remove(data: FormData) {
    const id = data.get("id") as string;

    const course = await prisma.course.findUnique({
        where: { id },
        select: {
            offeredTo: {
                select: {
                    id: true,
                }
            }
        }
    })

    if (!course) {
        redirect("/courses")
    }

    course.offeredTo.map(async (o) => {
        await prisma.offeredToTeacher.deleteMany({ where: { offeredToId: o.id } })
    })

    await prisma.offeredTo.deleteMany({ where: { courseId: id } })

    await prisma.course.delete({ where: { id } })

    redirect("/courses")
}