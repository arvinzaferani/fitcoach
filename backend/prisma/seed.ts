import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const exercises = [
  // ===== Lower Body =====
  { name: "اسکوات هالتر", nameEn: "Barbell Squat", muscleGroup: "پا", group: "Lower Body", equipment: "هالتر" },
  { name: "اسکوات دمبل", nameEn: "Dumbbell Squat", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "اسکوات جلو پا", nameEn: "Front Squat", muscleGroup: "پا", group: "Lower Body", equipment: "هالتر" },
  { name: "اسکوات گابلت", nameEn: "Goblet Squat", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "اسکوات بلغاری", nameEn: "Bulgarian Split Squat", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "اسکوات اسمیت", nameEn: "Smith Machine Squat", muscleGroup: "پا", group: "Lower Body", equipment: "دستگاه" },
  { name: "اسکوات پرشی", nameEn: "Jump Squat", muscleGroup: "پا", group: "Lower Body", equipment: "بدون وسیله" },
  { name: "پرس پا", nameEn: "Leg Press", muscleGroup: "پا", group: "Lower Body", equipment: "دستگاه" },
  { name: "ددلیفت", nameEn: "Deadlift", muscleGroup: "پشت", group: "Lower Body", equipment: "هالتر" },
  { name: "ددلیفت رومانیایی", nameEn: "Romanian Deadlift", muscleGroup: "همسترینگ", group: "Lower Body", equipment: "هالتر" },
  { name: "ددلیفت دمبل", nameEn: "Dumbbell Deadlift", muscleGroup: "همسترینگ", group: "Lower Body", equipment: "دمبل" },
  { name: "ددلیفت سومو", nameEn: "Sumo Deadlift", muscleGroup: "پا", group: "Lower Body", equipment: "هالتر" },
  { name: "لانج", nameEn: "Lunges", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "لانج راه رفتن", nameEn: "Walking Lunges", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "لانج معکوس", nameEn: "Reverse Lunge", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "لانج جانبی", nameEn: "Side Lunge", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "جلو پا دستگاه", nameEn: "Leg Extension", muscleGroup: "چهارسر ران", group: "Lower Body", equipment: "دستگاه" },
  { name: "خم پا دستگاه", nameEn: "Leg Curl", muscleGroup: "همسترینگ", group: "Lower Body", equipment: "دستگاه" },
  { name: "خم پا ایستاده", nameEn: "Standing Leg Curl", muscleGroup: "همسترینگ", group: "Lower Body", equipment: "دستگاه" },
  { name: "ساق پا ایستاده", nameEn: "Standing Calf Raise", muscleGroup: "ساق پا", group: "Lower Body", equipment: "دستگاه" },
  { name: "ساق پا نشسته", nameEn: "Seated Calf Raise", muscleGroup: "ساق پا", group: "Lower Body", equipment: "دستگاه" },
  { name: "ساق پا هالتر", nameEn: "Barbell Calf Raise", muscleGroup: "ساق پا", group: "Lower Body", equipment: "هالتر" },
  { name: "هیپ تراست", nameEn: "Hip Thrust", muscleGroup: "باسن", group: "Lower Body", equipment: "هالتر" },
  { name: "گلوت پل", nameEn: "Glute Bridge", muscleGroup: "باسن", group: "Lower Body", equipment: "بدون وسیله" },
  { name: "هایپرمتریک", nameEn: "Hyperextension", muscleGroup: "فیله کمری", group: "Lower Body", equipment: "بدون وسیله" },
  { name: "گودمورنینگ", nameEn: "Good Morning", muscleGroup: "فیله کمری", group: "Lower Body", equipment: "هالتر" },
  { name: "اسپلیت اسکوات", nameEn: "Split Squat", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "استپ‌آپ", nameEn: "Step Up", muscleGroup: "پا", group: "Lower Body", equipment: "دمبل" },
  { name: "باکس جامپ", nameEn: "Box Jump", muscleGroup: "پا", group: "Lower Body", equipment: "بدون وسیله" },

  // ===== Chest =====
  { name: "پرس سینه هالتر", nameEn: "Barbell Bench Press", muscleGroup: "سینه", group: "Upper Body", equipment: "هالتر" },
  { name: "پرس سینه دمبل", nameEn: "Dumbbell Bench Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "پرس بالا سینه هالتر", nameEn: "Incline Bench Press", muscleGroup: "سینه", group: "Upper Body", equipment: "هالتر" },
  { name: "پرس بالا سینه دمبل", nameEn: "Incline Dumbbell Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "پرس پایین سینه هالتر", nameEn: "Decline Bench Press", muscleGroup: "سینه", group: "Upper Body", equipment: "هالتر" },
  { name: "پرس پایین سینه دمبل", nameEn: "Decline Dumbbell Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "فلای سینه دمبل", nameEn: "Dumbbell Fly", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "فلای سینه دستگاه", nameEn: "Cable Fly", muscleGroup: "سینه", group: "Upper Body", equipment: "دستگاه" },
  { name: "فلای بالا سینه", nameEn: "Incline Fly", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "کراس اور", nameEn: "Cable Crossover", muscleGroup: "سینه", group: "Upper Body", equipment: "دستگاه" },
  { name: "پول‌اور دمبل", nameEn: "Dumbbell Pullover", muscleGroup: "سینه", group: "Upper Body", equipment: "دمبل" },
  { name: "پول‌اور هالتر", nameEn: "Barbell Pullover", muscleGroup: "سینه", group: "Upper Body", equipment: "هالتر" },
  { name: "پرس سینه دستگاه", nameEn: "Machine Chest Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دستگاه" },
  { name: "پرس بالا سینه دستگاه", nameEn: "Machine Incline Press", muscleGroup: "سینه", group: "Upper Body", equipment: "دستگاه" },
  { name: "پوش‌آپ", nameEn: "Push Up", muscleGroup: "سینه", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "پوش‌آپ بالا سینه", nameEn: "Incline Push Up", muscleGroup: "سینه", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "پوش‌آپ پایین سینه", nameEn: "Decline Push Up", muscleGroup: "سینه", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "پوش‌آپ دست جمع", nameEn: "Close Grip Push Up", muscleGroup: "سینه", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "پوش‌آپ الماسی", nameEn: "Diamond Push Up", muscleGroup: "سینه", group: "Upper Body", equipment: "بدون وسیله" },

  // ===== Back =====
  { name: "بارفیکس", nameEn: "Pull Up", muscleGroup: "پشت", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "بارفیکس معکوس", nameEn: "Chin Up", muscleGroup: "پشت", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "بارفیکس دست باز", nameEn: "Wide Pull Up", muscleGroup: "پشت", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "لت پول‌داون", nameEn: "Lat Pulldown", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "لت پول‌داون دست جمع", nameEn: "Close Grip Pulldown", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "لت پول‌داون دست باز", nameEn: "Wide Grip Pulldown", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "قایقی هالتر", nameEn: "Barbell Row", muscleGroup: "پشت", group: "Upper Body", equipment: "هالتر" },
  { name: "قایقی دمبل یک دست", nameEn: "Dumbbell Row", muscleGroup: "پشت", group: "Upper Body", equipment: "دمبل" },
  { name: "قایقی هالتر خمیده", nameEn: "Bent Over Row", muscleGroup: "پشت", group: "Upper Body", equipment: "هالتر" },
  { name: "قایقی تی‌بار", nameEn: "T-Bar Row", muscleGroup: "پشت", group: "Upper Body", equipment: "هالتر" },
  { name: "قایقی دستگاه", nameEn: "Seated Cable Row", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "قایقی سیم‌کش", nameEn: "Cable Row", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "شراگ هالتر", nameEn: "Barbell Shrug", muscleGroup: "پشت", group: "Upper Body", equipment: "هالتر" },
  { name: "شراگ دمبل", nameEn: "Dumbbell Shrug", muscleGroup: "پشت", group: "Upper Body", equipment: "دمبل" },
  { name: "فیس پول", nameEn: "Face Pull", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "کشش لت دستگاه", nameEn: "Straight Arm Pulldown", muscleGroup: "پشت", group: "Upper Body", equipment: "دستگاه" },
  { name: "ددلیفت هالتر", nameEn: "Barbell Deadlift", muscleGroup: "پشت", group: "Lower Body", equipment: "هالتر" },

  // ===== Shoulders =====
  { name: "پرس سرشانه هالتر", nameEn: "Barbell Shoulder Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "هالتر" },
  { name: "پرس سرشانه دمبل", nameEn: "Dumbbell Shoulder Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دمبل" },
  { name: "پرس سرشانه دستگاه", nameEn: "Machine Shoulder Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دستگاه" },
  { name: "پرس آرنولدی", nameEn: "Arnold Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دمبل" },
  { name: "نشر از جلو هالتر", nameEn: "Barbell Front Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "هالتر" },
  { name: "نشر از جلو دمبل", nameEn: "Dumbbell Front Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دمبل" },
  { name: "نشر از جلو دستگاه", nameEn: "Cable Front Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دستگاه" },
  { name: "نشر از جانب دمبل", nameEn: "Dumbbell Lateral Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دمبل" },
  { name: "نشر از جانب دستگاه", nameEn: "Cable Lateral Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دستگاه" },
  { name: "نشر خمیده دمبل", nameEn: "Bent Over Lateral Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دمبل" },
  { name: "نشر خمیده دستگاه", nameEn: "Cable Bent Over Raise", muscleGroup: "سرشانه", group: "Upper Body", equipment: "دستگاه" },
  { name: "کلیور", nameEn: "Clean and Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "هالتر" },
  { name: "نشر هالتر ایستاده", nameEn: "Standing Shoulder Press", muscleGroup: "سرشانه", group: "Upper Body", equipment: "هالتر" },

  // ===== Biceps =====
  { name: "جلوبازو هالتر", nameEn: "Barbell Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "هالتر" },
  { name: "جلوبازو دمبل ایستاده", nameEn: "Standing Dumbbell Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو دمبل نشسته", nameEn: "Seated Dumbbell Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو چکشی", nameEn: "Hammer Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو سیم‌کش", nameEn: "Cable Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دستگاه" },
  { name: "جلوبازو متمرکز", nameEn: "Concentration Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو پیشانی هالتر", nameEn: "Preacher Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "هالتر" },
  { name: "جلوبازو پیشانی دمبل", nameEn: "Dumbbell Preacher Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو معکوس", nameEn: "Reverse Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "هالتر" },
  { name: "جلوبازو دوسر دمبل", nameEn: "Incline Dumbbell Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "جلوبازو دستگاه", nameEn: "Machine Curl", muscleGroup: "جلو بازو", group: "Upper Body", equipment: "دستگاه" },

  // ===== Triceps =====
  { name: "پشت بازو هالتر خوابیده", nameEn: "Skull Crusher", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "هالتر" },
  { name: "پشت بازو دمبل خوابیده", nameEn: "Lying Dumbbell Triceps Extension", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "پشت بازو دمبل ایستاده", nameEn: "Overhead Triceps Extension", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "پشت بازو سیم‌کش", nameEn: "Triceps Pushdown", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دستگاه" },
  { name: "پشت بازو سیم‌کش معکوس", nameEn: "Reverse Triceps Pushdown", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دستگاه" },
  { name: "پشت بازو کیک‌بک", nameEn: "Triceps Kickback", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دمبل" },
  { name: "دیپس", nameEn: "Dips", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "بدون وسیله" },
  { name: "دیپس دستگاه", nameEn: "Machine Dips", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دستگاه" },
  { name: "پرس دست جمع هالتر", nameEn: "Close Grip Bench Press", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "هالتر" },
  { name: "پشت بازو بالای سر دستگاه", nameEn: "Cable Overhead Triceps", muscleGroup: "پشت بازو", group: "Upper Body", equipment: "دستگاه" },

  // ===== Core / Abs =====
  { name: "کرانچ", nameEn: "Crunch", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "کرانچ معکوس", nameEn: "Reverse Crunch", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "کرانچ دوچرخه", nameEn: "Bicycle Crunch", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "پلانک", nameEn: "Plank", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "پلانک پهلو", nameEn: "Side Plank", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "بالا آوردن پا", nameEn: "Leg Raise", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "بالا آوردن پا آویزان", nameEn: "Hanging Leg Raise", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "روسی توئیست", nameEn: "Russian Twist", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "کرانچ دستگاه", nameEn: "Cable Crunch", muscleGroup: "شکم", group: "Core", equipment: "دستگاه" },
  { name: "کرانچ شکم دستگاه", nameEn: "Machine Crunch", muscleGroup: "شکم", group: "Core", equipment: "دستگاه" },
  { name: "کوهنوردی", nameEn: "Mountain Climber", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "توپ شکم", nameEn: "Stability Ball Crunch", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "دویدن در محل", nameEn: "High Knees", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "وی-آپ", nameEn: "V-Up", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },
  { name: "فلاتر کیک", nameEn: "Flutter Kicks", muscleGroup: "شکم", group: "Core", equipment: "بدون وسیله" },

  // ===== Cardio / Mobility =====
  { name: "تردمیل", nameEn: "Treadmill", muscleGroup: "قلبی", group: "Cardio", equipment: "دستگاه" },
  { name: "دوچرخه ثابت", nameEn: "Stationary Bike", muscleGroup: "قلبی", group: "Cardio", equipment: "دستگاه" },
  { name: "اسکی فضایی", nameEn: "Elliptical", muscleGroup: "قلبی", group: "Cardio", equipment: "دستگاه" },
  { name: "پارویی", nameEn: "Rowing Machine", muscleGroup: "قلبی", group: "Cardio", equipment: "دستگاه" },
  { name: "طناب زدن", nameEn: "Jump Rope", muscleGroup: "قلبی", group: "Cardio", equipment: "بدون وسیله" },
  { name: "برپی", nameEn: "Burpee", muscleGroup: "قلبی", group: "Cardio", equipment: "بدون وسیله" },
  { name: "دویدن", nameEn: "Running", muscleGroup: "قلبی", group: "Cardio", equipment: "بدون وسیله" },
  { name: "حرکت کششی کمر", nameEn: "Cat Cow Stretch", muscleGroup: "کمر", group: "Mobility", equipment: "بدون وسیله" },
  { name: "حرکت کششی لانج", nameEn: "Lunge Stretch", muscleGroup: "پا", group: "Mobility", equipment: "بدون وسیله" },
  { name: "کشش همسترینگ", nameEn: "Hamstring Stretch", muscleGroup: "همسترینگ", group: "Mobility", equipment: "بدون وسیله" },
  { name: "کشش شانه", nameEn: "Shoulder Stretch", muscleGroup: "سرشانه", group: "Mobility", equipment: "بدون وسیله" },
  { name: "باز کردن سینه", nameEn: "Chest Opener", muscleGroup: "سینه", group: "Mobility", equipment: "بدون وسیله" },
  { name: "کشش کشاله ران", nameEn: "Groin Stretch", muscleGroup: "پا", group: "Mobility", equipment: "بدون وسیله" },
  { name: "چرخش ستون فقرات", nameEn: "Spine Twist", muscleGroup: "شکم", group: "Mobility", equipment: "بدون وسیله" },
];

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
    data: exercises.map((exercise) => ({
      ...exercise,
      createdBy: admin.id,
    })),
    skipDuplicates: true,
  });

  const count = await prisma.exercise.count();
  console.log(`✅ Seed completed: ${count} exercises`);

  // ===== Seed Program Templates =====
  await seedTemplates(prisma);
}

async function seedTemplates(prisma: PrismaClient) {
  const coach = await prisma.user.findUnique({ where: { email: "coach@fitcoach.local" } });
  if (!coach) return;

  const allExercises = await prisma.exercise.findMany();
  const exMap = new Map(allExercises.map((e) => [e.nameEn, e]));
  const ex = (nameEn: string) => {
    const found = exMap.get(nameEn);
    if (!found) {
      console.warn(`⚠ Exercise not found: "${nameEn}" — skipping`);
      return null;
    }
    return found;
  };

  const existingTemplates = await prisma.programTemplate.count();
  if (existingTemplates > 0) {
    console.log(`⏭️  ${existingTemplates} templates already exist, skipping template seed`);
    return;
  }

  // ——— Template 1: Full Body Beginner ———
  const fullBody = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      title: "شروع کامل بدن",
      description: "برنامه‌ای مناسب برای مبتدیان - تمرین کامل بدن در هر جلسه",
      difficultyLevel: "beginner",
      suggestedForGoal: "general_fitness",
      suggestedForLevel: "beginner",
      suggestedTrainingDays: 3,
      isPublic: true,
      plan: { type: "full_body", focus: "general_fitness" },
      weeks: {
        create: [1, 2, 3, 4].map((weekNum) => ({
          weekNumber: weekNum,
          title: `هفته ${weekNum}`,
          days: {
            create: [
              {
                dayNumber: 1,
                title: "تمرین A",
                exercises: {
                  create: [
                    { exerciseId: ex("Barbell Squat")!.id, orderIndex: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Barbell Bench Press")!.id, orderIndex: 2, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Dumbbell Row")!.id, orderIndex: 3, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Dumbbell Shoulder Press")!.id, orderIndex: 4, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Plank")!.id, orderIndex: 5, sets: 3, repsMin: 20, repsMax: 60, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 2,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 3,
                title: "تمرین B",
                exercises: {
                  create: [
                    { exerciseId: ex("Deadlift")!.id, orderIndex: 1, sets: 3, repsMin: 6, repsMax: 10, restSeconds: 90 },
                    { exerciseId: ex("Incline Dumbbell Press")!.id, orderIndex: 2, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Lat Pulldown")!.id, orderIndex: 3, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Dumbbell Lateral Raise")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Leg Raise")!.id, orderIndex: 5, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 4,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 5,
                title: "تمرین C",
                exercises: {
                  create: [
                    { exerciseId: ex("Dumbbell Squat")!.id, orderIndex: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Dumbbell Bench Press")!.id, orderIndex: 2, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Seated Cable Row")!.id, orderIndex: 3, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Barbell Curl")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Triceps Pushdown")!.id, orderIndex: 5, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                  ],
                },
              },
              {
                dayNumber: 6,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 7,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
            ],
          },
        })),
      },
    },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
  });
  console.log(`✅ Template created: "${fullBody.title}"`);

  // ——— Template 2: Push / Pull / Legs ———
  const ppl = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      title: "فشار / کشش / پا (PPL)",
      description: "برنامه پیشرفته جلو و پشت بازو - ۶ جلسه در هفته",
      difficultyLevel: "intermediate",
      suggestedForGoal: "muscle_gain",
      suggestedForLevel: "intermediate",
      suggestedTrainingDays: 6,
      isPublic: true,
      plan: { type: "ppl", focus: "hypertrophy" },
      weeks: {
        create: [1, 2, 3, 4].map((weekNum) => ({
          weekNumber: weekNum,
          title: `هفته ${weekNum}`,
          days: {
            create: [
              {
                dayNumber: 1,
                title: "فشار (Push)",
                exercises: {
                  create: [
                    { exerciseId: ex("Barbell Bench Press")!.id, orderIndex: 1, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 90 },
                    { exerciseId: ex("Incline Dumbbell Press")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Dumbbell Shoulder Press")!.id, orderIndex: 3, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Dumbbell Lateral Raise")!.id, orderIndex: 4, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Skull Crusher")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Triceps Pushdown")!.id, orderIndex: 6, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 2,
                title: "کشش (Pull)",
                exercises: {
                  create: [
                    { exerciseId: ex("Deadlift")!.id, orderIndex: 1, sets: 4, repsMin: 5, repsMax: 8, restSeconds: 120 },
                    { exerciseId: ex("Pull Up")!.id, orderIndex: 2, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 90 },
                    { exerciseId: ex("Barbell Row")!.id, orderIndex: 3, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Face Pull")!.id, orderIndex: 4, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Barbell Curl")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Hammer Curl")!.id, orderIndex: 6, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 3,
                title: "پا (Legs)",
                exercises: {
                  create: [
                    { exerciseId: ex("Barbell Squat")!.id, orderIndex: 1, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 120 },
                    { exerciseId: ex("Romanian Deadlift")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Leg Extension")!.id, orderIndex: 3, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Leg Curl")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Standing Calf Raise")!.id, orderIndex: 5, sets: 4, repsMin: 12, repsMax: 20, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 4,
                title: "فشار (Push)",
                exercises: {
                  create: [
                    { exerciseId: ex("Overhead Triceps Extension")!.id, orderIndex: 1, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Decline Dumbbell Press")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Push Up")!.id, orderIndex: 3, sets: 3, repsMin: 12, repsMax: 20, restSeconds: 60 },
                    { exerciseId: ex("Dumbbell Front Raise")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Cable Fly")!.id, orderIndex: 5, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Dips")!.id, orderIndex: 6, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                  ],
                },
              },
              {
                dayNumber: 5,
                title: "کشش (Pull)",
                exercises: {
                  create: [
                    { exerciseId: ex("Chin Up")!.id, orderIndex: 1, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 90 },
                    { exerciseId: ex("T-Bar Row")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Straight Arm Pulldown")!.id, orderIndex: 3, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Dumbbell Shrug")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Preacher Curl")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Reverse Curl")!.id, orderIndex: 6, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 6,
                title: "پا (Legs)",
                exercises: {
                  create: [
                    { exerciseId: ex("Front Squat")!.id, orderIndex: 1, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 120 },
                    { exerciseId: ex("Bulgarian Split Squat")!.id, orderIndex: 2, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Hip Thrust")!.id, orderIndex: 3, sets: 4, repsMin: 10, repsMax: 15, restSeconds: 75 },
                    { exerciseId: ex("Lunges")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Seated Calf Raise")!.id, orderIndex: 5, sets: 4, repsMin: 12, repsMax: 20, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 7,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
            ],
          },
        })),
      },
    },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
  });
  console.log(`✅ Template created: "${ppl.title}"`);

  // ——— Template 3: Upper / Lower Split ———
  const upperLower = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      title: "بالا تنه / پایین تنه",
      description: "برنامه ۴ جلسه‌ای بالا و پایین تنه برای افزایش قدرت",
      difficultyLevel: "intermediate",
      suggestedForGoal: "strength",
      suggestedForLevel: "intermediate",
      suggestedTrainingDays: 4,
      isPublic: true,
      plan: { type: "upper_lower", focus: "strength" },
      weeks: {
        create: [1, 2, 3, 4].map((weekNum) => ({
          weekNumber: weekNum,
          title: `هفته ${weekNum}`,
          days: {
            create: [
              {
                dayNumber: 1,
                title: "بالا تنه (قدرتی)",
                exercises: {
                  create: [
                    { exerciseId: ex("Barbell Bench Press")!.id, orderIndex: 1, sets: 5, repsMin: 3, repsMax: 6, restSeconds: 120 },
                    { exerciseId: ex("Barbell Row")!.id, orderIndex: 2, sets: 5, repsMin: 3, repsMax: 6, restSeconds: 120 },
                    { exerciseId: ex("Dumbbell Shoulder Press")!.id, orderIndex: 3, sets: 4, repsMin: 6, repsMax: 10, restSeconds: 90 },
                    { exerciseId: ex("Pull Up")!.id, orderIndex: 4, sets: 4, repsMin: 5, repsMax: 8, restSeconds: 90 },
                    { exerciseId: ex("Barbell Curl")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Dips")!.id, orderIndex: 6, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                  ],
                },
              },
              {
                dayNumber: 2,
                title: "پایین تنه (قدرتی)",
                exercises: {
                  create: [
                    { exerciseId: ex("Barbell Squat")!.id, orderIndex: 1, sets: 5, repsMin: 3, repsMax: 6, restSeconds: 120 },
                    { exerciseId: ex("Deadlift")!.id, orderIndex: 2, sets: 4, repsMin: 3, repsMax: 6, restSeconds: 120 },
                    { exerciseId: ex("Leg Press")!.id, orderIndex: 3, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Leg Curl")!.id, orderIndex: 4, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Standing Calf Raise")!.id, orderIndex: 5, sets: 4, repsMin: 10, repsMax: 15, restSeconds: 60 },
                  ],
                },
              },
              {
                dayNumber: 3,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 4,
                title: "بالا تنه (حجمی)",
                exercises: {
                  create: [
                    { exerciseId: ex("Incline Dumbbell Press")!.id, orderIndex: 1, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Lat Pulldown")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Dumbbell Lateral Raise")!.id, orderIndex: 3, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Seated Cable Row")!.id, orderIndex: 4, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 75 },
                    { exerciseId: ex("Skull Crusher")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Hammer Curl")!.id, orderIndex: 6, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                  ],
                },
              },
              {
                dayNumber: 5,
                title: "پایین تنه (حجمی)",
                exercises: {
                  create: [
                    { exerciseId: ex("Dumbbell Squat")!.id, orderIndex: 1, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Romanian Deadlift")!.id, orderIndex: 2, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
                    { exerciseId: ex("Walking Lunges")!.id, orderIndex: 3, sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Leg Extension")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Seated Calf Raise")!.id, orderIndex: 5, sets: 4, repsMin: 12, repsMax: 20, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 6,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 7,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
            ],
          },
        })),
      },
    },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
  });
  console.log(`✅ Template created: "${upperLower.title}"`);

  // ——— Template 4: Weight Loss & Conditioning ———
  const weightLoss = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      title: "کاهش وزن و آمادگی جسمانی",
      description: "برنامه تلفیقی قدرتی و هوازی برای چربی سوزی حداکثری",
      difficultyLevel: "beginner",
      suggestedForGoal: "weight_loss",
      suggestedForLevel: "beginner",
      suggestedTrainingDays: 4,
      isPublic: true,
      plan: { type: "circuit", focus: "fat_loss" },
      weeks: {
        create: [1, 2, 3, 4].map((weekNum) => ({
          weekNumber: weekNum,
          title: `هفته ${weekNum}`,
          days: {
            create: [
              {
                dayNumber: 1,
                title: "تمرین تناوبی A",
                exercises: {
                  create: [
                    { exerciseId: ex("Jump Squat")!.id, orderIndex: 1, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Push Up")!.id, orderIndex: 2, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Dumbbell Row")!.id, orderIndex: 3, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Mountain Climber")!.id, orderIndex: 4, sets: 3, repsMin: 20, repsMax: 30, restSeconds: 30 },
                    { exerciseId: ex("Burpee")!.id, orderIndex: 5, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 30 },
                    { exerciseId: ex("Plank")!.id, orderIndex: 6, sets: 3, repsMin: 30, repsMax: 60, restSeconds: 30 },
                  ],
                },
              },
              {
                dayNumber: 2,
                title: "کار هوازی",
                exercises: {
                  create: [
                    { exerciseId: ex("Treadmill")!.id, orderIndex: 1, sets: 1, repsMin: 20, repsMax: 30, restSeconds: 0, notes: "۲۰-۳۰ دقیقه با شدت متوسط" },
                    { exerciseId: ex("Rowing Machine")!.id, orderIndex: 2, sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, notes: "۱۰-۱۵ دقیقه پارویی" },
                    { exerciseId: ex("Hamstring Stretch")!.id, orderIndex: 3, sets: 2, repsMin: 30, repsMax: 30, restSeconds: 0, notes: "کشش پایانی ۳۰ ثانیه" },
                  ],
                },
              },
              {
                dayNumber: 3,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 4,
                title: "تمرین تناوبی B",
                exercises: {
                  create: [
                    { exerciseId: ex("Goblet Squat")!.id, orderIndex: 1, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Incline Push Up")!.id, orderIndex: 2, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Dumbbell Deadlift")!.id, orderIndex: 3, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 30 },
                    { exerciseId: ex("Bicycle Crunch")!.id, orderIndex: 4, sets: 3, repsMin: 15, repsMax: 20, restSeconds: 30 },
                    { exerciseId: ex("Jump Rope")!.id, orderIndex: 5, sets: 3, repsMin: 30, repsMax: 60, restSeconds: 30 },
                    { exerciseId: ex("Glute Bridge")!.id, orderIndex: 6, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 30 },
                  ],
                },
              },
              {
                dayNumber: 5,
                title: "کار هوازی",
                exercises: {
                  create: [
                    { exerciseId: ex("Stationary Bike")!.id, orderIndex: 1, sets: 1, repsMin: 20, repsMax: 30, restSeconds: 0, notes: "۲۰-۳۰ دقیقه با شدت متوسط" },
                    { exerciseId: ex("Elliptical")!.id, orderIndex: 2, sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, notes: "۱۰-۱۵ دقیقه الپتیکال" },
                    { exerciseId: ex("Shoulder Stretch")!.id, orderIndex: 3, sets: 2, repsMin: 30, repsMax: 30, restSeconds: 0, notes: "کشش پایانی ۳۰ ثانیه" },
                  ],
                },
              },
              {
                dayNumber: 6,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 7,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
            ],
          },
        })),
      },
    },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
  });
  console.log(`✅ Template created: "${weightLoss.title}"`);

  // ——— Template 5: Home Bodyweight ———
  const homeWorkout = await prisma.programTemplate.create({
    data: {
      coachId: coach.id,
      title: "تمرین در خانه (بدون وسیله)",
      description: "برنامه‌ای کامل با تمرینات وزن بدن - مناسب برای تمرین در خانه",
      difficultyLevel: "beginner",
      suggestedForGoal: "general_fitness",
      suggestedForLevel: "beginner",
      suggestedTrainingDays: 3,
      isPublic: true,
      plan: { type: "bodyweight", focus: "general_fitness" },
      weeks: {
        create: [1, 2, 3, 4].map((weekNum) => ({
          weekNumber: weekNum,
          title: `هفته ${weekNum}`,
          days: {
            create: [
              {
                dayNumber: 1,
                title: "تمرین A",
                exercises: {
                  create: [
                    { exerciseId: ex("Goblet Squat")!.id, orderIndex: 1, sets: 3, repsMin: 12, repsMax: 20, restSeconds: 60 },
                    { exerciseId: ex("Push Up")!.id, orderIndex: 2, sets: 3, repsMin: 8, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Lunges")!.id, orderIndex: 3, sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Plank")!.id, orderIndex: 4, sets: 3, repsMin: 20, repsMax: 45, restSeconds: 45 },
                    { exerciseId: ex("Glute Bridge")!.id, orderIndex: 5, sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45 },
                  ],
                },
              },
              {
                dayNumber: 2,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 3,
                title: "تمرین B",
                exercises: {
                  create: [
                    { exerciseId: ex("Incline Push Up")!.id, orderIndex: 1, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60 },
                    { exerciseId: ex("Diamond Push Up")!.id, orderIndex: 2, sets: 3, repsMin: 6, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("High Knees")!.id, orderIndex: 3, sets: 3, repsMin: 20, repsMax: 30, restSeconds: 30 },
                    { exerciseId: ex("Leg Raise")!.id, orderIndex: 4, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Russian Twist")!.id, orderIndex: 5, sets: 3, repsMin: 12, repsMax: 20, restSeconds: 30 },
                  ],
                },
              },
              {
                dayNumber: 4,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 5,
                title: "تمرین C",
                exercises: {
                  create: [
                    { exerciseId: ex("Burpee")!.id, orderIndex: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 45 },
                    { exerciseId: ex("Jump Squat")!.id, orderIndex: 2, sets: 3, repsMin: 10, repsMax: 15, restSeconds: 45 },
                    { exerciseId: ex("Decline Push Up")!.id, orderIndex: 3, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
                    { exerciseId: ex("Mountain Climber")!.id, orderIndex: 4, sets: 3, repsMin: 20, repsMax: 30, restSeconds: 30 },
                    { exerciseId: ex("Side Plank")!.id, orderIndex: 5, sets: 3, repsMin: 20, repsMax: 40, restSeconds: 30 },
                    { exerciseId: ex("Flutter Kicks")!.id, orderIndex: 6, sets: 3, repsMin: 15, repsMax: 20, restSeconds: 30 },
                  ],
                },
              },
              {
                dayNumber: 6,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
              {
                dayNumber: 7,
                title: "استراحت",
                dayType: "rest",
                exercises: { create: [] },
              },
            ],
          },
        })),
      },
    },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
  });
  console.log(`✅ Template created: "${homeWorkout.title}"`);

  const templateCount = await prisma.programTemplate.count();
  console.log(`✅ Seed completed: ${templateCount} program templates`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
