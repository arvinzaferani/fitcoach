# مستند فنی پروژه FitCoach — نسخه «به‌همان‌شکل‌ساخته‌شده» (As-Built)

این مستند وضعیت واقعی و فعلی پروژه **FitCoach** را توصیف می‌کند؛ نه نقشه راه اولیه. هر بخش بر اساس کد موجود در مخزن نوشته شده است.

---

## فهرست مطالب
1. [معرفی پروژه](#معرفی-پروژه)
2. [معماری فنی](#معماری-فنی)
3. [مدل داده‌ها](#مدل-دادهها)
4. [ماژول‌ها و فیچرهای پیاده‌سازی‌شده](#ماژولها-و-فیچرهای-پیادهسازیشده)
5. [API‌ها](#apiها)
6. [روت‌های فرانت‌اند](#روتهای-فرانتاند)
7. [کامپوننت‌های UI](#کامپوننتهای-ui)
8. [مقادیر محیطی (Env) و سرویس‌های Docker](#مقادیر-محیطی-env-و-سرویسهای-docker)
9. [داده‌های Seed و اکانت‌های دمو](#دادههای-seed-و-اکانتهای-دمو)
10. [مراحل اجرا](#مراحل-اجرا)
11. [اسکریپت‌ها](#اسکریپتها)
12. [ساختار پروژه](#ساختار-پروژه)

---

## معرفی پروژه

**FitCoach** یک پلتفرم تحت وب فارسی‌زبان و راست‌چین برای مدیریت تمرینات بین مربی و ورزشکار است.

- **ادمین**: مدیریت کتابخانه حرکات پایه (اطلاعات + GIF)
- **مربی**: ساخت تمپلیت برنامه، مدیریت شاگردان، تخصیص و کاستومایز برنامه
- **ورزشکار**: مشاهده برنامه، ثبت تمرین، مدیریت متریک‌ها

---

## معماری فنی

| لایه | تکنولوژی | نسخه |
|------|-----------|------|
| فرانت‌اند | Next.js (App Router) + React + TypeScript | Next 14.2 |
| بک‌اند | NestJS + TypeScript | 10.x |
| دیتابیس | PostgreSQL | 16 |
| ORM | Prisma | 5.13 |
| احراز هویت | JWT (Passport) + bcrypt | — |
| ذخیره فایل | MinIO (S3-compatible) با URL های Pre-signed | — |
| استایل | Tailwind CSS + Recharts | 3.4 / 3.9 |
| مونورپو | npm workspaces | — |

مونورپو شامل دو ورک‌اسپیس است: `frontend` و `backend`. بک‌اند زیر پیشوند `/api` سرو می‌شود و CORS محدود به `FRONTEND_URL` است.

---

## مدل داده‌ها

اسکیمای واقعی در `backend/prisma/schema.prisma` قرار دارد.

### Enum ها

| Enum | مقادیر |
|------|--------|
| `UserRole` | `admin` ، `coach` ، `athlete` |
| `Gender` | `male` ، `female` ، `other` |
| `FitnessLevel` | `beginner` ، `intermediate` ، `advanced` ، `elite` |
| `TrainingGoal` | `weight_loss` ، `muscle_gain` ، `strength` ، `endurance` ، `general_fitness` |
| `DayType` | `workout` ، `rest` |
| `ProgramStatus` | `active` ، `completed` ، `paused` ، `cancelled` |
| `CoachAthleteInvitationStatus` | `pending` ، `accepted` ، `rejected` ، `cancelled` |

### مدل‌ها

| مدل | جدول | توضیح |
|-----|------|-------|
| `User` | `users` | کاربران با نقش و اطلاعات پایه |
| `AthleteProfile` | `athlete_profiles` | پروفایل ورزشی (جنسیت، سطح، هدف، مصدومیت‌ها) |
| `AthleteMetric` | `athlete_metrics` | ثبت متریک (وزن، درصد چربی، توده عضلانی، سن بیولوژیکال) با `recorded_by_role` |
| `Exercise` | `exercises` | حرکات ورزشی با نام فارسی/انگلیسی، گروه عضلانی و `gif_media_id` |
| `Media` | `media` | ابرداده فایل‌ها (key ،contentType ،sizeBytes) در MinIO |
| `ProgramTemplate` | `program_templates` | تمپلیت برنامه مربی (+ فیلد `plan` از نوع Json برای ساختار سریع) |
| `TemplateWeek` | `template_weeks` | هفته‌های تمپلیت (شماره هفته) |
| `TemplateDay` | `template_days` | روزهای هر هفته (`workout`/`rest`) |
| `TemplateExercise` | `template_exercises` | حرکات هر روز: ست، تکرار، استراحت، وزن پیشنهادی |
| `CoachAthleteRelation` | `coach_athlete_relations` | ارتباط مربی–ورزشکار (unique بر روی جفت) |
| `CoachAthleteInvitation` | `coach_athlete_invitations` | دعوت مربی از ورزشکار با وضعیت |
| `AthleteAssignedProgram` | `athlete_assigned_programs` | تخصیص تمپلیت به ورزشکار با تاریخ شروع/پایان و وضعیت |
| `AthleteProgramCustomization` | `athlete_program_customizations` | کاستومایز (override) ست‌ها/تکرارها/حذف حرکت برای یک ورزشکار |
| `WorkoutLog` | `workout_logs` | ثبت هر ست تمرین (تکرار، وزن، RPE، کامل/ناقص) |

نکات کلیدی:
- شاخص `idx_athlete_metrics_athlete_date` روی `(athleteId, recordedAt DESC)`.
- حذف `Exercise` یا ویرایش `gif_media_id` با `onDelete: SetNull` امن است.
- کاستومایزها روی ساختار تمپلیت اعمال (override) می‌شوند و در `workout_logs` لاگ نهایی ذخیره می‌گردد.

---

## ماژول‌ها و فیچرهای پیاده‌سازی‌شده

| ماژول | دایرکتوری بک‌اند | فیچرهای پیاده‌سازی‌شده |
|-------|------------------|------------------------|
| **Auth** | `modules/auth` | ثبت‌نام، ورود، رفرش توکن، دریافت پروفایل جاری، تغییر رمز عبور |
| **Users** | `modules/users` | endpoint سلامت |
| **Exercises** | `modules/exercises` | فهرست عمومی حرکات + جزئیات |
| **Admin Exercises** | `modules/exercises` | CRUD کامل حرکات (ادمین) |
| **Media** | `modules/media` | نمایش فایل عمومی، آپلود و حذف با pre-signed URL مینایو (ادمین) |
| **Templates** | `modules/templates` | CRUD تمپلیت مربی + کپی تمپلیت |
| **Coach–Athlete** | `modules/coach-athlete` | دعوت مربی، لیست دعوت‌ها، پذیرش، لیست مربی‌های ورزشکار |
| **Assignments** | `modules/assignments` | مدیریت شاگردان، تخصیص برنامه، کاستومایز، برنامه جاری |
| **Workouts** | `modules/workouts` | پروفایل ورزشکار، برنامه جاری، تمرین امروز/تاریخ، ثبت ست، تاریخچه |
| **Metrics** | `modules/metrics` | متریک‌های ورزشکار + ثبت/ویرایش/حذف و ثبت توسط مربی |

کنترل دسترسی با `@Roles()` + `RolesGuard` و `@Public()` برای مسیرهای عمومی انجام می‌شود. توکن‌ها با `JwtAuthGuard` و `passport-jwt` اعتبارسنجی می‌شوند.

---

## APIها

پیشوند سراسری: `/api` — نمونه: `http://localhost:3001/api/auth/login`

### Auth
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| POST | `/auth/register` | ثبت‌نام | public |
| POST | `/auth/login` | ورود و دریافت JWT | public |
| POST | `/auth/refresh` | دریافت توکن جدید | public |
| GET | `/auth/me` | اطلاعات کاربر جاری | همه |
| PUT | `/auth/change-password` | تغییر رمز عبور | همه |

### Exercises
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| GET | `/exercises` | فهرست حرکات | public |
| GET | `/exercises/:id` | جزئیات حرکت | public |

### Admin Exercises
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| GET | `/admin/exercises` | فهرست حرکات (مدیریت) | admin |
| POST | `/admin/exercises` | افزودن حرکت | admin |
| GET | `/admin/exercises/:id` | جزئیات | admin |
| PUT | `/admin/exercises/:id` | ویرایش | admin |
| DELETE | `/admin/exercises/:id` | حذف | admin |

### Media
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| GET | `/media/:id` | دریافت فایل | public |
| POST | `/admin/media/presign` | تولید pre-signed URL برای آپلود به MinIO | admin |
| DELETE | `/admin/media/:id` | حذف فایل | admin |

### Templates (مربی)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/coach/templates` | فهرست تمپلیت‌ها |
| POST | `/coach/templates` | ساخت تمپلیت |
| GET | `/coach/templates/:id` | جزئیات |
| PUT | `/coach/templates/:id` | ویرایش |
| DELETE | `/coach/templates/:id` | حذف |
| POST | `/coach/templates/:id/copy` | کپی تمپلیت |

### Coach–Athlete
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| POST | `/coach-athlete/invite` | دعوت ورزشکار | coach |
| GET | `/coach-athlete/coach/:coachId/invitations` | دعوت‌های مربی | coach |
| GET | `/coach-athlete/athlete/:athleteId/invitations` | دعوت‌های دریافتی | athlete |
| GET | `/coach-athlete/athlete/:athleteId/coaches` | مربی‌های من | athlete |
| POST | `/coach-athlete/accept` | پذیرش دعوت | athlete |

### Assignments (مربی)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/coach/athletes` | فهرست شاگردان |
| POST | `/coach/athletes/invite` | دعوت شاگرد |
| DELETE | `/coach/athletes/:id` | حذف شاگرد |
| GET | `/coach/athletes/:id/profile` | پروفایل شاگرد |
| PUT | `/coach/athletes/:id/profile` | ویرایش پروفایل |
| POST | `/coach/assign` | تخصیص تمپلیت به شاگرد |
| GET | `/coach/assignments` | فهرست تخصیص‌ها |
| GET | `/coach/assignments/:id` | جزئیات تخصیص |
| PUT | `/coach/assignments/:id/customize` | کاستومایز برنامه |
| GET | `/coach/athletes/:id/current-program` | برنامه جاری شاگرد |

### Metrics
| Method | Endpoint | توضیح | دسترسی |
|--------|----------|-------|--------|
| GET | `/athlete/metrics` | متریک‌های من | athlete |
| POST | `/athlete/metrics` | ثبت متریک جدید | athlete |
| PUT | `/athlete/metrics/:id` | ویرایش | athlete |
| DELETE | `/athlete/metrics/:id` | حذف | athlete |
| GET | `/coach/athletes/:id/metrics` | متریک‌های شاگرد | coach |
| POST | `/coach/athletes/:id/metrics` | ثبت متریک برای شاگرد | coach |

### Workouts (ورزشکار)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/athlete/profile` | پروفایل من |
| PUT | `/athlete/profile` | ویرایش پروفایل |
| GET | `/athlete/current-program` | برنامه جاری با روزهای هفته |
| GET | `/athlete/today-workout` | تمرینات امروز |
| GET | `/athlete/workout/:date` | تمرینات یک تاریخ مشخص |
| POST | `/athlete/workout/log` | ثبت یک ست تمرین |
| GET | `/athlete/workout/history` | تاریخچه تمرینات |

---

## روت‌های فرانت‌اند

| مسیر | صفحه | توضیح |
|------|------|-------|
| `/` | صفحه اصلی | لندینگ/مسیریابی |
| `/login` | ورود | فرم ورود |
| `/register` | ثبت‌نام | فرم ثبت‌نام |
| `/admin/exercises` | مدیریت حرکات | فهرست حرکات (ادمین) |
| `/admin/exercises/new` | ساخت حرکت | فرم ساخت |
| `/admin/exercises/:id/edit` | ویرایش حرکت | فرم ویرایش |
| `/coach/dashboard` | داشبورد مربی | نمای کلی |
| `/coach/athletes` | لیست شاگردان | مدیریت شاگردان |
| `/coach/athletes/:id` | پروفایل شاگرد | جزئیات شاگرد |
| `/coach/templates` | کتابخانه تمپلیت‌ها | فهرست |
| `/coach/templates/create` | ساخت تمپلیت | ویزارد ساخت |
| `/coach/assign` | تخصیص برنامه | تخصیص به شاگرد |
| `/athlete/dashboard` | داشبورد ورزشکار | تمرین امروز و پیشرفت |
| `/athlete/workout` | برنامه تمرین | نمای برنامه |
| `/athlete/workout/:dayId` | اجرای تمرین | ثبت ست‌ها با تایمر |
| `/athlete/metrics` | متریک‌های من | ثبت و نمودارها |
| `/athlete/coaches` | مربی‌های من | لیست مربی‌ها |

چیدمان ریشه (`app/layout.tsx`) با `dir="rtl"` ،`lang="fa"` و فونت **Vazirmatn** بارگذاری می‌شود و از حالت روشن/تیره پشتیبانی می‌کند.

---

## کامپوننت‌های UI

| کامپوننت | نقش |
|----------|-----|
| `AppShell` | قاب اصلی داشبورد با ناوبری |
| `AuthGuard` | محافظت از روت‌های نیازمند ورود |
| `ThemeToggle` | تغییر تم روشن/تیره |
| `WorkoutCard` | کارت نمایش حرکت در تمرین |
| `SetTimer` | تایمر استراحت بین ست‌ها |
| `SetLogger` | فرم ثبت ست (وزن، تکرار، RPE) |
| `WorkoutProgress` | نمایش پیشرفت تمرین روز |
| `MetricChart` | نمودار متریک‌ها (Recharts) |
| `StatCard` | کارت آمار |
| `GifDisplay` | نمایش GIF حرکت |
| `FileUploader` | آپلود فایل (با pre-signed URL) |
| `DateTimePicker` | انتخاب تاریخ/زمان |

لایه‌های کمکی در `frontend/lib`: کلاینت API (`api.ts`)، مدیریت auth (`auth.ts`)، media (`media.ts`)، منطق برنامه تمرینی (`workout-plan.ts`، `template-plans.ts`)، کاتالوگ حرکات (`exercise-catalog.ts`) و داده‌های mock.

---

## مقادیر محیطی (Env) و سرویس‌های Docker

### `.env` ریشه (نمونه: `.env.example`)
| کلید | پیش‌فرض |
|------|---------|
| `DATABASE_URL` | `postgresql://fitcoach:fitcoach@localhost:5432/fitcoach?schema=public` |
| `PORT` | `3001` |
| `FRONTEND_URL` | `http://localhost:3000` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | مقدار محلی |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | `15m` / `7d` |
| `MINIO_ENDPOINT` / `MINIO_PUBLIC_BASE_URL` | `http://localhost:9002` / `.../fitcoach-media` |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `fitcoach` / `fitcoach123` |
| `MINIO_BUCKET` | `fitcoach-media` |
| `MINIO_PRESIGN_EXPIRES_SECONDS` | `900` |
| `MAX_EXERCISE_GIF_BYTES` | `26214400` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

### سرویس‌های Docker (`docker-compose.yml`)
| سرویس | پورت | توضیح |
|-------|------|-------|
| `postgres` | `5432` | PostgreSQL 16 |
| `adminer` | `8080` | رابط مدیریت دیتابیس |
| `minio` | `9000` / `9001` | API / کنسول MinIO |
| `minio-init` | — | ساخت bucket، CORS و دسترسی عمومی برای `fitcoach-media` |

---

## داده‌های Seed و اکانت‌های دمو

`npm run prisma:seed` موارد زیر را ایجاد می‌کند:

- سه کاربر دمو با رمز عبور `Fit123!@`:

| نقش | ایمیل | نام |
|-----|-------|-----|
| admin | `admin@fitcoach.local` | ادمین FitCoach |
| coach | `coach@fitcoach.local` | مربی نمونه |
| athlete | `athlete@fitcoach.local` | ورزشکار نمونه |

- کتابخانه حرکات شامل ۲۰۰+ حرکت در گروه‌های پایین‌تنه، سینه، پشت، سرشانه، بازو، شکم و ... با نام فارسی/انگلیسی، گروه عضلانی و وسیله.
- پنج تمپلیت برنامه نمونه: **Full Body** ،**PPL** ،**Upper/Lower** ،**Weight Loss** و **Home Workout**.
- پروفایل ورزشکار برای اکانت دمو.

---

## مراحل اجرا

پیش‌نیاز: Node.js 18+ و Docker.

```bash
cp .env.example .env
npm install
docker compose up -d postgres adminer minio minio-init
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

---

## اسکریپت‌ها

| اسکریپت | توضیح |
|---------|-------|
| `npm run dev` | فرانت‌اند (development) |
| `npm run dev:frontend` | فرانت‌اند |
| `npm run dev:backend` | بک‌اند با watch mode |
| `npm run build` | build همه ورک‌اسپیس‌ها |
| `npm run lint` | lint همه ورک‌اسپیس‌ها |
| `npm run prisma:generate` | تولید Prisma Client |
| `npm run prisma:migrate` | اعمال migration ها |
| `npm run prisma:seed` | seed کردن داده‌ها |

---

## ساختار پروژه

```text
gym/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── login/ register/   # احراز هویت
│   │   ├── admin/             # مدیریت حرکات
│   │   ├── coach/             # داشبورد، تمپلیت‌ها، شاگردان، تخصیص
│   │   └── athlete/           # داشبورد، تمرین، متریک‌ها، مربی‌ها
│   ├── components/            # کامپوننت‌های مشترک و UI
│   ├── lib/                   # کلاینت API، utilities، داده
│   └── types/                 # تایپ‌های دامنه
├── backend/                   # NestJS API
│   ├── src/
│   │   ├── modules/           # auth, users, media, exercises, templates,
│   │   │                      # coach-athlete, assignments, workouts, metrics
│   │   ├── common/            # guards، decorator ها
│   │   └── prisma/            # سرویس Prisma
│   └── prisma/
│       ├── schema.prisma      # مدل‌های دیتابیس
│       ├── migrations/
│       └── seed.ts            # حرکات، تمپلیت‌ها و کاربران دمو
└── docker-compose.yml         # PostgreSQL، Adminer، MinIO
```

---

*نسخه مستند: 1.1.0 (as-built) — وضعیت: همگام با کد مخزن.*
