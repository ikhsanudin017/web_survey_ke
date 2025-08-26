-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "financing_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "monthlyIncome" DECIMAL NOT NULL,
    "spouseName" TEXT,
    "spouseOccupation" TEXT,
    "spouseIncome" DECIMAL,
    "homeAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "contact1" TEXT,
    "contact2" TEXT,
    "contact3" TEXT,
    "contact4" TEXT,
    "contact5" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "businessAddress" TEXT,
    "businessDuration" INTEGER,
    "businessIncome" DECIMAL,
    "loanAmount" DECIMAL NOT NULL,
    "loanPurpose" TEXT NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "collateral" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "financing_applications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "application_checklists" (
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
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "application_checklists_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financing_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT,
    "employeeId" TEXT NOT NULL,
    "nama" TEXT,
    "alamat" TEXT,
    "jenisUsaha" TEXT,
    "pengajuan" TEXT,
    "jangkaWaktu" TEXT,
    "agama" TEXT,
    "pengalaman" TEXT,
    "hubMasyarakat" TEXT,
    "karakterAngsuranLannya" TEXT,
    "kelSurveyLannya" TEXT,
    "karakter1" INTEGER,
    "karakter1Penilai" TEXT,
    "karakter2" INTEGER,
    "karakter2Penilai" TEXT,
    "karakter3" INTEGER,
    "karakter3Penilai" TEXT,
    "karakter4" INTEGER,
    "karakter4Penilai" TEXT,
    "karakter5" INTEGER,
    "karakter5Penilai" TEXT,
    "karakterJelek1" BOOLEAN NOT NULL DEFAULT false,
    "karakterJelek2" BOOLEAN NOT NULL DEFAULT false,
    "karakterJelek3" BOOLEAN NOT NULL DEFAULT false,
    "karakterJelek4" BOOLEAN NOT NULL DEFAULT false,
    "karakterJelek5" BOOLEAN NOT NULL DEFAULT false,
    "kesimpulanKarakter" TEXT,
    "kapasitasDanKelancaran" TEXT,
    "jenisJaminan" TEXT,
    "nilaiTaksiran" DECIMAL,
    "kondisiJaminan" TEXT,
    "nilaiJaminanSetelahPotongan" DECIMAL,
    "validInvalid" TEXT,
    "isKaryawan" BOOLEAN NOT NULL DEFAULT false,
    "isWiraswasta" BOOLEAN NOT NULL DEFAULT false,
    "isPNSPolri" BOOLEAN NOT NULL DEFAULT false,
    "isTetap" BOOLEAN NOT NULL DEFAULT false,
    "isKontrak" BOOLEAN NOT NULL DEFAULT false,
    "isLainnya" BOOLEAN NOT NULL DEFAULT false,
    "masaBerakhirKontrak" TEXT,
    "rumah" TEXT,
    "kendaraanMotor" INTEGER NOT NULL DEFAULT 0,
    "kendaraanMobil" INTEGER NOT NULL DEFAULT 0,
    "lainnya" TEXT,
    "fcKtpPemohon" BOOLEAN NOT NULL DEFAULT false,
    "fcKtpSuamiIstri" BOOLEAN NOT NULL DEFAULT false,
    "fcSlipGaji" BOOLEAN NOT NULL DEFAULT false,
    "kesimpulanAkhir" TEXT NOT NULL DEFAULT 'Layak',
    "petugasSurvei" TEXT,
    "pengurus" TEXT,
    "approver" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "financing_analyses_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "financing_analyses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sub_financing_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "pemasukanSuami" DECIMAL NOT NULL,
    "pemasukanIstri" DECIMAL NOT NULL,
    "pemasukanLainnya1" DECIMAL NOT NULL,
    "pemasukanLainnya2" DECIMAL NOT NULL,
    "pengeluaranSuami" DECIMAL NOT NULL,
    "pengeluaranIstri" DECIMAL NOT NULL,
    "makan" DECIMAL NOT NULL,
    "listrik" DECIMAL NOT NULL,
    "sosial" DECIMAL NOT NULL,
    "tanggunganLain" DECIMAL NOT NULL,
    "jumlahAnak" INTEGER NOT NULL,
    "pengeluaranSekolah" DECIMAL NOT NULL,
    "uangSaku" DECIMAL NOT NULL,
    "pendapatanBersih" DECIMAL NOT NULL,
    "jangkaPembiayaan" INTEGER NOT NULL,
    "angsuranMaksimal" DECIMAL NOT NULL,
    "plafonMaksimal" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sub_financing_analyses_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bi_checking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "pdfFileName" TEXT NOT NULL,
    "pdfFileUrl" TEXT NOT NULL,
    "pdfFileSize" INTEGER NOT NULL,
    "aiAnalysisResult" JSONB,
    "creditScore" INTEGER,
    "riskLevel" TEXT,
    "recommendation" TEXT,
    "aiSummary" TEXT,
    "manualNotes" TEXT,
    "manualRating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bi_checking_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "financing_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "application_checklists_applicationId_key" ON "application_checklists"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "financing_analyses_applicationId_key" ON "financing_analyses"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_financing_analyses_applicationId_key" ON "sub_financing_analyses"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "bi_checking_applicationId_key" ON "bi_checking"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
