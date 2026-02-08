import prisma from "@/lib/prisma";

export async function create() {
    'use server'
    console.log('Creating teacher...');
    const user = await prisma.teacher.create({
        data: {
            name: 'John Doe',
            seniority: 'professor',
            rank: 1,
            maxLoad: 10
        }
    })

    console.log(user);
}

create()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })