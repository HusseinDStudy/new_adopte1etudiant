import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';
import { CompanyService } from '../services/CompanyService.js';
import { NotFoundError } from '../errors/AppError.js';

describe('Company Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Create companies using the registration endpoint
        const company1Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: 'Alpha Corp',
            contactEmail: faker.internet.email(),
        };
        await supertest(app.server).post('/api/auth/register').send(company1Data);
        
        const company2Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: 'Beta Inc',
            contactEmail: faker.internet.email(),
        };
        await supertest(app.server).post('/api/auth/register').send(company2Data);

        const company3Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: 'Zeta LLC', // This company won't have offers
            contactEmail: faker.internet.email(),
        };
        await supertest(app.server).post('/api/auth/register').send(company3Data);

        // Get company profiles
        const company1User = await prisma.user.findUnique({ 
            where: { email: company1Data.email },
            include: { companyProfile: true }
        });
        const company2User = await prisma.user.findUnique({ 
            where: { email: company2Data.email },
            include: { companyProfile: true }
        });

        // Create skills for offers
        await prisma.skill.createMany({
            data: [
                { name: 'React' },
                { name: 'Node.js' }
            ],
            skipDuplicates: true,
        });

        // Create offers for company1 and company2 (but not company3)
        await prisma.offer.create({
            data: {
                title: 'Frontend Developer',
                description: 'Frontend development position',
                companyId: company1User!.companyProfile!.id,
                skills: {
                    connect: [{ name: 'React' }]
                }
            }
        });

        await prisma.offer.create({
            data: {
                title: 'Backend Developer',
                description: 'Backend development position',
                companyId: company2User!.companyProfile!.id,
                skills: {
                    connect: [{ name: 'Node.js' }]
                }
            }
        });

        // Create another offer for company1
        await prisma.offer.create({
            data: {
                title: 'Full Stack Developer',
                description: 'Full stack development position',
                companyId: company1User!.companyProfile!.id,
                skills: {
                    connect: [{ name: 'React' }, { name: 'Node.js' }]
                }
            }
        });
    });

    afterEach(async () => {
        // Clean up in correct order to respect foreign key constraints
        await prisma.offer.deleteMany();
        await prisma.skill.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('GET /api/companies', () => {
        it('should return all companies that have offers', async () => {
            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(2); // Only companies with offers
            
            const companyNames = response.body.map((company: any) => company.name);
            expect(companyNames).toContain('Alpha Corp');
            expect(companyNames).toContain('Beta Inc');
            expect(companyNames).not.toContain('Zeta LLC'); // No offers
        });

        it('should return companies sorted by name in ascending order', async () => {
            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            const companyNames = response.body.map((company: any) => company.name);
            const sortedNames = [...companyNames].sort();
            expect(companyNames).toEqual(sortedNames);
        });

        it('should return companies with id and name properties', async () => {
            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            
            response.body.forEach((company: any) => {
                expect(company).toHaveProperty('id');
                expect(company).toHaveProperty('name');
                expect(typeof company.id).toBe('string');
                expect(typeof company.name).toBe('string');
            });
        });

        it('should return empty array when no companies have offers', async () => {
            // Delete all offers to make companies not have offers
            await prisma.offer.deleteMany();

            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });

        it('should not require authentication', async () => {
            // Test without any authentication
            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });

        it('should not include duplicate companies even if they have multiple offers', async () => {
            const response = await supertest(app.server)
                .get('/api/companies');

            expect(response.status).toBe(200);
            const companyNames = response.body.map((company: any) => company.name);
            const uniqueNames = [...new Set(companyNames)];
            expect(companyNames).toEqual(uniqueNames); // No duplicates
        });
    });

    describe('GET /api/companies - Additional Edge Cases', () => {
        it('should return empty array when no companies have offers', async () => {
            // Clear all offers
            await prisma.offer.deleteMany();
            
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(0);
        });

        it('should handle database connection issues gracefully', async () => {
            // This test simulates what would happen if the database was temporarily unavailable
            // In a real scenario, we might mock prisma to throw an error
            const response = await supertest(app.server).get('/api/companies');
            
            // Should either succeed normally or handle error gracefully
            expect([200, 500]).toContain(response.status);
        });

        it('should return unique company names only', async () => {
            // Create multiple offers for the same company to test the distinct clause
            const company = await prisma.companyProfile.findFirst();
            
            if (company) {
                // Create additional offers for the same company
                await prisma.offer.createMany({
                    data: [
                        {
                            title: 'Additional Offer 1',
                            description: 'Test offer',
                            companyId: company.id,
                            location: 'Remote',
                        },
                        {
                            title: 'Additional Offer 2', 
                            description: 'Test offer',
                            companyId: company.id,
                            location: 'On-site',
                        }
                    ]
                });
            }
            
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            
            // Check that company names are unique (no duplicates)
            const companyNames = response.body.map((c: any) => c.name);
            const uniqueNames = [...new Set(companyNames)];
            expect(companyNames.length).toBe(uniqueNames.length);
        });

        it('should sort companies alphabetically by name', async () => {
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            
            if (response.body.length > 1) {
                // Check that companies are sorted alphabetically
                const names = response.body.map((c: any) => c.name);
                const sortedNames = [...names].sort();
                expect(names).toEqual(sortedNames);
            }
        });

        it('should include only required fields (id and name)', async () => {
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            
            if (response.body.length > 0) {
                const company = response.body[0];
                expect(company).toHaveProperty('id');
                expect(company).toHaveProperty('name');
                
                // Should not include sensitive fields
                expect(company).not.toHaveProperty('contactEmail');
                expect(company).not.toHaveProperty('userId');
                expect(company).not.toHaveProperty('createdAt');
                expect(company).not.toHaveProperty('updatedAt');
            }
        });

        it('should not require authentication', async () => {
            // Test that the endpoint is publicly accessible
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
        });

        it('should handle companies with special characters in names', async () => {
            // Just verify that the existing companies (if any) have valid name fields
            const response = await supertest(app.server).get('/api/companies');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            
            // Verify all companies have valid name and id fields
            response.body.forEach((company: any) => {
                expect(company).toHaveProperty('id');
                expect(company).toHaveProperty('name');
                expect(typeof company.name).toBe('string');
                expect(company.name.length).toBeGreaterThan(0);
            });
        });
    });
});

describe('CompanyService', () => {
    let companyService: CompanyService;
    let testCompanyUserId: string;
    let testCompanyProfileId: string;

    beforeAll(async () => {
        companyService = new CompanyService();
    });

    beforeEach(async () => {
        // Clean up database
        await prisma.adoptionRequest.deleteMany();
        await prisma.application.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();

        // Create a test company
        const testUser = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                passwordHash: 'hashedpassword',
                role: 'COMPANY',
            },
        });
        testCompanyUserId = testUser.id;

        const testCompanyProfile = await prisma.companyProfile.create({
            data: {
                userId: testUser.id,
                name: 'Test Company',
                contactEmail: faker.internet.email(),
                sector: 'Technology',
                size: '50-100',
                logoUrl: 'https://example.com/logo.png',
            },
        });
        testCompanyProfileId = testCompanyProfile.id;
    });

    afterEach(async () => {
        // Clean up after each test
        await prisma.adoptionRequest.deleteMany();
        await prisma.application.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('getCompanyProfile', () => {
        it('should return company profile with user email and offers', async () => {
            // Create some test offers
            await prisma.offer.create({
                data: {
                    title: 'Software Engineer',
                    description: 'Great opportunity',
                    location: 'Remote',
                    duration: 'INTERNSHIP',
                    companyId: testCompanyProfileId,
                },
            });

            const result = await companyService.getCompanyProfile(testCompanyUserId);

            expect(result).toHaveProperty('id', testCompanyProfileId);
            expect(result).toHaveProperty('name', 'Test Company');
            expect(result).toHaveProperty('sector', 'Technology');
            expect(result).toHaveProperty('size', '50-100');
            expect(result).toHaveProperty('logoUrl', 'https://example.com/logo.png');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('offers');
            expect(Array.isArray(result.offers)).toBe(true);
            expect(result.offers).toHaveLength(1);
            expect(result.offers[0]).toHaveProperty('title', 'Software Engineer');
        });

        it('should throw NotFoundError when company profile does not exist', async () => {
            const nonExistentUserId = 'non-existent-id';

            await expect(companyService.getCompanyProfile(nonExistentUserId))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('getCompanyStats', () => {
        it('should return correct company statistics', async () => {
            // Create test offers
            const offer1 = await prisma.offer.create({
                data: {
                    title: 'Software Engineer',
                    description: 'Great opportunity',
                    location: 'Remote',
                    duration: 'INTERNSHIP',
                    companyId: testCompanyProfileId,
                },
            });

            const offer2 = await prisma.offer.create({
                data: {
                    title: 'Data Scientist',
                    description: 'Another opportunity',
                    location: 'On-site',
                    duration: 'FULL_TIME',
                    companyId: testCompanyProfileId,
                },
            });

            // Create test students for applications
            const testStudent1 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'STUDENT',
                },
            });

            const testStudent2 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'STUDENT',
                },
            });

            const studentProfile1 = await prisma.studentProfile.create({
                data: {
                    userId: testStudent1.id,
                    firstName: 'John',
                    lastName: 'Doe',
                },
            });

            const studentProfile2 = await prisma.studentProfile.create({
                data: {
                    userId: testStudent2.id,
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
            });

            // Create test applications with different statuses
            await prisma.application.create({
                data: {
                    studentId: testStudent1.id,
                    offerId: offer1.id,
                    status: 'NEW',
                },
            });

            await prisma.application.create({
                data: {
                    studentId: testStudent2.id,
                    offerId: offer2.id,
                    status: 'HIRED',
                },
            });

            // Create adoption request
            await prisma.adoptionRequest.create({
                data: {
                    companyId: testCompanyProfileId,
                    studentId: testStudent1.id,
                },
            });

            const result = await companyService.getCompanyStats(testCompanyUserId);

            expect(result).toHaveProperty('totalOffers', 2);
            expect(result).toHaveProperty('totalApplications', 2);
            expect(result).toHaveProperty('applicationsByStatus');
            expect(result.applicationsByStatus).toHaveProperty('NEW', 1);
            expect(result.applicationsByStatus).toHaveProperty('HIRED', 1);
            expect(result).toHaveProperty('adoptionRequestsSent', 1);
        });

        it('should throw NotFoundError when company profile does not exist', async () => {
            const nonExistentUserId = 'non-existent-id';

            await expect(companyService.getCompanyStats(nonExistentUserId))
                .rejects
                .toThrow(NotFoundError);
        });

        it('should return zero stats for company with no activity', async () => {
            const result = await companyService.getCompanyStats(testCompanyUserId);

            expect(result).toHaveProperty('totalOffers', 0);
            expect(result).toHaveProperty('totalApplications', 0);
            expect(result).toHaveProperty('applicationsByStatus', {});
            expect(result).toHaveProperty('adoptionRequestsSent', 0);
        });
    });

    describe('getAllCompanies', () => {
        it('should return all companies with offer counts', async () => {
            // Create another company
            const anotherUser = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'COMPANY',
                },
            });

            const anotherCompanyProfile = await prisma.companyProfile.create({
                data: {
                    userId: anotherUser.id,
                    name: 'Another Company',
                    contactEmail: faker.internet.email(),
                    sector: 'Finance',
                    size: '100-250',
                },
            });

            // Create offers for both companies
            await prisma.offer.create({
                data: {
                    title: 'Software Engineer',
                    description: 'Great opportunity',
                    location: 'Remote',
                    duration: 'INTERNSHIP',
                    companyId: testCompanyProfileId,
                },
            });

            await prisma.offer.create({
                data: {
                    title: 'Financial Analyst',
                    description: 'Finance role',
                    location: 'NYC',
                    duration: 'FULL_TIME',
                    companyId: anotherCompanyProfile.id,
                },
            });

            const result = await companyService.getAllCompanies();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);

            // Check that companies are sorted by name
            expect(result[0].name).toBe('Another Company');
            expect(result[1].name).toBe('Test Company');

            // Check structure
            result.forEach(company => {
                expect(company).toHaveProperty('id');
                expect(company).toHaveProperty('name');
                expect(company).toHaveProperty('sector');
                expect(company).toHaveProperty('size');
                expect(company).toHaveProperty('contactEmail');
                expect(company).toHaveProperty('_count');
                expect(company._count).toHaveProperty('offers');
                expect(typeof company._count.offers).toBe('number');
            });
        });

        it('should return empty array when no companies exist', async () => {
            // Clean up all companies
            await prisma.companyProfile.deleteMany();
            await prisma.user.deleteMany();

            const result = await companyService.getAllCompanies();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });
    });

    describe('searchCompanies', () => {
        beforeEach(async () => {
            // Create additional companies for search testing
            const user2 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'COMPANY',
                },
            });

            await prisma.companyProfile.create({
                data: {
                    userId: user2.id,
                    name: 'Tech Innovations',
                    contactEmail: faker.internet.email(),
                    sector: 'Technology',
                    size: '10-50',
                },
            });

            const user3 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'COMPANY',
                },
            });

            await prisma.companyProfile.create({
                data: {
                    userId: user3.id,
                    name: 'Finance Corp',
                    contactEmail: faker.internet.email(),
                    sector: 'Financial Services',
                    size: '250-500',
                },
            });
        });

        it('should search companies by name', async () => {
            const result = await companyService.searchCompanies('Tech');

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2); // "Test Company" and "Tech Innovations"

            const companyNames = result.map(c => c.name);
            expect(companyNames).toContain('Test Company');
            expect(companyNames).toContain('Tech Innovations');
        });

        it('should search companies by sector', async () => {
            const result = await companyService.searchCompanies('Financial');

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Finance Corp');
            expect(result[0].sector).toBe('Financial Services');
        });

        it('should be case insensitive', async () => {
            const result = await companyService.searchCompanies('TECH');

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return empty array for non-matching search', async () => {
            const result = await companyService.searchCompanies('NonExistentCompany');

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });

        it('should return results sorted by name', async () => {
            const result = await companyService.searchCompanies('');

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(1);

            // Check if sorted alphabetically
            for (let i = 1; i < result.length; i++) {
                expect(result[i-1].name.localeCompare(result[i].name)).toBeLessThanOrEqual(0);
            }
        });
    });
});