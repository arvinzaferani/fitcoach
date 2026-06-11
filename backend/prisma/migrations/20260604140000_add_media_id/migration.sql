-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_key_key" ON "media"("key");

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "gif_media_id" UUID;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_gif_media_id_fkey" FOREIGN KEY ("gif_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
