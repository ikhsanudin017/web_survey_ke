import { z } from 'zod';

// Collateral type enum
export const CollateralTypeSchema = z.enum([
  'PROPERTY',
  'VEHICLE',
  'DEPOSIT',
  'GUARANTEE',
  'INVENTORY',
  'RECEIVABLES',
  'EQUIPMENT',
  'SECURITIES',
  'OTHER'
]);

// Property collateral schema
export const PropertyCollateralSchema = z.object({
  type: z.literal('PROPERTY'),
  propertyType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'OTHER']),
  location: z.object({
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(100),
    postalCode: z.string().regex(/^\d{5}$/),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }),
  details: z.object({
    landArea: z.number().positive().describe('Luas tanah (m²)'),
    buildingArea: z.number().positive().describe('Luas bangunan (m²)'),
    certificateType: z.enum(['SHM', 'HGB', 'HGU', 'HP', 'GIRIK', 'LAINNYA']),
    certificateNumber: z.string().min(5).max(50),
    issueDate: z.date(),
    validityPeriod: z.number().positive().optional()
  }),
  valuation: z.object({
    marketValue: z.number().positive(),
    assessedValue: z.number().positive(),
    appraisalDate: z.date(),
    appraiser: z.object({
      name: z.string().min(2).max(100),
      license: z.string().min(5).max(50),
      company: z.string().min(2).max(100)
    })
  })
});

// Vehicle collateral schema
export const VehicleCollateralSchema = z.object({
  type: z.literal('VEHICLE'),
  vehicleType: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'BUS', 'OTHER']),
  details: z.object({
    brand: z.string().min(2).max(50),
    model: z.string().min(2).max(50),
    year: z.number().min(1900).max(new Date().getFullYear()),
    color: z.string().min(2).max(30),
    licensePlate: z.string().regex(/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/),
    engineNumber: z.string().min(5).max(50),
    chassisNumber: z.string().min(5).max(50),
    stnkNumber: z.string().min(5).max(50),
    bpkbNumber: z.string().min(5).max(50)
  }),
  valuation: z.object({
    marketValue: z.number().positive(),
    assessedValue: z.number().positive(),
    appraisalDate: z.date(),
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])
  })
});

// Deposit collateral schema
export const DepositCollateralSchema = z.object({
  type: z.literal('DEPOSIT'),
  depositType: z.enum(['SAVINGS', 'CURRENT', 'DEPOSITO', 'GIRO']),
  bankDetails: z.object({
    bankName: z.string().min(2).max(100),
    branch: z.string().min(2).max(100),
    accountNumber: z.string().min(5).max(50),
    accountHolder: z.string().min(2).max(100)
  }),
  depositDetails: z.object({
    amount: z.number().positive(),
    currency: z.string().default('IDR'),
    startDate: z.date(),
    maturityDate: z.date().optional(),
    interestRate: z.number().min(0).max(100)
  }),
  blockingStatus: z.object({
    isBlocked: z.boolean(),
    blockedAmount: z.number().positive(),
    blockingReference: z.string().min(5).max(100),
    expiryDate: z.date()
  })
});

// General collateral schema
export const CollateralSchema = z.object({
  id: z.string().uuid(),
  type: CollateralTypeSchema,
  description: z.string().min(10).max(500),
  ownership: z.object({
    ownerName: z.string().min(2).max(100),
    relationship: z.enum(['SELF', 'SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'OTHER']),
    ownershipProof: z.array(z.string().uuid())
  }),
  insurance: z.object({
    hasInsurance: z.boolean(),
    insuranceCompany: z.string().optional(),
    policyNumber: z.string().optional(),
    coverageAmount: z.number().positive().optional(),
    expiryDate: z.date().optional()
  }).optional(),
  legalStatus: z.object({
    isClean: z.boolean(),
    encumbrances: z.array(z.object({
      type: z.string(),
      amount: z.number().positive(),
      creditor: z.string()
    })).optional(),
    legalIssues: z.array(z.string()).optional()
  }),
  photos: z.array(z.string().uuid()).min(1).max(10),
  documents: z.array(z.string().uuid()).min(1)
});

// Collateral analysis result schema
export const CollateralAnalysisResultSchema = z.object({
  collateralId: z.string().uuid(),
  analysis: z.object({
    marketValue: z.number().positive(),
    liquidationValue: z.number().positive(),
    forcedSaleValue: z.number().positive(),
    loanToValueRatio: z.number().min(0).max(100),
    riskFactors: z.array(z.object({
      type: z.string(),
      impact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      description: z.string()
    })),
    recommendations: z.array(z.string())
  }),
  verification: z.object({
    status: z.enum(['VERIFIED', 'UNVERIFIED', 'DISPUTED']),
    verifiedBy: z.string().optional(),
    verificationDate: z.date().optional(),
    notes: z.string().max(1000).optional()
  })
});

// Complete collateral analysis schema
export const CollateralAnalysisSchema = z.object({
  applicationId: z.string().uuid(),
  totalCollateralValue: z.number().positive(),
  totalLoanAmount: z.number().positive(),
  overallLTV: z.number().min(0).max(100),
  collaterals: z.array(z.discriminatedUnion('type', [
    PropertyCollateralSchema,
    VehicleCollateralSchema,
    DepositCollateralSchema
  ])),
  analysisResults: z.array(CollateralAnalysisResultSchema),
  riskAssessment: z.object({
    overallRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    riskFactors: z.array(z.string()),
    mitigationMeasures: z.array(z.string())
  })
});

// Type exports
export type PropertyCollateral = z.infer<typeof PropertyCollateralSchema>;
export type VehicleCollateral = z.infer<typeof VehicleCollateralSchema>;
export type DepositCollateral = z.infer<typeof DepositCollateralSchema>;
export type Collateral = z.infer<typeof CollateralSchema>;
export type CollateralAnalysisResult = z.infer<typeof CollateralAnalysisResultSchema>;
export type CollateralAnalysis = z.infer<typeof CollateralAnalysisSchema>;
export type CollateralType = z.infer<typeof CollateralTypeSchema>;
