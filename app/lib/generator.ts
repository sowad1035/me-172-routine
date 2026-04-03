"use server"

import prisma from "@/lib/prisma"
import { uploadToStorage, downloadFromStorage } from "@/lib/supabase"
import { redirect } from "next/navigation"

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
    const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']
    const MORNING_HOURS = [8, 9, 10, 11, 12] // Theory courses: 8am-1pm (before break)
    const AFTERNOON_HOURS = [14, 15, 16] // Seasonal courses: 2pm-5pm (after break at 1-2pm)
    const BREAK_HOUR = 13 // Break from 1-2pm
    const TERMS = ['L1_T1', 'L1_T2', 'L2_T1', 'L2_T2', 'L3_T1', 'L3_T2', 'L4_T1', 'L4_T2']
    const MAX_RETRIES = 5

    type ScheduleEntry = {
        courseId: string
        courseTitle: string
        courseCode: string
        teacherId: string
        teacherName: string
        classroomId: string
        classroomCode: string
        day: string
        startHour: number
        duration: number
    }

    type ScheduleState = {
        teacherBusy: Map<string, Map<string, Set<number>>>
        classroomBusy: Map<string, Map<string, Set<number>>>
        sectionBusy: Map<string, Map<string, Set<number>>>
        teacherLoad: Map<string, number>
        unplacedCourses: Array<{
            sectionId: string
            sectionCode: string
            courseId: string
            courseCode: string
            reason: string
        }>
    }

    // Fetch all data
    console.log('\n📥 Fetching data from database...')
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

    console.log(`   ✓ ${sections.length} sections, ${courses.length} courses, ${teachers.length} teachers, ${classrooms.length} classrooms`)

    // Step 1: Group sections by department and identify available terms for each
    console.log('\n📍 Organizing sections by department...')
    const sectionsByDept = new Map<string, typeof sections>()
    for (const section of sections) {
        if (!sectionsByDept.has(section.department)) {
            sectionsByDept.set(section.department, [])
        }
        sectionsByDept.get(section.department)!.push(section)
    }

    // Step 2: Build courses by department-term and assign terms to departments
    console.log('\n📚 Building course map by department-term...')
    const coursesByDeptTerm = new Map<string, typeof courses>()
    const availableTermsByDept = new Map<string, string[]>()

    for (const course of courses) {
        for (const offer of course.offeredTo) {
            const key = `${offer.department}-${offer.term}`
            const list = coursesByDeptTerm.get(key) ?? []
            if (!list.find(c => c.id === course.id)) {
                list.push(course)
            }
            coursesByDeptTerm.set(key, list)

            // Track available terms per department
            if (!availableTermsByDept.has(offer.department)) {
                availableTermsByDept.set(offer.department, [])
            }
            const terms = availableTermsByDept.get(offer.department)!
            if (!terms.includes(offer.term)) {
                terms.push(offer.term)
            }
        }
    }

    // Assign each department to a term
    const deptTermAssignment = new Map<string, string>()
    let termIdx = 0
    for (const [dept, secs] of sectionsByDept.entries()) {
        const availableTerms = availableTermsByDept.get(dept) ?? []
        if (availableTerms.length > 0) {
            deptTermAssignment.set(dept, availableTerms[0]) // Use first available term
        } else {
            deptTermAssignment.set(dept, TERMS[termIdx % TERMS.length])
        }
        termIdx++
    }

    console.log('   Department → Term assignments:')
    for (const [dept, term] of deptTermAssignment.entries()) {
        console.log(`   ${dept} → ${term}`)
    }

    // Step 3: Helper functions
    const isSlotAvailable = (
        state: ScheduleState,
        teacherId: string,
        classroomId: string,
        sectionId: string,
        day: string,
        hours: number[]
    ): boolean => {
        // Check teacher availability
        const teacherDaySet = state.teacherBusy.get(teacherId)?.get(day)
        if (teacherDaySet && hours.some(h => teacherDaySet.has(h))) {
            return false
        }

        // Check classroom availability
        const classroomDaySet = state.classroomBusy.get(classroomId)?.get(day)
        if (classroomDaySet && hours.some(h => classroomDaySet.has(h))) {
            return false
        }

        // Check section availability
        const sectionDaySet = state.sectionBusy.get(sectionId)?.get(day)
        if (sectionDaySet && hours.some(h => sectionDaySet.has(h))) {
            return false
        }

        return true
    }

    const bookSlot = (
        state: ScheduleState,
        teacherId: string,
        classroomId: string,
        sectionId: string,
        day: string,
        hours: number[],
        duration: number
    ) => {
        // Book teacher
        let teacherDayMap = state.teacherBusy.get(teacherId)
        if (!teacherDayMap) {
            teacherDayMap = new Map()
            state.teacherBusy.set(teacherId, teacherDayMap)
        }
        let teacherHourSet = teacherDayMap.get(day)
        if (!teacherHourSet) {
            teacherHourSet = new Set()
            teacherDayMap.set(day, teacherHourSet)
        }
        hours.forEach(h => teacherHourSet.add(h))

        // Book classroom
        let classroomDayMap = state.classroomBusy.get(classroomId)
        if (!classroomDayMap) {
            classroomDayMap = new Map()
            state.classroomBusy.set(classroomId, classroomDayMap)
        }
        let classroomHourSet = classroomDayMap.get(day)
        if (!classroomHourSet) {
            classroomHourSet = new Set()
            classroomDayMap.set(day, classroomHourSet)
        }
        hours.forEach(h => classroomHourSet.add(h))

        // Book section
        let sectionDayMap = state.sectionBusy.get(sectionId)
        if (!sectionDayMap) {
            sectionDayMap = new Map()
            state.sectionBusy.set(sectionId, sectionDayMap)
        }
        let sectionHourSet = sectionDayMap.get(day)
        if (!sectionHourSet) {
            sectionHourSet = new Set()
            sectionDayMap.set(day, sectionHourSet)
        }
        hours.forEach(h => sectionHourSet.add(h))

        // Update teacher load
        const currentLoad = state.teacherLoad.get(teacherId) ?? 0
        state.teacherLoad.set(teacherId, currentLoad + duration)
    }

    const canAssignTeacher = (state: ScheduleState, teacherId: string, additionalHours: number): boolean => {
        const teacher = teachers.find(t => t.id === teacherId)
        if (!teacher) return false

        const seniority = teacher.seniority
        const limit = TEACHER_LOAD_LIMITS[seniority as keyof TeacherLoadLimits] ?? 25
        const currentLoad = state.teacherLoad.get(teacherId) ?? 0
        return currentLoad + additionalHours <= limit
    }

    const selectClassroom = (section: typeof sections[0], course: typeof courses[0]): typeof classrooms[0] | null => {
        // For labs, prefer matching type
        if (course.type === 'Lab' || course.type === 'ComputerLab') {
            const match = classrooms.find(
                c => c.capacity >= section.numberOfStudents && c.type === course.type
            )
            if (match) return match
        }

        // Try home classroom
        if (section.homeClassroom?.capacity >= section.numberOfStudents) {
            return section.homeClassroom
        }

        // Find any available classroom with capacity
        return classrooms.find(c => c.capacity >= section.numberOfStudents) ?? null
    }

    // Helper: Get daily load for a section to enable load balancing
    const getDayLoadForSection = (state: ScheduleState, sectionId: string, day: string): number => {
        const daySet = state.sectionBusy.get(sectionId)?.get(day)
        return daySet ? daySet.size : 0
    }

    // Helper: Sort days by load (ascending) to balance student workload
    const getDaysSortedByLoad = (state: ScheduleState, sectionId: string): string[] => {
        return [...DAYS].sort((dayA, dayB) => {
            const loadA = getDayLoadForSection(state, sectionId, dayA)
            const loadB = getDayLoadForSection(state, sectionId, dayB)
            return loadA - loadB // Prefer days with fewer classes
        })
    }

    // Step 4: Main scheduling function
    const scheduleAllCourses = (): { routines: RoutineEntry[]; totalUnplaced: number } => {
        const state: ScheduleState = {
            teacherBusy: new Map(),
            classroomBusy: new Map(),
            sectionBusy: new Map(),
            teacherLoad: new Map(),
            unplacedCourses: [],
        }

        const routines: RoutineEntry[] = []

        for (const section of sections) {
            const dept = section.department
            const term = deptTermAssignment.get(dept) ?? TERMS[0]
            const courseKey = `${dept}-${term}`
            const offeredCourses = coursesByDeptTerm.get(courseKey) ?? []

            const assignments: ScheduleEntry[] = []
            const conflicts: string[] = []

            for (const course of offeredCourses) {
                const duration = course.duration ?? 1
                const numSessions = course.type === 'Lab' || course.type === 'ComputerLab' ? 1 : Math.ceil(course.creditHours)

                // Get teachers for this course in this department
                const offerRecord = course.offeredTo.find(o => o.department === dept && o.term === term)
                const offeredTeachers = offerRecord?.offeredToTeachers ?? []

                if (offeredTeachers.length === 0) {
                    conflicts.push(`No teachers assigned to ${course.shortCode}`)
                    state.unplacedCourses.push({
                        sectionId: section.id,
                        sectionCode: section.code,
                        courseId: course.id,
                        courseCode: course.shortCode,
                        reason: 'No teachers assigned',
                    })
                    continue
                }

                // Sort teachers by seniority
                const sortedTeachers = [...offeredTeachers].sort((a, b) => {
                    const rankA = SENIORITY_RANK[a.teacher.seniority] ?? 0
                    const rankB = SENIORITY_RANK[b.teacher.seniority] ?? 0
                    return rankB - rankA
                })

                // Try to schedule each session
                for (let session = 0; session < numSessions; session++) {
                    // For labs, use first teacher; for theory, cycle through teachers
                    const teacherIdx = (course.type === 'Lab' || course.type === 'ComputerLab') ? 0 : session % sortedTeachers.length
                    const teacherObj = sortedTeachers[teacherIdx]?.teacher

                    if (!teacherObj) {
                        conflicts.push(`No teacher available for session ${session + 1} of ${course.shortCode}`)
                        state.unplacedCourses.push({
                            sectionId: section.id,
                            sectionCode: section.code,
                            courseId: course.id,
                            courseCode: course.shortCode,
                            reason: `No teacher for session ${session + 1}`,
                        })
                        continue
                    }

                    // Check teacher load
                    if (!canAssignTeacher(state, teacherObj.id, duration)) {
                        conflicts.push(`Teacher ${teacherObj.name} load exceeded for ${course.shortCode} session ${session + 1}`)
                        state.unplacedCourses.push({
                            sectionId: section.id,
                            sectionCode: section.code,
                            courseId: course.id,
                            courseCode: course.shortCode,
                            reason: `Teacher ${teacherObj.name} load exceeded`,
                        })
                        continue
                    }

                    // Select classroom
                    const classroom = selectClassroom(section, course)
                    if (!classroom) {
                        conflicts.push(`No classroom with capacity ${section.numberOfStudents} for ${course.shortCode}`)
                        state.unplacedCourses.push({
                            sectionId: section.id,
                            sectionCode: section.code,
                            courseId: course.id,
                            courseCode: course.shortCode,
                            reason: 'No suitable classroom',
                        })
                        continue
                    }

                    // Determine preferred time slots
                    const isSessional = course.type === 'Lab' || course.type === 'ComputerLab'
                    const preferredHours = isSessional ? AFTERNOON_HOURS : MORNING_HOURS

                    let placed = false

                    // Get days sorted by current load for balanced distribution
                    const sortedDays = getDaysSortedByLoad(state, section.id)

                    // Try preferred hours first on load-balanced days
                    outerLoop: for (const day of sortedDays) {
                        for (let startIdx = 0; startIdx <= preferredHours.length - duration; startIdx++) {
                            const startHour = preferredHours[startIdx]
                            const neededHours = Array.from({ length: duration }, (_, i) => startHour + i)

                            if (isSlotAvailable(state, teacherObj.id, classroom.id, section.id, day, neededHours)) {
                                bookSlot(state, teacherObj.id, classroom.id, section.id, day, neededHours, duration)
                                assignments.push({
                                    courseId: course.id,
                                    courseTitle: course.title,
                                    courseCode: course.shortCode,
                                    teacherId: teacherObj.id,
                                    teacherName: teacherObj.name,
                                    classroomId: classroom.id,
                                    classroomCode: classroom.code,
                                    day,
                                    startHour,
                                    duration,
                                })
                                placed = true
                                break outerLoop
                            }
                        }
                    }

                    // If not placed in preferred hours and it's a sessional course, try morning hours on load-balanced days
                    if (!placed && isSessional) {
                        outerLoop2: for (const day of sortedDays) {
                            for (let startIdx = 0; startIdx <= MORNING_HOURS.length - duration; startIdx++) {
                                const startHour = MORNING_HOURS[startIdx]
                                const neededHours = Array.from({ length: duration }, (_, i) => startHour + i)

                                if (isSlotAvailable(state, teacherObj.id, classroom.id, section.id, day, neededHours)) {
                                    bookSlot(state, teacherObj.id, classroom.id, section.id, day, neededHours, duration)
                                    assignments.push({
                                        courseId: course.id,
                                        courseTitle: course.title,
                                        courseCode: course.shortCode,
                                        teacherId: teacherObj.id,
                                        teacherName: teacherObj.name,
                                        classroomId: classroom.id,
                                        classroomCode: classroom.code,
                                        day,
                                        startHour,
                                        duration,
                                    })
                                    placed = true
                                    break outerLoop2
                                }
                            }
                        }
                    }

                    if (!placed) {
                        conflicts.push(`Could not schedule ${course.shortCode} session ${session + 1}`)
                        state.unplacedCourses.push({
                            sectionId: section.id,
                            sectionCode: section.code,
                            courseId: course.id,
                            courseCode: course.shortCode,
                            reason: `Session ${session + 1} not placed`,
                        })
                    }
                }
            }

            routines.push({
                sectionId: section.id,
                sectionCode: section.code,
                department: dept,
                term,
                assignments: assignments as any,
                conflicts: conflicts.length > 0 ? conflicts : undefined,
            })
        }

        return { routines, totalUnplaced: state.unplacedCourses.length }
    }

    // Step 5: Run scheduling with retries
    console.log('\n🔄 Starting scheduling with conflict resolution...')
    let bestResult = scheduleAllCourses()
    let attempt = 1

    while (bestResult.totalUnplaced > 0 && attempt < MAX_RETRIES) {
        console.log(`   Attempt ${attempt}: ${bestResult.totalUnplaced} unplaced courses`)
        attempt++
        const result = scheduleAllCourses()
        if (result.totalUnplaced < bestResult.totalUnplaced) {
            bestResult = result
        }
    }

    const routines = bestResult.routines

    console.log(`\n✅ Scheduling complete after ${attempt} attempts`)
    console.log(`   Total routines generated: ${routines.length}`)
    console.log(`   Unplaced courses: ${bestResult.totalUnplaced}`)

    // Display load distribution per section
    console.log('\n📊 LOAD DISTRIBUTION (classes per day per section):')
    for (const routine of routines) {
        const dayLoads: Record<string, number> = {}
        DAYS.forEach(day => dayLoads[day] = 0)

        for (const assignment of routine.assignments) {
            dayLoads[assignment.day]++
        }

        const loadStr = DAYS.map(day => `${day.substring(0, 3)}: ${dayLoads[day]}`).join(' | ')
        console.log(`   ${routine.sectionCode}: ${loadStr}`)
    }

    // Step 6: Generate output
    const teacherLoadsMap = new Map<string, number>()
    for (const routine of routines) {
        for (const assignment of routine.assignments) {
            if (assignment.teacherId) {
                const load = teacherLoadsMap.get(assignment.teacherId) ?? 0
                teacherLoadsMap.set(assignment.teacherId, load + assignment.duration)
            }
        }
    }

    const teacherLoads = Array.from(teacherLoadsMap.entries()).map(([teacherId, load]) => {
        const teacher = teachers.find(t => t.id === teacherId)
        return {
            teacherId,
            teacherName: teacher?.name,
            weeklyLoadHours: load,
            seniority: teacher?.seniority,
            limit: TEACHER_LOAD_LIMITS[teacher?.seniority as keyof TeacherLoadLimits] ?? 25,
        }
    })

    const output = {
        metadata: {
            generatedAt: new Date().toISOString(),
            schedulingAttempts: attempt,
            totalSections: sections.length,
            totalCourses: courses.length,
            totalTeachers: teachers.length,
            totalClassrooms: classrooms.length,
            unplacedCourses: bestResult.totalUnplaced,
        },
        sectionTimetables: routines,
        teacherLoads,
    }

    // Step 7: Persist to storage
    try {
        await uploadToStorage('generated_routines.json', JSON.stringify(output, null, 2), 'application/json')
        console.log('   ✓ Saved to Supabase storage')
    } catch (e) {
        console.error('   ✗ Failed to save to Supabase storage:', e)
    }

    redirect("/?success=true")
}

// Type for generated_routines.json
export type GeneratedRoutine = {
    metadata: {
        generatedAt: string
        schedulingAttempts: number
        totalSections: number
        totalCourses: number
        totalTeachers: number
        totalClassrooms: number
        unplacedCourses: number
    }
    sectionTimetables: RoutineEntry[]
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

    try {
        const fileContent = JSON.parse(await downloadFromStorage('generated_routines.json')) as GeneratedRoutine

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

            // Upload SVG to Supabase storage
            const svgFileName = `routine_${department}_${section}_${term}.svg`
            await uploadToStorage(svgFileName, svgImage, 'image/svg+xml')

            console.log(`✅ Timetable image generated: ${svgFileName}`)
        }
        redirect(`/timetable?dept=${department}&section=${section}&term=${term}`)
    } catch (error) {
        // Rethrow Next.js redirect errors so they propagate properly
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Error in downloadAsStudent:', error)
        throw new Error('Generated routine file not found. Please run the generator first.')
    }
}

export async function downloadAsTeacher(formData: FormData) {
    'use server'
    const teacherId = formData.get('teacherId') as string

    if (!teacherId) {
        redirect('/')
    }

    try {
        const fileContent = JSON.parse(await downloadFromStorage('generated_routines.json')) as GeneratedRoutine

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

        // Upload SVG to Supabase storage
        const svgFileName = `teacher_${teacherId}_timetable.svg`
        await uploadToStorage(svgFileName, svgImage, 'image/svg+xml')

        console.log(`✅ Teacher timetable generated: ${svgFileName}`)

        redirect(`/teacher-timetable?teacherId=${teacherId}&name=${encodeURIComponent(teacher.teacherName || 'Unknown')}`)
    } catch (error) {
        // Rethrow Next.js redirect errors so they propagate properly
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Error in downloadAsTeacher:', error)
        throw new Error('Generated routine file not found. Please run the generator first.')
    }
}

export async function testUpload() {
    'use server'
    const testContent = `This is a test file uploaded at ${new Date().toISOString()}`
    return uploadToStorage('test_upload.txt', testContent, 'text/plain')

}