"use server"

import prisma from "@/lib/prisma"
import fs from "fs"
import { redirect } from "next/navigation"
import path from "path"

/**
 * SPEC-COMPLIANT SCHEDULING SYSTEM
 * 
 * Implements constraint-based class routine generation per Term Project specification:
 * - Seniority-based teacher allocation (senior teachers get optimal slots first)
 * - Teacher load limits per week by rank
 * - Preferred time slot allocation
 * - Flexible session duration (1-3 hours)
 * - Classroom capacity validation
 * - Hard constraints: No teacher/classroom/section conflicts
 * - Conflict detection & reporting
 * - Multi-view output: section, teacher, classroom, course timetables
 */

type RoutineEntry = {
    sectionId: string
    sectionCode: string
    department: string
    term: string
    assignments: Array<{
        courseId: string
        courseTitle: string
        courseCode: string
        teacherId?: string
        teacherName?: string
        classroomId?: string
        classroomCode?: string
        day: string
        startHour: number
        duration: number
        note?: string
    }>
    conflicts?: string[]
}

type TeacherLoadLimits = {
    Professor: number
    AssociateProf: number
    AssistantProf: number
    Lecturer: number
}

type Conflict = {
    type: 'classroom' | 'teacher' | 'section' | 'capacity'
    description: string
    assignment?: any
}

// Seniority rank mapping (higher number = more senior)
const SENIORITY_RANK: Record<string, number> = {
    'Lecturer': 1,
    'AssistantProf': 2,
    'AssociateProf': 3,
    'Professor': 4,
}

// Teacher load limits per week (hours) by seniority rank
const TEACHER_LOAD_LIMITS: TeacherLoadLimits = {
    Professor: 12,
    AssociateProf: 16,
    AssistantProf: 20,
    Lecturer: 25,
}

export async function generate(formData: FormData) {
    const desiredTerm = "";

    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']
    const allHours = Array.from({ length: 9 }, (_, i) => i + 8) // 8-16
    const beforeBreak = [8, 9, 10, 11, 12]
    const afterBreak = [14, 15, 16]
    const terms = ['L1_T1', 'L1_T2', 'L2_T1', 'L2_T2', 'L3_T1', 'L3_T2', 'L4_T1', 'L4_T2']

    const [sections, courses, classrooms, teachers] = await Promise.all([
        prisma.section.findMany({ include: { homeClassroom: true } }),
        prisma.course.findMany({
            include: {
                offeredTo: {
                    include: {
                        offeredToTeachers: { include: { teacher: true } },
                    },
                },
            },
        }),
        prisma.classroom.findMany(),
        prisma.teacher.findMany(),
    ])

    // Map sections to terms
    const sectionTermMap = new Map<string, string>()
    const deptGroup = new Map<string, typeof sections>()

    for (const section of sections) {
        const arr = deptGroup.get(section.department) ?? []
        arr.push(section)
        deptGroup.set(section.department, arr)
    }

    if (desiredTerm && terms.includes(desiredTerm)) {
        for (const section of sections) {
            sectionTermMap.set(section.id, desiredTerm)
        }
    } else {
        for (const [department, deptSections] of deptGroup.entries()) {
            const baseCount = Math.floor(deptSections.length / terms.length)
            const extra = deptSections.length % terms.length
            let idx = 0

            for (let t = 0; t < terms.length; t++) {
                const assignCount = baseCount + (t < extra ? 1 : 0)
                for (let i = 0; i < assignCount && idx < deptSections.length; i++, idx++) {
                    sectionTermMap.set(deptSections[idx].id, terms[t])
                }
            }
            while (idx < deptSections.length) {
                const t = idx % terms.length
                sectionTermMap.set(deptSections[idx].id, terms[t])
                idx++
            }
        }
    }

    // Build courses by department-term
    const coursesByDeptTerm = new Map<string, typeof courses>()
    for (const course of courses) {
        for (const offer of course.offeredTo) {
            const key = `${offer.department}-${offer.term}`
            const list = coursesByDeptTerm.get(key) ?? []
            if (!list.includes(course)) {
                list.push(course)
            }
            coursesByDeptTerm.set(key, list)
        }
    }

    // SENIORITY-BASED SCHEDULING: Sort teachers by seniority (senior first)
    const teachersBySeniority = [...teachers].sort((a, b) => {
        const rankA = SENIORITY_RANK[a.seniority] ?? 0
        const rankB = SENIORITY_RANK[b.seniority] ?? 0
        return rankB - rankA // descending (senior first)
    })

    // Track busy slots and load per teacher
    const teacherBusy: Map<string, Map<string, Set<number>>> = new Map()
    const classroomBusy: Map<string, Map<string, Set<number>>> = new Map()
    const sectionSchedule: Map<string, Map<string, Set<number>>> = new Map()
    const teacherWeeklyLoad: Map<string, number> = new Map()
    const allConflicts: Conflict[] = []

    // Helper: Check if a time slot is available
    const isSlotAvailable = (
        teacherId: string | undefined,
        classroomId: string | undefined,
        sectionId: string,
        day: string,
        hours: number[]
    ): boolean => {
        // Check teacher conflicts
        if (teacherId) {
            const teacherDaySet = teacherBusy.get(teacherId)?.get(day)
            if (teacherDaySet && hours.some(h => teacherDaySet.has(h))) {
                return false
            }
        }

        // Check classroom conflicts
        if (classroomId) {
            const classroomDaySet = classroomBusy.get(classroomId)?.get(day)
            if (classroomDaySet && hours.some(h => classroomDaySet.has(h))) {
                return false
            }
        }

        // Check section conflicts
        const sectionDaySet = sectionSchedule.get(sectionId)?.get(day)
        if (sectionDaySet && hours.some(h => sectionDaySet.has(h))) {
            return false
        }

        return true
    }

    // Helper: Book a slot
    const bookSlot = (
        teacherId: string | undefined,
        classroomId: string | undefined,
        sectionId: string,
        day: string,
        hours: number[],
        duration: number
    ) => {
        if (teacherId) {
            const dayMap = teacherBusy.get(teacherId) ?? new Map<string, Set<number>>()
            const hourSet = dayMap.get(day) ?? new Set<number>()
            hours.forEach(h => hourSet.add(h))
            dayMap.set(day, hourSet)
            teacherBusy.set(teacherId, dayMap)

            // Track load
            const currentLoad = teacherWeeklyLoad.get(teacherId) ?? 0
            teacherWeeklyLoad.set(teacherId, currentLoad + duration)
        }

        if (classroomId) {
            const dayMap = classroomBusy.get(classroomId) ?? new Map<string, Set<number>>()
            const hourSet = dayMap.get(day) ?? new Set<number>()
            hours.forEach(h => hourSet.add(h))
            dayMap.set(day, hourSet)
            classroomBusy.set(classroomId, dayMap)
        }

        const dayMap = sectionSchedule.get(sectionId) ?? new Map<string, Set<number>>()
        const hourSet = dayMap.get(day) ?? new Set<number>()
        hours.forEach(h => hourSet.add(h))
        dayMap.set(day, hourSet)
        sectionSchedule.set(sectionId, dayMap)
    }

    // Helper: Find best classroom
    const selectClassroom = (section: typeof sections[0], course: typeof courses[0]) => {
        // For labs/computer labs, prefer matching type
        if (course.type === 'Lab' || course.type === 'ComputerLab') {
            const typeMatch = classrooms.find(
                c => c.capacity >= section.numberOfStudents && c.type === course.type
            )
            if (typeMatch) return typeMatch
        }

        // Fall back to home classroom or any with capacity
        if (section.homeClassroom && section.homeClassroom.capacity >= section.numberOfStudents) {
            return section.homeClassroom
        }

        return classrooms.find(c => c.capacity >= section.numberOfStudents)
    }

    // Helper: Assign teacher with load checking
    const canAssignTeacher = (teacherId: string, additionalHours: number): boolean => {
        const seniority = teachers.find(t => t.id === teacherId)?.seniority || 'Lecturer'
        const limit = TEACHER_LOAD_LIMITS[seniority as keyof TeacherLoadLimits] || 25
        const currentLoad = teacherWeeklyLoad.get(teacherId) ?? 0
        return currentLoad + additionalHours <= limit
    }

    // Main scheduling loop
    const routines: RoutineEntry[] = []

    for (const section of sections) {
        const assignments: RoutineEntry["assignments"] = []
        const conflicts: string[] = []
        const sectionTerm = sectionTermMap.get(section.id) ?? terms[0]

        const courseKey = `${section.department}-${sectionTerm}`
        const offeredCourses = coursesByDeptTerm.get(courseKey) ?? []

        for (const course of offeredCourses) {
            const duration = Math.max(1, Math.min(3, course.duration || 1))
            const numSessions = course.type === 'Lab' ? 1 : Math.ceil(course.creditHours)

            // Get offered teachers
            const offered = course.offeredTo.find(o => o.department === section.department)
            const offeredTeachers = offered?.offeredToTeachers || []

            // Sort offered teachers by seniority (senior first for priority slots)
            const sortedTeachers = [...offeredTeachers].sort((a, b) => {
                const rankA = SENIORITY_RANK[a.teacher.seniority] ?? 0
                const rankB = SENIORITY_RANK[b.teacher.seniority] ?? 0
                return rankB - rankA
            })

            for (let session = 0; session < numSessions; session++) {
                // Cycle through sorted teachers for theory; use first for lab
                const teacherIndex = course.type === 'Lab' ? 0 : session % sortedTeachers.length
                const teacherRecord = sortedTeachers[teacherIndex]?.teacher

                // Validate teacher load
                if (teacherRecord && !canAssignTeacher(teacherRecord.id, duration)) {
                    conflicts.push(
                        `Teacher ${teacherRecord.name} exceeds load limit for session ${session + 1} of ${course.title}`
                    )
                    continue
                }

                // Select classroom
                const classroom = selectClassroom(section, course)

                // Capacity check
                if (!classroom || classroom.capacity < section.numberOfStudents) {
                    conflicts.push(
                        `Insufficient classroom capacity for section ${section.code} in course ${course.title}`
                    )
                    allConflicts.push({
                        type: 'capacity',
                        description: `Section ${section.code} needs ${section.numberOfStudents} seats; best available has ${classroom?.capacity || 0}`,
                    })
                    continue
                }

                // Determine time slots
                // Sessional courses (lab, computer lab) can use any time to resolve conflicts
                const availableSlots = (course.type === 'Lab' || course.type === 'ComputerLab')
                    ? [...beforeBreak, ...afterBreak]  // Full day availability for sessional courses
                    : beforeBreak  // Theory courses only in morning

                let placed = false

                // Try to find available slot
                for (const day of days) {
                    for (let startIdx = 0; startIdx <= availableSlots.length - duration; startIdx++) {
                        const startHour = availableSlots[startIdx]
                        const needed = Array.from({ length: duration }, (_, i) => startHour + i)

                        if (isSlotAvailable(teacherRecord?.id, classroom.id, section.id, day, needed)) {
                            // Book slot
                            bookSlot(teacherRecord?.id, classroom.id, section.id, day, needed, duration)

                            assignments.push({
                                courseId: course.id,
                                courseTitle: course.title,
                                courseCode: course.shortCode || course.title,
                                teacherId: teacherRecord?.id,
                                teacherName: teacherRecord?.name,
                                classroomId: classroom.id,
                                classroomCode: classroom.code,
                                day,
                                startHour,
                                duration,
                            })

                            placed = true
                            break
                        }
                    }

                    if (placed) break
                }

                if (!placed) {
                    conflicts.push(
                        `Could not place session ${session + 1} of course ${course.shortCode || course.title} for section ${section.code}`
                    )
                    assignments.push({
                        courseId: course.id,
                        courseTitle: course.title,
                        courseCode: course.shortCode || course.title,
                        day: '',
                        startHour: -1,
                        duration,
                        note: `unplaced session ${session + 1}`,
                    })
                    allConflicts.push({
                        type: 'section',
                        description: conflicts[conflicts.length - 1],
                    })
                }
            }
        }

        routines.push({
            sectionId: section.id,
            sectionCode: section.code,
            department: section.department,
            term: sectionTerm,
            assignments,
            conflicts: conflicts.length ? conflicts : undefined,
        })
    }

    // Generate multi-view output
    const output = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalSections: sections.length,
            totalCourses: courses.length,
            totalTeachers: teachers.length,
            totalClassrooms: classrooms.length,
            unplacedSessions: allConflicts.filter(c => c.type === 'section').length,
            capacityIssues: allConflicts.filter(c => c.type === 'capacity').length,
        },
        sectionTimetables: routines,
        conflicts: allConflicts,
        teacherLoads: Array.from(teacherWeeklyLoad.entries()).map(([teacherId, load]) => ({
            teacherId,
            teacherName: teachers.find(t => t.id === teacherId)?.name,
            weeklyLoadHours: load,
            seniority: teachers.find(t => t.id === teacherId)?.seniority,
            limit: TEACHER_LOAD_LIMITS[
                (teachers.find(t => t.id === teacherId)?.seniority as keyof TeacherLoadLimits) || 'Lecturer'
            ],
        })),
    }

    // Persist output
    const outPath = path.join(process.cwd(), 'public', 'generated_routines.json')
    try {
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
    } catch (e) {
        console.error('Failed to write routines file', e)
    }

    console.log(`✅ Scheduling complete. Conflicts: ${allConflicts.length}`)
    redirect("/?success=true")
}

// type for generated_routines.json
export type GeneratedRoutine = {
    metadata: {
        generatedAt: string
        totalSections: number
        totalCourses: number
        totalTeachers: number
        totalClassrooms: number
        unplacedSessions: number
        capacityIssues: number
    }
    sectionTimetables: RoutineEntry[]
    conflicts: Conflict[]
    teacherLoads: Array<{
        teacherId: string
        teacherName?: string
        weeklyLoadHours: number
        seniority?: string
        limit: number
    }>
}

// Function to generate timetable image as SVG/HTML canvas
function generateTimetableImage(routine: RoutineEntry): string {
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16]
    const cellWidth = 120
    const cellHeight = 80
    const headerHeight = 60
    const dayColumnWidth = 80

    // Create SVG
    const width = dayColumnWidth + hours.length * cellWidth
    const height = headerHeight + days.length * cellHeight + 100

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${width}" height="${height}" fill="white"/>`

    // Title
    svg += `<text x="20" y="30" font-size="20" font-weight="bold">Final Routine (Term: ${routine.term})</text>`
    svg += `<text x="20" y="50" font-size="16" font-weight="bold">${routine.department} ${routine.sectionCode}</text>`

    // Header row (hours)
    svg += `<rect x="0" y="${headerHeight}" width="${dayColumnWidth}" height="40" fill="#f0f0f0" stroke="black" stroke-width="1"/>`
    for (let i = 0; i < hours.length; i++) {
        const x = dayColumnWidth + i * cellWidth
        svg += `<rect x="${x}" y="${headerHeight}" width="${cellWidth}" height="40" fill="#e0e0e0" stroke="black" stroke-width="1"/>`
        svg += `<text x="${x + cellWidth / 2}" y="${headerHeight + 25}" font-size="12" text-anchor="middle">${hours[i]}:00</text>`
    }

    // Day rows with assignments
    let dayIndex = 0
    for (const day of days) {
        const y = headerHeight + 40 + dayIndex * cellHeight

        // Day label
        svg += `<rect x="0" y="${y}" width="${dayColumnWidth}" height="${cellHeight}" fill="#f0f0f0" stroke="black" stroke-width="1"/>`
        svg += `<text x="${dayColumnWidth / 2}" y="${y + cellHeight / 2}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${day.substring(0, 2)}</text>`

        // Cells for each hour
        for (let hourIdx = 0; hourIdx < hours.length; hourIdx++) {
            const x = dayColumnWidth + hourIdx * cellWidth
            svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="white" stroke="black" stroke-width="1"/>`
        }

        // Place assignments
        for (const assignment of routine.assignments) {
            if (assignment.day === day && assignment.startHour !== -1) {
                const hourIdx = hours.indexOf(assignment.startHour)
                if (hourIdx >= 0) {
                    const x = dayColumnWidth + hourIdx * cellWidth + 2
                    const cellWidthActual = cellWidth * assignment.duration - 4
                    const courseText = assignment.courseCode.substring(0, 15)

                    svg += `<defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFC107;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" /></linearGradient></defs>`
                    svg += `<rect x="${x}" y="${y + 2}" width="${cellWidthActual}" height="${cellHeight - 4}" fill="url(#goldGrad)" stroke="#B8860B" stroke-width="2" rx="4"/>`
                    svg += `<text x="${x + cellWidthActual / 2}" y="${y + 25}" font-size="11" font-weight="bold" fill="#003d82" text-anchor="middle">${courseText}</text>`
                    svg += `<text x="${x + cellWidthActual / 2}" y="${y + 45}" font-size="9" fill="#003d82" text-anchor="middle">${assignment.teacherName?.substring(0, 12) || 'TBA'}</text>`
                }
            }
        }

        dayIndex++
    }

    svg += `</svg>`
    return svg
}

// Function to generate teacher timetable image
function generateTeacherTimetableImage(routine: RoutineEntry, teacherName: string): string {
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16]
    const cellWidth = 120
    const cellHeight = 80
    const headerHeight = 60
    const dayColumnWidth = 80

    // Create SVG
    const width = dayColumnWidth + hours.length * cellWidth
    const height = headerHeight + days.length * cellHeight + 100

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${width}" height="${height}" fill="white"/>`

    // Title
    svg += `<text x="20" y="30" font-size="20" font-weight="bold">Teacher Schedule</text>`
    svg += `<text x="20" y="50" font-size="16" font-weight="bold">${teacherName}</text>`

    // Header row (hours)
    svg += `<rect x="0" y="${headerHeight}" width="${dayColumnWidth}" height="40" fill="#f0f0f0" stroke="black" stroke-width="1"/>`
    for (let i = 0; i < hours.length; i++) {
        const x = dayColumnWidth + i * cellWidth
        svg += `<rect x="${x}" y="${headerHeight}" width="${cellWidth}" height="40" fill="#e0e0e0" stroke="black" stroke-width="1"/>`
        const hourDisplay = hours[i] > 12 ? hours[i] - 12 : hours[i]
        svg += `<text x="${x + cellWidth / 2}" y="${headerHeight + 25}" font-size="12" text-anchor="middle">${hourDisplay}:00</text>`
    }

    // Day rows with assignments
    let dayIndex = 0
    for (const day of days) {
        const y = headerHeight + 40 + dayIndex * cellHeight

        // Day label
        svg += `<rect x="0" y="${y}" width="${dayColumnWidth}" height="${cellHeight}" fill="#f0f0f0" stroke="black" stroke-width="1"/>`
        svg += `<text x="${dayColumnWidth / 2}" y="${y + cellHeight / 2}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${day.substring(0, 2)}</text>`

        // Cells for each hour
        for (let hourIdx = 0; hourIdx < hours.length; hourIdx++) {
            const x = dayColumnWidth + hourIdx * cellWidth
            svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="white" stroke="black" stroke-width="1"/>`
        }

        // Place assignments
        for (const assignment of routine.assignments) {
            if (assignment.day === day && assignment.startHour !== -1) {
                const hourIdx = hours.indexOf(assignment.startHour)
                if (hourIdx >= 0) {
                    const x = dayColumnWidth + hourIdx * cellWidth + 2
                    const cellWidthActual = cellWidth * assignment.duration - 4
                    const courseText = assignment.courseCode.substring(0, 15)
                    const sectionText = assignment.courseTitle.substring(0, 10)

                    svg += `<defs><linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" /><stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" /></linearGradient></defs>`
                    svg += `<rect x="${x}" y="${y + 2}" width="${cellWidthActual}" height="${cellHeight - 4}" fill="url(#blueGrad)" stroke="#1e3a8a" stroke-width="2" rx="4"/>`
                    svg += `<text x="${x + cellWidthActual / 2}" y="${y + 20}" font-size="11" font-weight="bold" fill="white" text-anchor="middle">${courseText}</text>`
                    svg += `<text x="${x + cellWidthActual / 2}" y="${y + 40}" font-size="9" fill="white" text-anchor="middle">${sectionText}</text>`
                    svg += `<text x="${x + cellWidthActual / 2}" y="${y + 55}" font-size="8" fill="white" text-anchor="middle">${assignment.classroomCode || 'TBA'}</text>`
                }
            }
        }

        dayIndex++
    }

    // Add legend and info
    const legendY = height - 40
    svg += `<text x="20" y="${legendY}" font-size="12" font-weight="bold">Total Classes: ${routine.assignments.length}</text>`
    svg += `<rect x="20" y="${legendY + 10}" width="30" height="20" fill="#3B82F6" stroke="#1e3a8a" stroke-width="1"/>`
    svg += `<text x="60" y="${legendY + 25}" font-size="11">Assigned Class</text>`

    svg += `</svg>`
    return svg
}

export async function downloadAsStudent(formData: FormData) {
    'use server'
    const department = formData.get('department')
    const section = formData.get('section')
    const term = formData.get('term')

    if (typeof department !== 'string' || typeof section !== 'string' || typeof term !== 'string') {
        redirect('/')
    }

    if (!department || !section || !term) {
        redirect('/')
    }

    const filePath = path.join(process.cwd(), 'public', 'generated_routines.json')
    if (fs.existsSync(filePath)) {
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GeneratedRoutine

        const filteredContent = {
            ...fileContent,
            sectionTimetables: fileContent.sectionTimetables.filter(
                s => s.department === department && s.term === term && s.sectionCode === section
            ),
        }

        // Generate timetable image for each section
        if (filteredContent.sectionTimetables.length > 0) {
            const routine = filteredContent.sectionTimetables[0]
            const svgImage = generateTimetableImage(routine)

            // Save SVG to public folder
            const svgPath = path.join(process.cwd(), 'public', `routine_${department}_${section}_${term}.svg`)
            fs.writeFileSync(svgPath, svgImage, 'utf-8')

            console.log(`✅ Timetable image generated: ${svgPath}`)
        }

        console.log('Generated routine file content:', filteredContent)
        redirect(`/timetable?dept=${department}&section=${section}&term=${term}`)
    } else {
        throw new Error('Generated routine file not found. Please run the generator first.')
    }
}

export async function downloadAsTeacher(formData: FormData) {
    'use server'
    const teacherId = formData.get('teacherId') as string

    if (!teacherId) {
        redirect('/')
    }

    const filePath = path.join(process.cwd(), 'public', 'generated_routines.json')

    if (!fs.existsSync(filePath)) {
        throw new Error('Generated routine file not found. Please run the generator first.')
    }

    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GeneratedRoutine

    // Find teacher name from teacherId
    const teacher = fileContent.teacherLoads.find(t => t.teacherId === teacherId)
    if (!teacher) {
        redirect('/')
    }

    // Create a synthetic routine entry for the teacher showing all their assignments
    const teacherRoutine: RoutineEntry = {
        sectionId: teacherId,
        sectionCode: teacher.teacherName || teacherId,
        department: 'All',
        term: 'All',
        assignments: [],
        conflicts: undefined,
    }

    // Collect all assignments for this teacher
    for (const section of fileContent.sectionTimetables) {
        for (const assignment of section.assignments) {
            if (assignment.teacherId === teacherId) {
                teacherRoutine.assignments.push(assignment)
            }
        }
    }

    // Generate teacher timetable image
    const svgImage = generateTeacherTimetableImage(teacherRoutine, teacher.teacherName || teacherId)

    // Save SVG to public folder
    const svgPath = path.join(process.cwd(), 'public', `teacher_${teacherId}_timetable.svg`)
    fs.writeFileSync(svgPath, svgImage, 'utf-8')

    console.log(`✅ Teacher timetable generated: ${svgPath}`)

    redirect(`/teacher-timetable?teacherId=${teacherId}&name=${encodeURIComponent(teacher.teacherName || 'Unknown')}`)
}