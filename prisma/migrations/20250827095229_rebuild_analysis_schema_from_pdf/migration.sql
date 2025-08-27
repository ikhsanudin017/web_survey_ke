/*
  Warnings:

  - You are about to drop the column `agama` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `fcKtpPemohon` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `fcKtpSuamiIstri` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `fcSlipGaji` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `hubMasyarakat` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isKaryawan` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isKontrak` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isLainnya` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isPNSPolri` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isTetap` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `isWiraswasta` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `jenisJaminan` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kapasitasDanKelancaran` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter1` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter1Penilai` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter2` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter2Penilai` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter3` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter3Penilai` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter4` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter4Penilai` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter5` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakter5Penilai` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterAngsuranLannya` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterJelek1` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterJelek2` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterJelek3` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterJelek4` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `karakterJelek5` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kelSurveyLannya` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kendaraanMobil` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kendaraanMotor` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kesimpulanAkhir` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kesimpulanKarakter` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `kondisiJaminan` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `lainnya` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `masaBerakhirKontrak` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiJaminanSetelahPotongan` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiTaksiran` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `pengalaman` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `rumah` on the `financing_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `validInvalid` on the `financing_analyses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."financing_analyses" DROP COLUMN "agama",
DROP COLUMN "fcKtpPemohon",
DROP COLUMN "fcKtpSuamiIstri",
DROP COLUMN "fcSlipGaji",
DROP COLUMN "hubMasyarakat",
DROP COLUMN "isKaryawan",
DROP COLUMN "isKontrak",
DROP COLUMN "isLainnya",
DROP COLUMN "isPNSPolri",
DROP COLUMN "isTetap",
DROP COLUMN "isWiraswasta",
DROP COLUMN "jenisJaminan",
DROP COLUMN "kapasitasDanKelancaran",
DROP COLUMN "karakter1",
DROP COLUMN "karakter1Penilai",
DROP COLUMN "karakter2",
DROP COLUMN "karakter2Penilai",
DROP COLUMN "karakter3",
DROP COLUMN "karakter3Penilai",
DROP COLUMN "karakter4",
DROP COLUMN "karakter4Penilai",
DROP COLUMN "karakter5",
DROP COLUMN "karakter5Penilai",
DROP COLUMN "karakterAngsuranLannya",
DROP COLUMN "karakterJelek1",
DROP COLUMN "karakterJelek2",
DROP COLUMN "karakterJelek3",
DROP COLUMN "karakterJelek4",
DROP COLUMN "karakterJelek5",
DROP COLUMN "kelSurveyLannya",
DROP COLUMN "kendaraanMobil",
DROP COLUMN "kendaraanMotor",
DROP COLUMN "kesimpulanAkhir",
DROP COLUMN "kesimpulanKarakter",
DROP COLUMN "kondisiJaminan",
DROP COLUMN "lainnya",
DROP COLUMN "masaBerakhirKontrak",
DROP COLUMN "nilaiJaminanSetelahPotongan",
DROP COLUMN "nilaiTaksiran",
DROP COLUMN "pengalaman",
DROP COLUMN "rumah",
DROP COLUMN "validInvalid",
ADD COLUMN     "capital_hartaLainnya" TEXT,
ADD COLUMN     "capital_kendaraan" TEXT,
ADD COLUMN     "capital_rumah" TEXT,
ADD COLUMN     "ceklist_fcAgunan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ceklist_fcKk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ceklist_fcKtpPemohon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ceklist_fcKtpSuamiIstri" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ceklist_fcSlipGaji" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jaminan_jenis" TEXT,
ADD COLUMN     "jaminan_keabsahan" TEXT,
ADD COLUMN     "jaminan_kondisi" TEXT,
ADD COLUMN     "jaminan_nilaiTaksiran" DECIMAL(65,30),
ADD COLUMN     "jaminan_plafonPokok" DECIMAL(65,30),
ADD COLUMN     "kapasitas_angsuranMaksimal" DECIMAL(65,30),
ADD COLUMN     "kapasitas_plafonMaksimal" DECIMAL(65,30),
ADD COLUMN     "karakter_agama" TEXT,
ADD COLUMN     "karakter_angsuranLainnya" TEXT,
ADD COLUMN     "karakter_hubMasyarakat" TEXT,
ADD COLUMN     "karakter_kesimpulan" TEXT,
ADD COLUMN     "karakter_pengalaman" TEXT,
ADD COLUMN     "karakter_rating1" TEXT,
ADD COLUMN     "karakter_rating2" TEXT,
ADD COLUMN     "karakter_rating3" TEXT,
ADD COLUMN     "karakter_rating4" TEXT,
ADD COLUMN     "karakter_rating5" TEXT,
ADD COLUMN     "karakter_surveyLainnya" TEXT,
ADD COLUMN     "kesimpulan_catatanKhusus" TEXT,
ADD COLUMN     "kesimpulan_rekomendasi" TEXT NOT NULL DEFAULT 'Layak',
ADD COLUMN     "kondisi_jenisKontrak" TEXT,
ADD COLUMN     "kondisi_kesimpulanUmum" TEXT,
ADD COLUMN     "kondisi_masaBerakhirKontrak" TEXT,
ADD COLUMN     "kondisi_pekerjaan" TEXT,
ADD COLUMN     "kondisi_pekerjaanLainnya" TEXT;
