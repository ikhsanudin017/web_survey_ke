import { z } from 'zod';

// Helper schemas
const phoneSchema = z.string()
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor telepon tidak valid')
  .transform(val => val.replace(/^0/, '+62'));

const emailSchema = z.string()
  .email('Email tidak valid')
  .toLowerCase();

const currencySchema = z.string()
  .transform(val => parseFloat(val.replace(/[^0-9.-]+/g, '')))
  .pipe(z.number().min(0, 'Nilai harus positif'));

const dateSchema = z.string()
  .transform(val => new Date(val))
  .pipe(z.date().max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'Minimal 18 tahun'));

// Step 1: Personal Data Schema
export const personalDataSchema = z.object({
  fullName: z.string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh berisi huruf dan spasi'),
  
  nickname: z.string().min(2, 'Nama panggilan minimal 2 karakter').optional(),

  birthDate: dateSchema,
  
  maritalStatus: z.enum(['Menikah', 'Belum Menikah', 'Cerai Hidup', 'Cerai Mati']),
  
  monthlyIncome: currencySchema
    .pipe(z.number().min(1000000, 'Penghasilan minimal Rp 1.000.000'))
    .pipe(z.number().max(100000000, 'Penghasilan maksimal Rp 100.000.000')),
  
  spouseIncome: z.string()
    .optional()
    .transform(val => val ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : 0)
    .pipe(z.number().min(0).max(100000000, 'Penghasilan maksimal Rp 100.000.000'))
    .optional(),

  heirName: z.string().min(3, 'Nama ahli waris minimal 3 karakter').optional(),

  heirRelationship: z.string().min(3, 'Hubungan/Pekerjaan minimal 3 karakter').optional(),
});

// Step 2: Contact Data Schema
export const contactDataSchema = z.object({
  email: emailSchema,
  
  phone: phoneSchema,
  
  homeAddress: z.string()
    .min(10, 'Alamat minimal 10 karakter'),
  
  contactNumbers: z.array(z.object({
    name: z.string().min(2, 'Nama kontak minimal 2 karakter'),
    phone: phoneSchema,
    relationship: z.string().min(2, 'Hubungan minimal 2 karakter'),
    canShare: z.boolean().default(false),
  })).min(1, 'Minimal 1 kontak').max(5, 'Maksimal 5 kontak'),
  
  emergencyContacts: z.array(z.object({
    name: z.string().min(2, 'Nama kontak minimal 2 karakter'),
    phone: phoneSchema,
    relationship: z.string().min(2, 'Hubungan minimal 2 karakter'),
  })).min(1, 'Minimal 1 kontak darurat').max(3, 'Maksimal 3 kontak darurat'),
});

// Step 3: Business Data Schema (Optional)
export const businessDataSchema = z.object({
  businessName: z.string()
    .min(3, 'Nama usaha minimal 3 karakter')
    .optional()
    .or(z.literal('')),
  
  businessType: z.string()
    .min(3, 'Jenis usaha minimal 3 karakter')
    .optional()
    .or(z.literal('')),
  
  businessAddress: z.string()
    .min(10, 'Alamat usaha minimal 10 karakter')
    .optional()
    .or(z.literal('')),
  
  businessDuration: z.enum(['< 1 tahun', '1-2 tahun', '2-3 tahun', '3-5 tahun', '> 5 tahun'])
    .optional()
    .or(z.literal('')),
  
  businessIncome: z.string()
    .optional()
    .transform(val => val ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : 0)
    .pipe(z.number().min(0).max(500000000, 'Penghasilan usaha maksimal Rp 500.000.000'))
    .optional(),
});

// Step 4: Financing Data Schema
export const financingDataSchema = z.object({
  loanAmount: currencySchema
    .pipe(z.number().min(1000000, 'Jumlah pinjaman minimal Rp 1.000.000'))
    .pipe(z.number().max(50000000, 'Jumlah pinjaman maksimal Rp 50.000.000')),
  
  loanTerm: z.enum(['6', '12', '18', '24', '36', '48', '60'])
    .transform(val => parseInt(val)),
  
  loanPurpose: z.string()
    .min(20, 'Tujuan pinjaman minimal 20 karakter'),
  
  collateral: z.string()
    .min(10, 'Jaminan minimal 10 karakter'),
});

// Step 5: Document Upload Schema
const documentTypes = ['ktp', 'kk', 'slip_gaji', 'npwp', 'surat_keterangan_kerja', 'rekening_koran', 'foto_usaha', 'sku', 'surat_keterangan_usaha'] as const;

export const documentUploadSchema = z.object({
  documents: z.array(z.object({
    type: z.enum(documentTypes),
    file: z.instanceof(File),
  })).refine(docs => {
    const requiredDocs = ['ktp', 'kk', 'slip_gaji'] as const;
    const uploadedTypes = docs.map(doc => doc.type);
    return requiredDocs.every(doc => uploadedTypes.includes(doc));
  }, {
    message: 'Dokumen wajib: KTP, KK, dan Slip Gaji',
  }),
});

// Combined schema for the entire application
export const applicationSchema = z.object({
  personalData: personalDataSchema,
  contactData: contactDataSchema,
  businessData: businessDataSchema,
  financingData: financingDataSchema,
  documentUpload: documentUploadSchema,
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type ContactData = z.infer<typeof contactDataSchema>;
export type BusinessData = z.infer<typeof businessDataSchema>;
export type FinancingData = z.infer<typeof financingDataSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
