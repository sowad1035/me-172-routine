import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { departments } from "./helper"
import { Departments } from "../generated/prisma/enums"

export async function create(data: FormData) {
    "use server"
    const title = data.get("title") as string
    const shortCode = data.get("short_code") as string
    const creditHours = parseFloat(data.get("credit_hours") as string)
    const department = data.get("department") as string
    const term = data.get("term") as string
    const teacherId = data.get("teacher_id") as string
    const type = data.get("type") as string
    const duration = parseInt(data.get("duration") as string)

    if (!title || !shortCode || !creditHours || !department || !teacherId || !type || !duration) {
        redirect("/courses")
    }
    else if (type !== "Theory" && type !== "Lab" && type !== "ComputerLab") {
        redirect("/courses")
    }
    else if (departments.indexOf(department) === -1) {
        redirect("/courses")
    }
    else if (term !== "L1_T1" && term !== "L1_T2" && term !== "L2_T1" && term !== "L2_T2" && term !== "L3_T1" && term !== "L3_T2" && term !== "L4_T1" && term !== "L4_T2") {
        redirect("/courses")
    }

    await prisma.course.create({
        data: {
            title,
            shortCode,
            creditHours,
            department: department as Departments,
            term,
            teacher: { connect: { id: teacherId } },
            type,
            duration
        }
    })

    redirect("/courses")
}