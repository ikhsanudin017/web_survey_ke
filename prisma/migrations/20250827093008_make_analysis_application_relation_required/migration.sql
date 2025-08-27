/*
  Warnings:

  - Made the column `applicationId` on table `financing_analyses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."financing_analyses" ALTER COLUMN "applicationId" SET NOT NULL;
