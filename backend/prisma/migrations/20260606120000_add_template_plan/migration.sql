-- Add template plan payload for backend-driven workout rendering
ALTER TABLE "program_templates" ADD COLUMN "plan" JSONB;
