import { z } from 'zod';

// Individual character rating schema
export const CharacterRatingSchema = z.object({
  value: z.number().min(1).max(5),
  justification: z.string().min(10).max(200).optional(),
  evaluatorNotes: z.string().max(300).optional()
});

// Complete character assessment schema
export const CharacterAssessmentValidationSchema = z.object({
  applicantId: z.string().uuid(),
  assessmentDate: z.date(),
  evaluator: z.object({
    name: z.string().min(2).max(100),
    position: z.string().min(2).max(100),
    employeeId: z.string().optional()
  }),
  ratings: z.object({
    honesty: CharacterRatingSchema,
    responsibility: CharacterRatingSchema,
    financialDiscipline: CharacterRatingSchema,
    workCommitment: CharacterRatingSchema,
    communication: CharacterRatingSchema
  }),
  overallScore: z.number().min(1).max(5),
  summary: z.string().min(50).max(500),
  recommendations: z.string().max(1000).optional(),
  redFlags: z.array(z.string()).optional(),
  supportingEvidence: z.array(z.object({
    type: z.enum(['INTERVIEW', 'REFERENCE', 'DOCUMENT', 'OBSERVATION']),
    description: z.string().max(200),
    date: z.date()
  })).optional()
});

// Validation for individual rating updates
export const RatingUpdateSchema = z.object({
  field: z.enum(['honesty', 'responsibility', 'financialDiscipline', 'workCommitment', 'communication']),
  value: z.number().min(1).max(5),
  justification: z.string().min(10).max(200).optional()
});

// Type exports
export type CharacterRating = z.infer<typeof CharacterRatingSchema>;
export type CharacterAssessment = z.infer<typeof CharacterAssessmentValidationSchema>;
export type RatingUpdate = z.infer<typeof RatingUpdateSchema>;
