-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'coach', 'athlete');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');

-- CreateEnum
CREATE TYPE "TrainingGoal" AS ENUM ('weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('workout', 'rest');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('active', 'completed', 'paused', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL,
    "profile_picture" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "gender" "Gender",
    "birth_date" DATE,
    "fitness_level" "FitnessLevel",
    "primary_goal" "TrainingGoal",
    "training_days_per_week" INTEGER,
    "injuries" TEXT,
    "medical_conditions" TEXT,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_metrics" (
    "id" UUID NOT NULL,
    "athlete_id" UUID NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "body_fat_percentage" DECIMAL(4,1),
    "muscle_mass_kg" DECIMAL(5,2),
    "biological_age" INTEGER,
    "recorded_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recorded_by" UUID,
    "recorded_by_role" "UserRole",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100),
    "muscle_group" VARCHAR(50),
    "equipment" VARCHAR(50),
    "gif_url" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_templates" (
    "id" UUID NOT NULL,
    "coach_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "difficulty_level" VARCHAR(20),
    "suggested_for_goal" VARCHAR(50),
    "suggested_for_level" VARCHAR(20),
    "suggested_training_days" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_weeks" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "title" VARCHAR(100),
    "notes" TEXT,

    CONSTRAINT "template_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_days" (
    "id" UUID NOT NULL,
    "template_week_id" UUID NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" VARCHAR(100),
    "day_type" "DayType" NOT NULL DEFAULT 'workout',

    CONSTRAINT "template_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_exercises" (
    "id" UUID NOT NULL,
    "template_day_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps_min" INTEGER,
    "reps_max" INTEGER,
    "rest_seconds" INTEGER,
    "suggested_weight" DECIMAL(6,2),
    "notes" TEXT,

    CONSTRAINT "template_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_athlete_relations" (
    "id" UUID NOT NULL,
    "coach_id" UUID NOT NULL,
    "athlete_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_athlete_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_assigned_programs" (
    "id" UUID NOT NULL,
    "athlete_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'active',
    "is_customized" BOOLEAN NOT NULL DEFAULT false,
    "customization_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_assigned_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_program_customizations" (
    "id" UUID NOT NULL,
    "athlete_program_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_number" INTEGER,
    "exercise_id" UUID,
    "sets" INTEGER,
    "reps_min" INTEGER,
    "reps_max" INTEGER,
    "rest_seconds" INTEGER,
    "suggested_weight" DECIMAL(6,2),
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_program_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" UUID NOT NULL,
    "athlete_program_id" UUID NOT NULL,
    "program_day_id" UUID,
    "exercise_id" UUID NOT NULL,
    "performed_date" DATE NOT NULL,
    "set_number" INTEGER NOT NULL,
    "actual_reps" INTEGER,
    "actual_weight" DECIMAL(6,2),
    "rpe" DECIMAL(2,1),
    "is_completed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_profiles_user_id_key" ON "athlete_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_athlete_metrics_athlete_date" ON "athlete_metrics"("athlete_id", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE UNIQUE INDEX "template_weeks_template_id_week_number_key" ON "template_weeks"("template_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "template_days_template_week_id_day_number_key" ON "template_days"("template_week_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "coach_athlete_relations_coach_id_athlete_id_key" ON "coach_athlete_relations"("coach_id", "athlete_id");

-- AddForeignKey
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_metrics" ADD CONSTRAINT "athlete_metrics_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_metrics" ADD CONSTRAINT "athlete_metrics_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_templates" ADD CONSTRAINT "program_templates_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_weeks" ADD CONSTRAINT "template_weeks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_days" ADD CONSTRAINT "template_days_template_week_id_fkey" FOREIGN KEY ("template_week_id") REFERENCES "template_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_day_id_fkey" FOREIGN KEY ("template_day_id") REFERENCES "template_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_athlete_relations" ADD CONSTRAINT "coach_athlete_relations_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_athlete_relations" ADD CONSTRAINT "coach_athlete_relations_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_assigned_programs" ADD CONSTRAINT "athlete_assigned_programs_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_assigned_programs" ADD CONSTRAINT "athlete_assigned_programs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "program_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_assigned_programs" ADD CONSTRAINT "athlete_assigned_programs_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_program_customizations" ADD CONSTRAINT "athlete_program_customizations_athlete_program_id_fkey" FOREIGN KEY ("athlete_program_id") REFERENCES "athlete_assigned_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_program_customizations" ADD CONSTRAINT "athlete_program_customizations_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_athlete_program_id_fkey" FOREIGN KEY ("athlete_program_id") REFERENCES "athlete_assigned_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
