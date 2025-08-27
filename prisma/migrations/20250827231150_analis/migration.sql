/*
  Warnings:

  - You are about to drop the column `karakter_rating1` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_rating2` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_rating3` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_rating4` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_rating5` on the `financing_analyses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."financing_analyses" DROP COLUMN "karakter_rating1",
DROP COLUMN "karakter_rating2",
DROP COLUMN "karakter_rating3",
DROP COLUMN "karakter_rating4",
DROP COLUMN "karakter_rating5",
ADD COLUMN     "karakter_input1" TEXT,
ADD COLUMN     "karakter_input2" TEXT,
ADD COLUMN     "karakter_input3" TEXT,
ADD COLUMN     "karakter_input4" TEXT,
ADD COLUMN     "karakter_input5" TEXT;

-- CreateTable
CREATE TABLE "public"."application_status_histories" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."application_status_histories" ADD CONSTRAINT "application_status_histories_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."financing_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."application_status_histories" ADD CONSTRAINT "application_status_histories_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
