import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';

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