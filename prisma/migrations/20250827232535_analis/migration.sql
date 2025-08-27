/*
  Warnings:

  - You are about to drop the column `karakter_input1` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_input2` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_input3` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_input4` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter_input5` on the `financing_analyses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."financing_analyses" DROP COLUMN "karakter_input1",
DROP COLUMN "karakter_input2",
DROP COLUMN "karakter_input3",
DROP COLUMN "karakter_input4",
DROP COLUMN "karakter_input5";
