"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageSchema = exports.updateApplicationStatusSchema = exports.createApplicationSchema = exports.updateOfferSchema = exports.createOfferSchema = exports.companyProfileSchema = exports.studentProfileSchema = exports.registerSchema = exports.loginSchema = void 0;
var zod_1 = require("zod");
// Auth schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['STUDENT', 'COMPANY']),
});
// Profile schemas
exports.studentProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    school: zod_1.z.string().optional(),
    degree: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()),
});
exports.companyProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    size: zod_1.z.string().optional(),
    sector: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email(),
});
// Offer schemas
exports.createOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(10),
    location: zod_1.z.string().optional(),
    duration: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()),
});
exports.updateOfferSchema = exports.createOfferSchema.partial();
// Application schemas
exports.createApplicationSchema = zod_1.z.object({
    offerId: zod_1.z.string(),
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED']),
});
// Message schemas
exports.createMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    applicationId: zod_1.z.string(),
});
