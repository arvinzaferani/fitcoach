-- CreateEnum
CREATE TYPE "CoachAthleteInvitationStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "coach_athlete_invitations" (
    "id" UUID NOT NULL,
    "coach_id" UUID NOT NULL,
    "athlete_id" UUID NOT NULL,
    "message" TEXT,
    "status" "CoachAthleteInvitationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "coach_athlete_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_athlete_invitations_coach_id_status_idx" ON "coach_athlete_invitations"("coach_id", "status");

-- CreateIndex
CREATE INDEX "coach_athlete_invitations_athlete_id_status_idx" ON "coach_athlete_invitations"("athlete_id", "status");

-- AddForeignKey
ALTER TABLE "coach_athlete_invitations" ADD CONSTRAINT "coach_athlete_invitations_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_athlete_invitations" ADD CONSTRAINT "coach_athlete_invitations_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
