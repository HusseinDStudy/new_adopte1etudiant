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

export const extendedRegisterSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('STUDENT'),
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
  z.object({
    role: z.literal('COMPANY'),
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1, 'Company name is required'),
    contactEmail: z.string().email('Invalid contact email'),
  }),
  z.object({
    role: z.literal('ADMIN'),
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
]);

export const completeOauthSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('STUDENT'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
  z.object({
    role: z.literal('COMPANY'),
    name: z.string().min(1, 'Company name is required'),
    contactEmail: z.string().email('Invalid contact email'),
  }),
]);

// Profile schemas
export const studentProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  school: z.string().optional(),
  degree: z.string().optional(),
  skills: z.array(z.string()).optional(),
  isOpenToOpportunities: z.boolean().optional(),
  cvUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  isCvPublic: z.boolean().optional(),
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
export type RegisterInput = z.infer<typeof extendedRegisterSchema>;
export type CompleteOauthInput = z.infer<typeof completeOauthSchema>;
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>; 