# مستند فنی پروژه FitCoach - اپلیکیشن مربی و ورزشکار

## 📋 فهرست مطالب
1. [معرفی پروژه](#معرفی-پروژه)
2. [معماری فنی](#معماری-فنی)
3. [مدل داده‌ها](#مدل-دادهها)
4. [ماژول‌ها و فیچرها](#ماژولها-و-فیچرها)
5. [API‌ها](#apiها)
6. [فلوهای کاربری](#فلوهای-کاربری)
7. [دیزاین UI/UX](#دیزاین-uiux)
8. [نکات پیاده‌سازی](#نکات-پیادهسازی)
9. [مراحل اجرا](#مراحل-اجرا)

---

## معرفی پروژه

### نام پروژه
**FitCoach** - پلتفرم مدیریت تمرینات بین مربی و ورزشکار

### خلاصه
سیستم تحت وب که به مربیان اجازه می‌دهد برنامه‌های تمرینی طراحی کرده، به ورزشکاران تخصیص دهند و پیشرفت آن‌ها را پیگیری کنند. ورزشکاران می‌توانند برنامه را مشاهده، تمرینات را ثبت و متریک‌های自己的身体 را به‌روزرسانی کنند.

### مخاطبان
- **ادمین**: مدیریت حرکات پایه (GIF و اطلاعات)
- **مربی**: طراحی تمپلیت، مدیریت شاگردان، تخصیص و کاستومایز برنامه
- **ورزشکار**: مشاهده برنامه، ثبت تمرین، مدیریت متریک‌ها

---

## معماری فنی

### تکنولوژی‌ها
| لایه | تکنولوژی | دلیل |
|------|-----------|-------|
| فرانت‌اند | Next.js 14 (App Router) | SEO، SSR، API routes یکپارچه |
| بک‌اند | NestJS | ساختار ماژولار، TypeScript، مقیاس‌پذیر |
| دیتابیس | PostgreSQL | قابلیت اطمینان، روابط پیچیده |
| ORM | Prisma | Type-safe، آسانی مدیریت migrations |
| احراز هویت | JWT + Bcrypt | ساده و امن |
| ذخیره فایل | Local / S3 (GIFها) | برای ذخیره گیف حرکات |
| استایل | Tailwind CSS + shadcn/ui | سرعت توسعه، یکپارچگی |

### ساختار پوشه‌ها
fitcoach/
├── frontend/ (Next.js)
│ ├── app/
│ │ ├── (auth)/ # صفحه‌های لاگین/ثبت‌نام
│ │ ├── (admin)/ # پنل ادمین
│ │ ├── (coach)/ # پنل مربی
│ │ ├── (athlete)/ # پنل ورزشکار
│ │ └── api/ # Next.js API routes (یا ارتباط با Nest)
│ ├── components/ # کامپوننت‌های مشترک
│ ├── lib/ # utilities, hooks
│ └── types/ # TypeScript types
│
├── backend/ (NestJS)
│ ├── src/
│ │ ├── modules/
│ │ │ ├── auth/ # احراز هویت
│ │ │ ├── users/ # مدیریت کاربران
│ │ │ ├── exercises/ # مدیریت حرکات (ادمین)
│ │ │ ├── templates/ # تمپلیت‌های برنامه
│ │ │ ├── assignments/ # تخصیص برنامه به شاگرد
│ │ │ ├── workouts/ # ثبت تمرینات ورزشکار
│ │ │ └── metrics/ # متریک‌های ورزشکار
│ │ ├── prisma/ # Prisma schema و migrations
│ │ └── common/ # guards, interceptors, pipes
│ └── test/
│
└── docker-compose.yml # PostgreSQL + (اختیاری) Adminer

text

---

## مدل داده‌ها

### جدول users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('admin', 'coach', 'athlete')),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
جدول athlete_profiles
sql
CREATE TABLE athlete_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
    primary_goal VARCHAR(50) CHECK (primary_goal IN ('weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness')),
    training_days_per_week INT CHECK (training_days_per_week BETWEEN 1 AND 7),
    injuries TEXT,
    medical_conditions TEXT,
    last_updated_at TIMESTAMP DEFAULT NOW()
);
جدول athlete_metrics
sql
CREATE TABLE athlete_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,1),
    muscle_mass_kg DECIMAL(5,2),
    biological_age INT,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_by_role VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_athlete_metrics_athlete_date ON athlete_metrics(athlete_id, recorded_at DESC);
جدول exercises (مدیریت توسط ادمین)
sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100),
    muscle_group VARCHAR(50),
    equipment VARCHAR(50),
    gif_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
جدول program_templates (تمپلیت‌های مربی)
sql
CREATE TABLE program_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20),
    suggested_for_goal VARCHAR(50),
    suggested_for_level VARCHAR(20),
    suggested_training_days INT,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
جدول template_weeks
sql
CREATE TABLE template_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES program_templates(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    title VARCHAR(100),
    notes TEXT,
    UNIQUE(template_id, week_number)
);
جدول template_days
sql
CREATE TABLE template_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_week_id UUID NOT NULL REFERENCES template_weeks(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title VARCHAR(100),
    day_type VARCHAR(20) DEFAULT 'workout',
    UNIQUE(template_week_id, day_number)
);
جدول template_exercises
sql
CREATE TABLE template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_day_id UUID NOT NULL REFERENCES template_days(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    order_index INT NOT NULL,
    sets INT NOT NULL,
    reps_min INT,
    reps_max INT,
    rest_seconds INT,
    suggested_weight DECIMAL(6,2),
    notes TEXT
);
جدول coach_athlete_relations
sql
CREATE TABLE coach_athlete_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES users(id),
    athlete_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(coach_id, athlete_id)
);
جدول athlete_assigned_programs
sql
CREATE TABLE athlete_assigned_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES users(id),
    template_id UUID NOT NULL REFERENCES program_templates(id),
    assigned_by UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    is_customized BOOLEAN DEFAULT FALSE,
    customization_note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
جدول athlete_program_customizations (کاستومایزها)
sql
CREATE TABLE athlete_program_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_program_id UUID NOT NULL REFERENCES athlete_assigned_programs(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    day_number INT,
    exercise_id UUID,
    sets INT,
    reps_min INT,
    reps_max INT,
    rest_seconds INT,
    suggested_weight DECIMAL(6,2),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
جدول workout_logs (ثبت تمرینات ورزشکار)
sql
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_program_id UUID NOT NULL REFERENCES athlete_assigned_programs(id),
    program_day_id UUID,  -- می‌توانیم از روی week+day پیدا کنیم
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    performed_date DATE NOT NULL,
    set_number INT NOT NULL,
    actual_reps INT,
    actual_weight DECIMAL(6,2),
    rpe DECIMAL(2,1) CHECK (rpe BETWEEN 0 AND 10),
    is_completed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
ماژول‌ها و فیچرها
1. ماژول احراز هویت (Auth)
فیچر	توضیح
ثبت‌نام ورزشکار	فرم اطلاعات پایه + پروفایل ورزشی
ثبت‌نام مربی	اطلاعات پایه (نیاز به تایید ادمین - اختیاری)
ورود	با ایمیل و رمز عبور، دریافت JWT
پروفایل من	مشاهده و ویرایش اطلاعات شخصی
تغییر رمز عبور	امنیت بیشتر
2. ماژول ادمین
فیچر	توضیح
مدیریت حرکات	CRUD کامل روی حرکات ورزشی
آپلود GIF	ذخیره و نمایش گیف حرکات
دسته‌بندی حرکات	گروه عضلانی، تجهیزات مورد نیاز
فعال/غیرفعال کردن حرکات	عدم نمایش حرکات غیرفعال به مربیان
3. ماژول مربی - مدیریت شاگردان
فیچر	توضیح
لیست شاگردان	مشاهده همه شاگردان با وضعیت
جستجو و فیلتر	بر اساس نام، سطح، هدف
مشاهده پروفایل شاگرد	اطلاعات کامل + متریک‌ها + نمودارها
افزودن شاگرد	با ایمیل یا کد دعوت
حذف شاگرد	قطع ارتباط مربی-شاگرد
4. ماژول مربی - تمپلیت‌ها
فیچر	توضیح
ساخت تمپلیت جدید	چند مرحله‌ای (اطلاعات، هفته‌ها، روزها، حرکات)
ویرایش تمپلیت	تغییر در ساختار موجود
کپی تمپلیت	از روی تمپلیت دیگر
حذف تمپلیت	فقط اگر به شاگردی تخصیص داده نشده باشد
پیش‌نمایش تمپلیت	نمایش کل هفته‌ها و حرکات
کتابخانه تمپلیت‌ها	لیست تمام تمپلیت‌های مربی
5. ماژول مربی - تخصیص و کاستومایز
فیچر	توضیح
تخصیص تمپلیت به شاگرد	انتخاب شاگرد، تمپلیت، تاریخ شروع/پایان
نمایش هفته‌های فعال	چک‌باکس برای انتخاب هفته‌های اجرا
کپی خودکار	پیش‌فرض بقیه هفته‌ها از هفته 1 کپی شوند
کاستومایز قبل از تخصیص	تغییر ست‌ها، تکرارها، وزن برای شاگرد خاص
کاستومایز بعد از تخصیص	ویرایش برنامه در حال اجرا
حذف حرکت/روز	امکان حذف برای شاگرد خاص
افزودن یادداشت شخصی	یادداشت مربی برای هر حرکت
6. ماژول ورزشکار - برنامه تمرینی
فیچر	توضیح
مشاهده تمرین امروز	لیست حرکات امروز با جزئیات
مشاهده کل هفته	تقویم تمرینات هفته جاری
مشاهده هفته‌های آینده	برنامه هفته‌های بعد
شروع تمرین	ورود به حالت ثبت ست‌ها
نمایش گیف حرکت	راهنمای بصری اجرای حرکت
تایمر استراحت	با اعلان پایان استراحت
ثبت ست	وزن، تکرار، RPE (اختیاری)، کامل/ناقص
رد کردن ست	ثبت دلیل (اختیاری)
اتمام تمرین روز	نمایش خلاصه و ذخیره لاگ
7. ماژول ورزشکار - متریک‌ها
فیچر	توضیح
مشاهده متریک‌های خود	جدول و نمودار
ثبت متریک جدید	وزن، درصد چربی، توده عضلانی، سن بیولوژیکال
ویرایش متریک	فقط مربوط به هفته جاری
نمودارهای پیشرفت	قابل انتخاب بازه (۱ هفته، ۱ ماه، ۳ ماه، ۶ ماه، ۱ سال)
مشاهده تاریخچه	لیست تمام ثبت‌ها
8. ماژول مربی - مشاهده متریک‌های شاگرد
فیچر	توضیح
مشاهده متریک‌های شاگرد	همانند پنل ورزشکار + مشخص کردن ثبت‌کننده (خودش/مربی)
ثبت متریک برای شاگرد	مربی می‌تواند به جای شاگرد ثبت کند
نمودارهای مقایسه‌ای	مقایسه شاگرد با میانگین (اختیاری - فاز 2)
API‌ها
Auth
Method	Endpoint	توضیح	نقش
POST	/api/auth/register	ثبت‌نام (role در body)	public
POST	/api/auth/login	ورود و دریافت JWT	public
GET	/api/auth/me	اطلاعات کاربر جاری	all
PUT	/api/auth/change-password	تغییر رمز عبور	all
Admin - Exercises
Method	Endpoint	توضیح
GET	/api/admin/exercises	لیست حرکات (با فیلتر)
POST	/api/admin/exercises	افزودن حرکت (multipart: gif)
GET	/api/admin/exercises/:id	جزئیات حرکت
PUT	/api/admin/exercises/:id	ویرایش حرکت
DELETE	/api/admin/exercises/:id	حذف حرکت
Coach - Athletes
Method	Endpoint	توضیح
GET	/api/coach/athletes	لیست شاگردان
POST	/api/coach/athletes/invite	دعوت شاگرد (ایمیل)
DELETE	/api/coach/athletes/:id	حذف شاگرد
GET	/api/coach/athletes/:id/profile	پروفایل شاگرد
PUT	/api/coach/athletes/:id/profile	ویرایش پروفایل شاگرد
GET	/api/coach/athletes/:id/metrics	متریک‌های شاگرد
POST	/api/coach/athletes/:id/metrics	ثبت متریک برای شاگرد
Coach - Templates
Method	Endpoint	توضیح
GET	/api/coach/templates	لیست تمپلیت‌ها
POST	/api/coach/templates	ساخت تمپلیت
GET	/api/coach/templates/:id	جزئیات تمپلیت
PUT	/api/coach/templates/:id	ویرایش تمپلیت
DELETE	/api/coach/templates/:id	حذف تمپلیت
POST	/api/coach/templates/:id/copy	کپی تمپلیت
Coach - Assignments
Method	Endpoint	توضیح
POST	/api/coach/assign	تخصیص تمپلیت به شاگرد
GET	/api/coach/assignments/:id	جزئیات تخصیص
PUT	/api/coach/assignments/:id/customize	کاستومایز برنامه
GET	/api/coach/athletes/:id/current-program	برنامه جاری شاگرد
Athlete - Profile & Metrics
Method	Endpoint	توضیح
GET	/api/athlete/profile	پروفایل من
PUT	/api/athlete/profile	ویرایش پروفایل
GET	/api/athlete/metrics	لیست متریک‌های من
POST	/api/athlete/metrics	ثبت متریک جدید
PUT	/api/athlete/metrics/:id	ویرایش متریک (فقط هفته جاری)
DELETE	/api/athlete/metrics/:id	حذف متریک (فقط هفته جاری)
Athlete - Workout
Method	Endpoint	توضیح
GET	/api/athlete/current-program	برنامه جاری با روزهای هفته
GET	/api/athlete/today-workout	تمرینات امروز
GET	/api/athlete/workout/:date	تمرینات تاریخ مشخص
POST	/api/athlete/workout/log	ثبت یک ست تمرین
GET	/api/athlete/workout/history	تاریخچه تمرینات
فلوهای کاربری
فلو 1: ثبت‌نام ورزشکار
text
1. کاربر وارد صفحه ثبت‌نام می‌شود
2. اطلاعات پایه (نام، ایمیل، رمز عبور) را وارد می‌کند
3. نقش "ورزشکار" را انتخاب می‌کند
4. وارد صفحه تکمیل پروفایل ورزشی می‌شود:
   - جنسیت، تاریخ تولد
   - سطح fitness، هدف اصلی
   - تعداد روزهای تمرین در هفته
   - مصدومیت‌ها/محدودیت‌ها (اختیاری)
5. ثبت‌نام انجام می‌شود
6. هدایت به پنل ورزشکار
فلو 2: مربی - ساخت تمپلیت جدید
text
1. مربی وارد پنل خود می‌شود
2. کلیک روی "تمپلیت‌ها" → "ساخت تمپلیت جدید"
3. مرحله 1: اطلاعات پایه (عنوان، توضیحات، سطح، مدت)
4. مرحله 2: طراحی هفته‌ها
   - تعیین تعداد هفته‌ها (پیش‌فرض 4)
   - طراحی روزهای هفته 1:
     - افزودن روز (بالاتنه، پایین تنه، استراحت)
     - افزودن حرکت به هر روز
     - تعیین ست‌ها، تکرارها، استراحت
   - سیستم بقیه هفته‌ها را از هفته 1 کپی می‌کند
   - مربی می‌تواند هر هفته را جداگانه ویرایش کند
5. مرحله 3: تأیید و ذخیره تمپلیت
فلو 3: مربی - تخصیص برنامه به شاگرد
text
1. مربی وارد صفحه شاگرد مورد نظر می‌شود
2. کلیک روی "تخصیص برنامه جدید"
3. انتخاب تمپلیت از کتابخانه
4. تعیین تاریخ شروع و پایان
5. سیستم هفته‌های فعال را نمایش می‌دهد (چک‌باکس - همه تیک خورده)
   - مربی می‌تواند تیک هفته‌ها را بردارد
   - مربی می‌تواند هفته جدید اضافه کند
6. (اختیاری) کلیک روی "کاستومایز کردن برنامه":
   - تغییر ست‌ها، تکرارها برای هر حرکت
   - افزودن یادداشت شخصی
   - حذف حرکت/روز
7. تأیید و تخصیص برنامه به شاگرد
فلو 4: ورزشکار - اجرای تمرین
text
1. ورزشکار وارد پنل می‌شود
2. صفحه اصلی: نمایش تمرین امروز
3. روی حرکت اول کلیک "شروع" می‌کند
4. وارد صفحه ثبت ست می‌شود:
   - مشاهده گیف حرکت
   - وارد کردن وزنه استفاده شده
   - انجام تکرارها
   - ثبت ست
   - شروع تایمر استراحت
5. بعد از اتمام استراحت، ست بعدی شروع می‌شود
6. بعد از اتمام همه ست‌های حرکت، به حرکت بعدی می‌رود
7. بعد از اتمام همه حرکات، روز تمرین کامل می‌شود
8. ذخیره لاگ و بازگشت به صفحه اصلی
فلو 5: ورزشکار - ثبت متریک
text
1. ورزشکار وارد بخش "متریک‌ها" می‌شود
2. ثبت مقادیر جدید: وزن، درصد چربی، توده عضلانی، سن بیولوژیکال
3. انتخاب تاریخ (پیش‌فرض امروز)
4. ذخیره
5. اگر بخواهد متریک هفته قبل را ویرایش کند → پیام خطا
6. در نمودارها، مقادیر جدید نمایش داده می‌شود
فلو 6: مربی - ثبت متریک برای شاگرد
text
1. مربی وارد پروفایل شاگرد می‌شود
2. به بخش متریک‌ها می‌رود
3. کلیک روی "ثبت متریک جدید برای شاگرد"
4. وارد کردن مقادیر (مثل پنل ورزشکار)
5. انتخاب تاریخ (امکان ثبت برای گذشته - محدودیتی ندارد)
6. ذخیره - با مشخص شدن recorded_by_role = 'coach'
7. در نمودار شاگرد، این ثبت با آیکون مربی مشخص می‌شود
دیزاین UI/UX
اصول کلی
راست‌چین: کل اپ برای فارسی‌زبانان بهینه شده

حالت روشن/تیره: پشتیبانی از هر دو (داده در localStorage)

موبایل-فرست: طراحی responsive (موبایل، تبلت، دسکتاپ)

حداقل کلیک: هر عملیات حداکثر 3 کلیک فاصله از صفحه اصلی

رنگ‌های پیشنهادی
css
--primary: #6C63FF;     /* بنفش تیره - اصلی */
--primary-dark: #5A52D5;
--secondary: #FF6B35;   /* نارنجی - اکشن‌ها */
--success: #10B981;     /* سبز - موفقیت */
--danger: #EF4444;      /* قرمز - خطا/حذف */
--warning: #F59E0B;     /* زرد - هشدار */
--background: #F9FAFB;  /* پس‌زمینه روشن */
--surface: #FFFFFF;     /* کارت‌ها */
--text-primary: #111827;
--text-secondary: #6B7280;
کامپوننت‌های کلیدی
WorkoutCard
tsx
interface WorkoutCardProps {
  exerciseName: string;
  sets: number;
  repsRange: string;
  restSeconds: number;
  gifUrl?: string;
  status: 'pending' | 'in-progress' | 'completed';
  onStart: () => void;
}
SetTimer
tsx
interface SetTimerProps {
  durationSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}
MetricChart
tsx
interface MetricChartProps {
  data: Array<{date: Date, value: number}>;
  type: 'weight' | 'bodyFat' | 'muscleMass' | 'biologicalAge';
  period: 'week' | 'month' | '3months' | '6months' | 'year';
}
صفحه‌های اصلی (mockups)
صفحه	مسیر	کامپوننت‌ها
لاگین	/login	فرم ورود
ثبت‌نام	/register	فرم چندمرحله‌ای
داشبورد مربی	/coach/dashboard	AthleteListItem, نمودار خلاصه
لیست شاگردان	/coach/athletes	SearchBar, AthleteTable
پروفایل شاگرد	/coach/athletes/:id	ProfileCard, MetricChart, ProgramCard
ساخت تمپلیت	/coach/templates/create	Wizard (3 مرحله)
کتابخانه تمپلیت	/coach/templates	TemplateCard, SearchFilter
تخصیص برنامه	/coach/assign	SelectAthlete, SelectTemplate, DatePicker
صفحه اصلی ورزشکار	/athlete/dashboard	TodayWorkout, WeekProgress
شروع تمرین	/athlete/workout/:dayId	ExercisePlayer, SetTimer
متریک‌های من	/athlete/metrics	MetricForm, MetricChart, HistoryTable
نکات پیاده‌سازی
1. کپی خودکار هفته‌ها در تمپلیت
typescript
// backend: ایجاد تمپلیت جدید
async createTemplate(data) {
  const template = await prisma.programTemplate.create({ data });
  
  // ایجاد هفته‌ها
  const weeks = [];
  for (let i = 1; i <= data.totalWeeks; i++) {
    weeks.push({ templateId: template.id, weekNumber: i });
  }
  await prisma.templateWeek.createMany({ data: weeks });
  
  // فقط هفته 1 را طراحی کن
  // هفته‌های بعدی فعلاً خالی هستند
  // در زمان نمایش، اگر هفته customized نبود، از هفته 1 کپی می‌شود
}
2. قانون ویرایش متریک (فقط هفته جاری)
typescript
function canEditMetric(recordedDate: Date): boolean {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now); // شنبه این هفته
  const endOfWeek = getEndOfWeek(now);     // جمعه این هفته
  return recordedDate >= startOfWeek && recordedDate <= endOfWeek;
}
3. ذخیره گیف حرکات
typescript
// آپلود در backend
@Post('exercises')
@UseInterceptors(FileInterceptor('gif'))
async createExercise(
  @Body() dto: CreateExerciseDto,
  @UploadedFile() file: Express.Multer.File,
) {
  // ذخیره فایل در disk یا S3
  const gifUrl = await this.storageService.upload(file, 'exercises');
  return this.exercisesService.create({ ...dto, gifUrl });
}
4. نمایش برنامه به ورزشکار با اعمال کاستومایزها
typescript
async getAthleteProgram(athleteProgramId: string, weekNumber: number, dayNumber: number) {
  const assignment = await prisma.athleteAssignedProgram.findUnique({
    where: { id: athleteProgramId },
    include: { template: { include: { weeks: { include: { days: { include: { exercises: true } } } } } }
  });
  
  // دریافت کاستومایزهای این ورزشکار
  const customizations = await prisma.athleteProgramCustomization.findMany({
    where: { athleteProgramId, weekNumber, dayNumber }
  });
  
  // اعمال overrideها روی templateExercises
  return applyCustomizations(baseExercises, customizations);
}
5. تایمر استراحت (فرانت‌اند)
tsx
const RestTimer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  return <div>{formatTime(timeLeft)}</div>;
};

پیوست
فایل‌های محیطی (.env)
env
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
STORAGE_PATH="./uploads"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
اسکریپت‌های مفید
json
// package.json (backend)
{
  "scripts": {
    "start:dev": "nest start --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
منابع مفید
Prisma Documentation

NestJS Documentation

Next.js Documentation

TailwindCSS

shadcn/ui Components

جمع‌بندی
این مستند تمام جنبه‌های پروژه FitCoach را پوشش می‌دهد. با پیاده‌سازی طبق این نقشه راه، یک اپلیکیشن کامل، مقیاس‌پذیر و حرفه‌ای برای مدیریت رابطه مربی و ورزشکار خواهید داشت.

تاریخ: ۱۴۰۳/۰۸/۱۵
نسخه مستند: 1.0.0

text

---

فایل بالا تمام فیچرها، جزئیات پیاده‌سازی، API‌ها، مدل داده‌ها و فلوهای کاربری رو شامل میشه. می‌تونی این رو توی یه فایل `README.md` یا `PROJECT_SPEC.md` ذخیره کنی و استفاده کنی.

اگر نیاز به اضافه کردن یا تغییر چیزی هست، بگو!

     