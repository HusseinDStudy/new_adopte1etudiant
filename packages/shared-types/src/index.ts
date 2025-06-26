import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'COMPANY']),
});

// Profile schemas
export const studentProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  school: z.string().optional(),
  degree: z.string().optional(),
  skills: z.array(z.string()),
  isOpenToOpportunities: z.boolean().optional(),
});

export const companyProfileSchema = z.object({
  name: z.string().min(1),
  size: z.string().optional(),
  sector: z.string().optional(),
  contactEmail: z.string().email(),
});

// Offer schemas
export const createOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  location: z.string().optional(),
  duration: z.string().optional(),
  skills: z.array(z.string()),
});

export const updateOfferSchema = createOfferSchema.partial();

// Application schemas
export const createApplicationSchema = z.object({
  offerId: z.string(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED']),
});

export const updateAdoptionRequestStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

// Message schemas
export const createMessageSchema = z.object({
  content: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>; 