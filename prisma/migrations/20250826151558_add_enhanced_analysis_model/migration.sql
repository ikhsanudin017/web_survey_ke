/*
  Warnings:

  - You are about to drop the column `notes` on the `application_checklists` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "enhanced_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_application_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "ktpOriginal" BOOLEAN NOT NULL DEFAULT false,
    "ktpCopy" BOOLEAN NOT NULL DEFAULT false,
    "kkOriginal" BOOLEAN NOT NULL DEFAULT false,
    "kkCopy" BOOLEAN NOT NULL DEFAULT false,
    "slipGaji" BOOLEAN NOT NULL DEFAULT false,
    "suratKeterjaKerja" BOOLEAN NOT NULL DEFAULT false,
    "rekKoran" BOOLEAN NOT NULL DEFAULT false,
    "buktiPenghasilan" BOOLEAN NOT NULL DEFAULT false,
    "siup" BOOLEAN NOT NULL DEFAULT false,
    "tdp" BOOLEAN NOT NULL DEFAULT false,
    "buktiTempatUsaha" BOOLEAN NOT NULL DEFAULT false,
    "fotoUsaha" BOOLEAN NOT NULL DEFAULT false,
    "sertifikatTanah" BOOLEAN NOT NULL DEFAULT false,
    "bpkb" BOOLEAN NOT NULL DEFAULT false,
    "imb" BOOLEAN NOT NULL DEFAULT false,
    "suratNikah" BOOLEAN NOT NULL DEFAULT false,
    "aktaKelahiran" BOOLEAN NOT NULL DEFAULT false,
    "referensiBank" BOOLEAN NOT NULL DEFAULT false,
    "analysisNotes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "application_checklists_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_application_checklists" ("aktaKelahiran", "applicationId", "bpkb", "buktiPenghasilan", "buktiTempatUsaha", "completedAt", "createdAt", "fotoUsaha", "id", "imb", "kkCopy", "kkOriginal", "ktpCopy", "ktpOriginal", "referensiBank", "rekKoran", "sertifikatTanah", "siup", "slipGaji", "suratKeterjaKerja", "suratNikah", "tdp", "updatedAt") SELECT "aktaKelahiran", "applicationId", "bpkb", "buktiPenghasilan", "buktiTempatUsaha", "completedAt", "createdAt", "fotoUsaha", "id", "imb", "kkCopy", "kkOriginal", "ktpCopy", "ktpOriginal", "referensiBank", "rekKoran", "sertifikatTanah", "siup", "slipGaji", "suratKeterjaKerja", "suratNikah", "tdp", "updatedAt" FROM "application_checklists";
DROP TABLE "application_checklists";
ALTER TABLE "new_application_checklists" RENAME TO "application_checklists";
CREATE UNIQUE INDEX "application_checklists_applicationId_key" ON "application_checklists"("applicationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
