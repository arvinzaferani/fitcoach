import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Fit123!@", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fitcoach.local" },
    update: {},
    create: {
      email: "admin@fitcoach.local",
      passwordHash,
      fullName: "ادمین FitCoach",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "coach@fitcoach.local" },
    update: {},
    create: {
      email: "coach@fitcoach.local",
      passwordHash,
      fullName: "مربی نمونه",
      role: "coach",
      phone: "09120000001",
    },
  });

  const athlete = await prisma.user.upsert({
    where: { email: "athlete@fitcoach.local" },
    update: {},
    create: {
      email: "athlete@fitcoach.local",
      passwordHash,
      fullName: "ورزشکار نمونه",
      role: "athlete",
      phone: "09120000002",
      athleteProfile: {
        create: {},
      },
    },
    include: {
      athleteProfile: true,
    },
  });

  if (!athlete.athleteProfile) {
    await prisma.athleteProfile.create({
      data: { userId: athlete.id },
    });
  }

  await prisma.exercise.createMany({
    data: [
      { name: "اسکوات هالتر", nameEn: "Barbell Squat", muscleGroup: "پا", group: "Lower Body", equipment: "هالتر", createdBy: admin.id },
      { name: "پرس سینه دمبل", nameEn: "Dumbbell Bench Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل", createdBy: admin.id },
      { name: "لت پول‌داون", nameEn: "Lat Pulldown", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه", createdBy: admin.id },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
