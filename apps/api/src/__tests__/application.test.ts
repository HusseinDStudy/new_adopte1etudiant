import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';

describe('Application Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    let companyAuthToken = '';
    let studentAuthToken = '';
    let companyProfileId = '';
    let studentProfileId = '';
    let offerId = '';
    let studentId = '';

    beforeEach(async () => {
        // 1. Create Company User and Profile
        const companyData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: faker.company.name(),
            contactEmail: faker.internet.email(),
        };
        await supertest(app.server).post('/api/auth/register').send(companyData);
        const companyLoginResponse = await supertest(app.server).post('/api/auth/login').send({ email: companyData.email, password: companyData.password });
        const companyCookie = companyLoginResponse.headers['set-cookie'][0];
        companyAuthToken = companyCookie.split(';')[0].replace('token=', '');
        const companyUser = await prisma.user.findUnique({ where: { email: companyData.email } });
        const cProfile = await prisma.companyProfile.findUnique({ where: { userId: companyUser!.id }});
        companyProfileId = cProfile!.id;

        // 2. Create Student User and Profile
        const studentData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };
        await supertest(app.server).post('/api/auth/register').send(studentData);
        const studentLoginResponse = await supertest(app.server).post('/api/auth/login').send({ email: studentData.email, password: studentData.password });
        const studentCookie = studentLoginResponse.headers['set-cookie'][0];
        studentAuthToken = studentCookie.split(';')[0].replace('token=', '');
        const studentUser = await prisma.user.findUnique({ where: { email: studentData.email } });
        studentId = studentUser!.id;
        const sProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser!.id }});
        studentProfileId = sProfile!.id;
        
        // 3. Create an Offer
        const offer = await prisma.offer.create({
            data: {
                title: 'Test Offer',
                description: 'Test Description',
                companyId: companyProfileId,
                location: 'Remote',
            }
        });
        offerId = offer.id;
    });

    afterEach(async () => {
        // The order is important to respect foreign key constraints
        await prisma.application.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.studentProfile.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('POST /api/applications', () => {
        it('should allow a student to apply for an offer', async () => {
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId });

            expect(response.status).toBe(201);
            expect(response.body.offerId).toBe(offerId);
            expect(response.body.studentId).toBe(studentId);

            const dbApplication = await prisma.application.findFirst({ where: { offerId, studentId }});
            expect(dbApplication).not.toBeNull();
        });

        it('should return 404 if the offer does not exist', async () => {
            const fakeOfferId = 'clpre1234567890123';
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId: fakeOfferId });
            
            expect(response.status).toBe(404);
        });

        it('should return 409 if the student has already applied', async () => {
            await supertest(app.server).post(`/api/applications`).set('Cookie', `token=${studentAuthToken}`).send({ offerId });
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId });

            expect(response.status).toBe(409);
        });

        it('should be forbidden for a company to apply', async () => {
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ offerId });
            
            expect(response.status).toBe(403);
        });

        it('should return 400 for invalid request body', async () => {
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ invalidField: 'invalid' });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('must have required property');
        });

        it('should return 403 if student has no profile', async () => {
            // Delete student profile to test missing profile case
            await prisma.studentProfile.delete({ where: { id: studentProfileId } });
            
            const response = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId });
            
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('You must have a profile to apply.');
        });
    });

    describe('GET /api/applications/my-applications', () => {
        it('should return a list of applications for the authenticated student', async () => {
            await supertest(app.server).post(`/api/applications`).set('Cookie', `token=${studentAuthToken}`).send({ offerId });
            
            const response = await supertest(app.server)
                .get('/api/applications/my-applications')
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('applications');
            expect(Array.isArray(response.body.applications)).toBe(true);
            expect(response.body.applications.length).toBe(1);
            expect(response.body.applications[0].offer.id).toBe(offerId);
        });

        it('should return empty array when student has no applications', async () => {
            const response = await supertest(app.server)
                .get('/api/applications/my-applications')
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('applications');
            expect(Array.isArray(response.body.applications)).toBe(true);
            expect(response.body.applications.length).toBe(0);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/applications/my-applications');
            
            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/applications/:id/status', () => {
        let applicationId: string;

        beforeEach(async () => {
            const applicationResponse = await supertest(app.server)
                .post(`/api/applications`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId });
            applicationId = applicationResponse.body.id;
        });

        it('should allow company to update application status', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'INTERVIEW' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('INTERVIEW');

            const dbApplication = await prisma.application.findUnique({ where: { id: applicationId } });
            expect(dbApplication!.status).toBe('INTERVIEW');
        });

        it('should create conversation when status is HIRED', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'HIRED' });

            expect(response.status).toBe(200);

            const dbApplication = await prisma.application.findUnique({ 
                where: { id: applicationId },
                include: { conversation: true }
            });
            expect(dbApplication!.conversation).toBeDefined();
        });

        it('should create conversation when status is INTERVIEW', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'INTERVIEW' });

            expect(response.status).toBe(200);

            const dbApplication = await prisma.application.findUnique({ 
                where: { id: applicationId },
                include: { conversation: true }
            });
            expect(dbApplication!.conversation).toBeDefined();
        });

        it('should not create conversation for other statuses', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'REJECTED' });

            expect(response.status).toBe(200);

            const dbApplication = await prisma.application.findUnique({ 
                where: { id: applicationId },
                include: { conversation: true }
            });
            expect(dbApplication!.conversation).not.toBeNull();
            expect(dbApplication!.conversation!.status).toBe('ARCHIVED');
            expect(dbApplication!.conversation!.isReadOnly).toBe(true);
        });

        it('should not create duplicate conversation if one already exists', async () => {
            // First create a conversation
            await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'INTERVIEW' });

            // Try to create another with HIRED status
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'HIRED' });

            expect(response.status).toBe(200);

            const conversationCount = await prisma.conversation.count({
                where: { 
                    application: { 
                        id: applicationId 
                    }
                }
            });
            expect(conversationCount).toBe(1); // Should only have one conversation
        });

        it('should return 404 if application does not exist', async () => {
            const fakeApplicationId = 'clpre1234567890123';
            const response = await supertest(app.server)
                .patch(`/api/applications/${fakeApplicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'INTERVIEW' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Application not found.');
        });

        it('should return 403 if company does not own the offer', async () => {
            // Create another company
            const otherCompanyData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'COMPANY',
                name: faker.company.name(),
                contactEmail: faker.internet.email(),
            };
            await supertest(app.server).post('/api/auth/register').send(otherCompanyData);
            const otherCompanyLoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
                email: otherCompanyData.email, 
                password: otherCompanyData.password 
            });
            const otherCompanyCookie = otherCompanyLoginResponse.headers['set-cookie'][0];
            const otherCompanyAuthToken = otherCompanyCookie.split(';')[0].replace('token=', '');

            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${otherCompanyAuthToken}`)
                .send({ status: 'INTERVIEW' });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('You do not have permission to update this application.');
        });

        it('should return 400 for invalid status value', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'INVALID_STATUS' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('must be equal to one of the allowed values');
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .send({ status: 'INTERVIEW' });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/applications/:id', () => {
        it('should allow a student to withdraw their application', async () => {
            const applicationResponse = await supertest(app.server).post(`/api/applications`).set('Cookie', `token=${studentAuthToken}`).send({ offerId });
            const applicationId = applicationResponse.body.id;

            const deleteResponse = await supertest(app.server)
                .delete(`/api/applications/${applicationId}`)
                .set('Cookie', `token=${studentAuthToken}`);

            expect(deleteResponse.status).toBe(204);

            const dbApplication = await prisma.application.findUnique({ where: { id: applicationId } });
            expect(dbApplication).toBeNull();
        });

        it('should return 404 if application does not exist', async () => {
            const fakeApplicationId = 'clpre1234567890123';
            const response = await supertest(app.server)
                .delete(`/api/applications/${fakeApplicationId}`)
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Application not found.');
        });

        it('should return 403 if student does not own the application', async () => {
            const applicationResponse = await supertest(app.server).post(`/api/applications`).set('Cookie', `token=${studentAuthToken}`).send({ offerId });
            const applicationId = applicationResponse.body.id;

            // Create another student
            const otherStudentData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'STUDENT',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            };
            await supertest(app.server).post('/api/auth/register').send(otherStudentData);
            const otherStudentLoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
                email: otherStudentData.email, 
                password: otherStudentData.password 
            });
            const otherStudentCookie = otherStudentLoginResponse.headers['set-cookie'][0];
            const otherStudentAuthToken = otherStudentCookie.split(';')[0].replace('token=', '');

            const response = await supertest(app.server)
                .delete(`/api/applications/${applicationId}`)
                .set('Cookie', `token=${otherStudentAuthToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('You do not have permission to delete this application.');
        });

        it('should require authentication', async () => {
            const applicationResponse = await supertest(app.server).post(`/api/applications`).set('Cookie', `token=${studentAuthToken}`).send({ offerId });
            const applicationId = applicationResponse.body.id;

            const response = await supertest(app.server)
                .delete(`/api/applications/${applicationId}`);

            expect(response.status).toBe(401);
        });
    });
}); 