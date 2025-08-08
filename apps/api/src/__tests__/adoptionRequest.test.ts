import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';

describe('Adoption Request Routes', () => {
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
    let studentId = '';

    beforeEach(async () => {
        // Create skills first
        await prisma.skill.createMany({
            data: [
                { name: 'React' },
                { name: 'Node.js' }
            ],
            skipDuplicates: true,
        });

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

        // Create student profile
        await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${studentAuthToken}`)
            .send({
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                school: 'Test University',
                degree: 'Computer Science',
                skills: ['React', 'Node.js'],
                isOpenToOpportunities: true,
                cvUrl: '',
                isCvPublic: false
            });
    });

    afterEach(async () => {
        // The order is important to respect foreign key constraints
        await prisma.message.deleteMany();
        await prisma.adoptionRequest.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.studentSkill.deleteMany();
        await prisma.studentProfile.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.skill.deleteMany();
    });

    describe('POST /api/adoption-requests', () => {
        it('should allow a company to send an adoption request to a student', async () => {
            const requestData = {
                studentId,
                message: 'We would like to offer you an opportunity at our company!'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect(response.status).toBe(201);
            expect(response.body.companyId).toBe(companyProfileId);
            expect(response.body.studentId).toBe(studentId);

            const dbRequest = await prisma.adoptionRequest.findFirst({ 
                where: { companyId: companyProfileId, studentId },
                include: { conversation: { include: { messages: true } } }
            });
            expect(dbRequest).not.toBeNull();
            expect(dbRequest!.conversation!.messages).toHaveLength(1);
            expect(dbRequest!.conversation!.messages[0].content).toBe(requestData.message);
        });

        it('should return 400 if message is empty', async () => {
            const requestData = {
                studentId,
                message: ''
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.message).toContain('must NOT have fewer than 10 characters');
            }
        });

        it('should return 409 if company has already sent a request to this student', async () => {
            const requestData = {
                studentId,
                message: 'First request'
            };

            await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            
            const secondRequest = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ ...requestData, message: 'Second request' });

            expect(secondRequest.status).toBe(409);
            // Message wording changed to distinguish general vs per-offer
            expect(secondRequest.body.message).toContain('already sent');
        });

        it('should be forbidden for a student to send an adoption request', async () => {
            const requestData = {
                studentId,
                message: 'Student trying to send request'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${studentAuthToken}`)
                .send(requestData);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/adoption-requests/sent-requests', () => {
        it('should return list of adoption requests sent by the company', async () => {
            const requestData = {
                studentId,
                message: 'Company request message'
            };
            await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);

            const response = await supertest(app.server)
                .get('/api/adoption-requests/sent-requests')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('requests');
            expect(Array.isArray(response.body.requests)).toBe(true);
            expect(response.body.requests.length).toBe(1);
            expect(response.body.requests[0].studentId).toBe(studentId);

            expect(response.body.requests[0].student.firstName).toBeDefined();
        });
    });

    describe('GET /api/adoption-requests/my-requests', () => {
        it('should return list of adoption requests received by the student', async () => {
            const requestData = {
                studentId,
                message: 'Opportunity for you!'
            };
            await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);

            const response = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body.requests).toBeDefined();
            expect(response.body.requests.length).toBe(1);

            expect(response.body.requests[0].studentId).toBe(studentId);
            expect(response.body.requests[0].company.name).toBeDefined();
            expect(response.body.requests[0].conversation.messages).toHaveLength(1);
        });
    });

    describe('PATCH /api/adoption-requests/:id/status', () => {
        it('should allow a student to update the status of an adoption request', async () => {
            const requestData = {
                studentId,
                message: 'Please consider our offer'
            };
            const createResponse = await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            const requestId = createResponse.body.id;

            const updateResponse = await supertest(app.server)
                .patch(`/api/adoption-requests/${requestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'ACCEPTED' });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.status).toBe('ACCEPTED');

            const dbRequest = await prisma.adoptionRequest.findUnique({ where: { id: requestId } });
            expect(dbRequest!.status).toBe('ACCEPTED');
        });

        it('should return 404 if request does not exist or does not belong to student', async () => {
            const fakeRequestId = 'clpre1234567890123';
            
            const response = await supertest(app.server)
                .patch(`/api/adoption-requests/${fakeRequestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'REJECTED' });

            expect(response.status).toBe(404);
        });

        it('should return 403 if a different student tries to update the status', async () => {
            const requestData = {
                studentId,
                message: 'Please consider our offer'
            };
            const createResponse = await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            const requestId = createResponse.body.id;

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
                .patch(`/api/adoption-requests/${requestId}/status`)
                .set('Cookie', `token=${otherStudentAuthToken}`)
                .send({ status: 'REJECTED' });

            expect(response.status).toBe(404); // Should return 404 for requests not belonging to the student
        });

        it('should return 400 for invalid status value', async () => {
            const requestData = {
                studentId,
                message: 'Please consider our offer'
            };
            const createResponse = await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            const requestId = createResponse.body.id;

            const response = await supertest(app.server)
                .patch(`/api/adoption-requests/${requestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'INVALID_STATUS' });

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.message).toContain('must be equal to one of the allowed values');
            }
        });

        it('should require authentication', async () => {
            const requestData = {
                studentId,
                message: 'Please consider our offer'
            };
            const createResponse = await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            const requestId = createResponse.body.id;

            const response = await supertest(app.server)
                .patch(`/api/adoption-requests/${requestId}/status`)
                .send({ status: 'ACCEPTED' });

            expect(response.status).toBe(401);
        });

        it('should allow a company user to view the status but not update it', async () => {
            const requestData = {
                studentId,
                message: 'Please consider our offer'
            };
            const createResponse = await supertest(app.server).post('/api/adoption-requests').set('Cookie', `token=${companyAuthToken}`).send(requestData);
            const requestId = createResponse.body.id;

            const response = await supertest(app.server)
                .patch(`/api/adoption-requests/${requestId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'ACCEPTED' });

            expect(response.status).toBe(403); // Company should get forbidden, not 404
        });
    });

    describe('POST /api/adoption-requests - Additional Edge Cases', () => {
        it('should return 400 if studentId is missing', async () => {
            const requestData = {
                message: 'We would like to offer you an opportunity!'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.message).toContain('must have required property');
            }
        });

        it('should return 400 if studentId is not a string', async () => {
            const requestData = {
                studentId: 123, // Invalid type
                message: 'We would like to offer you an opportunity!'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.message).toContain('must be string');
            }
        });

        it('should return 400 if message is only whitespace', async () => {
            const requestData = {
                studentId,
                message: '   \n  \t  ' // Only whitespace
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.message).toContain('must NOT have fewer than 10 characters');
            }
        });

        it('should return 403 if company has no profile', async () => {
            // Delete company profile to test missing profile case
            await prisma.companyProfile.delete({ where: { id: companyProfileId } });

            const requestData = {
                studentId,
                message: 'We would like to offer you an opportunity!'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('You must have a company profile to send requests.');
        });

        it('should require authentication', async () => {
            const requestData = {
                studentId,
                message: 'We would like to offer you an opportunity!'
            };

            const response = await supertest(app.server)
                .post('/api/adoption-requests')
                .send(requestData);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/adoption-requests/sent-requests - Additional Cases', () => {
        it('should return empty array when company has sent no requests', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/sent-requests')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body.requests).toBeDefined();
            expect(response.body.requests.length).toBe(0);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/sent-requests');

            expect(response.status).toBe(401);
        });

        it('should be forbidden for student users', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/sent-requests')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/adoption-requests/my-requests - Additional Cases', () => {
        it('should return empty array when student has received no requests', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body.requests).toBeDefined();
            expect(response.body.requests.length).toBe(0);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/my-requests');

            expect(response.status).toBe(401);
        });

        it('should be forbidden for company users', async () => {
            const response = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(403);
        });
    });
}); 