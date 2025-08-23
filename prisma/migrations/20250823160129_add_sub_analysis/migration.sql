-- CreateTable
CREATE TABLE "public"."employees" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financing_applications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "monthlyIncome" DECIMAL(65,30) NOT NULL,
    "spouseName" TEXT,
    "spouseOccupation" TEXT,
    "spouseIncome" DECIMAL(65,30),
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
    "businessIncome" DECIMAL(65,30),
    "loanAmount" DECIMAL(65,30) NOT NULL,
    "loanPurpose" TEXT NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "collateral" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financing_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_checklists" (
    "id" TEXT NOT NULL,
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
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financing_analyses" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "employeeId" TEXT NOT NULL,
    "karakterPemohon" TEXT,
    "reputasiUsaha" TEXT,
    "pengalamanUsaha" TEXT,
    "hubunganDenganBank" TEXT,
    "kemampuanBayar" TEXT,
    "cashFlow" TEXT,
    "proyeksiUsaha" TEXT,
    "rasioHutang" DECIMAL(65,30),
    "modalSendiri" DECIMAL(65,30),
    "modalPinjaman" DECIMAL(65,30),
    "rasioModal" DECIMAL(65,30),
    "kondisiEkonomi" TEXT,
    "kondisiIndustri" TEXT,
    "risikoUsaha" TEXT,
    "jenisJaminan" TEXT,
    "nilaiJaminan" DECIMAL(65,30),
    "kondisiJaminan" TEXT,
    "rasioJaminan" DECIMAL(65,30),
    "recommendation" TEXT,
    "recommendedAmount" DECIMAL(65,30),
    "recommendedTerm" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financing_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_financing_analyses" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "pemasukanSuami" DECIMAL(65,30) NOT NULL,
    "pemasukanIstri" DECIMAL(65,30) NOT NULL,
    "pemasukanLainnya1" DECIMAL(65,30) NOT NULL,
    "pemasukanLainnya2" DECIMAL(65,30) NOT NULL,
    "pengeluaranSuami" DECIMAL(65,30) NOT NULL,
    "pengeluaranIstri" DECIMAL(65,30) NOT NULL,
    "makan" DECIMAL(65,30) NOT NULL,
    "listrik" DECIMAL(65,30) NOT NULL,
    "sosial" DECIMAL(65,30) NOT NULL,
    "tanggunganLain" DECIMAL(65,30) NOT NULL,
    "jumlahAnak" INTEGER NOT NULL,
    "pengeluaranSekolah" DECIMAL(65,30) NOT NULL,
    "uangSaku" DECIMAL(65,30) NOT NULL,
    "pendapatanBersih" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_financing_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "public"."employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "public"."clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "application_checklists_applicationId_key" ON "public"."application_checklists"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "financing_analyses_applicationId_key" ON "public"."financing_analyses"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_financing_analyses_applicationId_key" ON "public"."sub_financing_analyses"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."financing_applications" ADD CONSTRAINT "financing_applications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."application_checklists" ADD CONSTRAINT "application_checklists_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."financing_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financing_analyses" ADD CONSTRAINT "financing_analyses_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."financing_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financing_analyses" ADD CONSTRAINT "financing_analyses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_financing_analyses" ADD CONSTRAINT "sub_financing_analyses_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."financing_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."financing_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
