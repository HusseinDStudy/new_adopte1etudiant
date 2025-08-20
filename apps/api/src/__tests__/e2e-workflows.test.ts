import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { cleanupDatabase, createTestSkills } from '../helpers/test-setup';
import { FastifyInstance } from 'fastify';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';

describe('End-to-End User Workflows', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await cleanupDatabase();
        // Create some test skills that will be used across workflows
        await createTestSkills(['React', 'Node.Js', 'Python', 'Java', 'TypeScript', 'Vue.Js']);
    });

    describe('Complete Student Journey', () => {
        it('should handle full student workflow: registration → profile → apply to offer → messaging', async () => {
            // Step 1: Student Registration
            const studentData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'STUDENT',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            };

            const registerResponse = await supertest(app.server)
                .post('/api/auth/register')
                .send(studentData);

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body).toHaveProperty('email', studentData.email);

            // Step 2: Student Login
            const loginResponse = await supertest(app.server)
                .post('/api/auth/login')
                .send({
                    email: studentData.email,
                    password: studentData.password,
                });

            expect(loginResponse.status).toBe(200);
            const studentAuthToken = loginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

            // Step 3: Get and verify initial profile (created during registration)
            const initialProfileResponse = await supertest(app.server)
                .get('/api/profile')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(initialProfileResponse.status).toBe(200);
            expect(initialProfileResponse.body).toBeTruthy(); // Basic profile created during registration
            expect(initialProfileResponse.body.firstName).toBe(studentData.firstName);
            expect(initialProfileResponse.body.lastName).toBe(studentData.lastName);

            // Step 4: Create student profile with skills
            const profileData = {
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                school: 'University of Technology',
                degree: 'Computer Science',
                skills: ['React', 'Node.Js', 'TypeScript'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/cv.pdf',
                isCvPublic: true,
            };

            const createProfileResponse = await supertest(app.server)
                .post('/api/profile')
                .set('Cookie', `token=${studentAuthToken}`)
                .send(profileData);

            expect(createProfileResponse.status).toBe(200);
            expect(createProfileResponse.body.firstName).toBe(studentData.firstName);
            expect(createProfileResponse.body.skills).toHaveLength(3);

            // Step 5: Create a company and offer (prerequisite for application)
            const companyData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'COMPANY',
                name: faker.company.name(),
                contactEmail: faker.internet.email(),
            };

            await supertest(app.server)
                .post('/api/auth/register')
                .send(companyData);

            const companyLoginResponse = await supertest(app.server)
                .post('/api/auth/login')
                .send({
                    email: companyData.email,
                    password: companyData.password,
                });

            const companyAuthToken = companyLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

            // Create an offer
            const offerData = {
                title: 'Frontend Developer Internship',
                description: 'React and TypeScript development opportunity',
                location: 'Remote',
                duration: 'INTERNSHIP',
                skills: ['React', 'TypeScript'],
            };

            const createOfferResponse = await supertest(app.server)
                .post('/api/offers')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(offerData);

            expect(createOfferResponse.status).toBe(201);
            const offerId = createOfferResponse.body.id;

            // Step 6: Student views offers and finds match
            const offersResponse = await supertest(app.server)
                .get('/api/offers')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(offersResponse.status).toBe(200);
            expect(offersResponse.body).toHaveProperty('data');
            expect(offersResponse.body).toHaveProperty('pagination');
            expect(offersResponse.body.data).toHaveLength(1);
            
            const foundOffer = offersResponse.body.data[0];
            expect(foundOffer.matchScore).toBeGreaterThan(0); // Should have match score due to overlapping skills

            // Step 7: Student applies to the offer
            const applyResponse = await supertest(app.server)
                .post('/api/applications')
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ offerId });

            expect(applyResponse.status).toBe(201);
            expect(applyResponse.body.studentId).toBeTruthy();
            expect(applyResponse.body.offerId).toBe(offerId);

            // Step 8: Student checks their applications
            const myApplicationsResponse = await supertest(app.server)
                .get('/api/applications/my-applications')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(myApplicationsResponse.status).toBe(200);
            expect(myApplicationsResponse.body.applications).toHaveLength(1);
            expect(myApplicationsResponse.body.applications[0].offer.title).toBe(offerData.title);

            // Step 9: Company views applicants
            const applicantsResponse = await supertest(app.server)
                .get(`/api/offers/${offerId}/applications`)
                .set('Cookie', `token=${companyAuthToken}`);

            expect(applicantsResponse.status).toBe(200);
            expect(applicantsResponse.body.applications).toHaveLength(1);
            expect(applicantsResponse.body.applications[0].student.firstName).toBe(studentData.firstName);

            // Step 10: Company sends adoption request
            const studentUser = await prisma.user.findUnique({
                where: { email: studentData.email }
            });

            const adoptionResponse = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({
                    studentId: studentUser!.id,
                    message: 'We would love to have you join our team!',
                });

            expect(adoptionResponse.status).toBe(201);

            // Step 11: Student views adoption requests
            const myAdoptionRequestsResponse = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(myAdoptionRequestsResponse.status).toBe(200);
            expect(myAdoptionRequestsResponse.body.requests).toHaveLength(1);

            // Step 12: Student views conversations
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(conversationsResponse.status).toBe(200);
            expect(conversationsResponse.body).toHaveProperty('conversations');
            expect(conversationsResponse.body).toHaveProperty('pagination');
            expect(conversationsResponse.body.conversations).toHaveLength(1);
            
            const conversation = conversationsResponse.body.conversations[0];
            expect(conversation.topic).toContain('Demande d\'adoption');

            // Step 13: Student views messages in conversation
            const messagesResponse = await supertest(app.server)
                .get(`/api/messages/conversations/${conversation.id}`)
                .set('Cookie', `token=${studentAuthToken}`);

            expect(messagesResponse.status).toBe(200);
            expect(messagesResponse.body.messages).toHaveLength(1);
            expect(messagesResponse.body.messages[0].content).toContain('love to have you');

            // Step 14: Student replies to message
            const replyResponse = await supertest(app.server)
                .post(`/api/messages/conversations/${conversation.id}`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({
                    content: 'Thank you for your interest! I would love to discuss this opportunity.',
                });

            expect(replyResponse.status).toBe(201);
            expect(replyResponse.body.content).toContain('love to discuss');

            // Step 15: Student accepts adoption request
            const adoptionRequestId = myAdoptionRequestsResponse.body.requests[0].id;
            const acceptResponse = await supertest(app.server)
                .patch(`/api/adoption-requests/${adoptionRequestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'ACCEPTED' });

            expect(acceptResponse.status).toBe(200);
            expect(acceptResponse.body.status).toBe('ACCEPTED');

            // Final verification: Check complete workflow results
            const finalUser = await prisma.user.findUnique({
                where: { email: studentData.email },
                include: {
                    studentProfile: {
                        include: {
                            skills: {
                                include: { skill: true }
                            }
                        }
                    },
                    applications: {
                        include: { offer: true }
                    },
                    adoptionRequests: true,
                }
            });

            expect(finalUser!.studentProfile!.skills).toHaveLength(3);
            expect(finalUser!.applications).toHaveLength(1);
            expect(finalUser!.adoptionRequests).toHaveLength(1);
            expect(finalUser!.adoptionRequests[0].status).toBe('ACCEPTED');
        });

        it('should handle student workflow with rejection', async () => {
            // Create student and company
            const { studentToken, companyToken, offerId, studentUserId } = await createBasicSetup();

            // Student applies
            await supertest(app.server)
                .post('/api/applications')
                .set('Cookie', `token=${studentToken}`)
                .send({ offerId });

            // Company sends adoption request
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyToken}`)
                .send({
                    studentId: studentUserId,
                    message: 'Join our team!',
                });

            // Student rejects
            const adoptionRequestsResponse = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentToken}`);

            const adoptionRequestId = adoptionRequestsResponse.body.requests[0].id;
            
            const rejectResponse = await supertest(app.server)
                .patch(`/api/adoption-requests/${adoptionRequestId}/status`)
                .set('Cookie', `token=${studentToken}`)
                .send({ status: 'REJECTED' });

            expect(rejectResponse.status).toBe(200);
            expect(rejectResponse.body.status).toBe('REJECTED');

            // Verify messaging is disabled after rejection
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentToken}`);

            const conversationId = conversationsResponse.body.conversations[0].id;

            // Student replies to message (should be blocked as conversation is rejected)
            const tryMessageResponse = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}`)
                .set('Cookie', `token=${studentToken}`)
                .send({ content: 'This should be blocked' });

            expect(tryMessageResponse.status).toBe(403);
            expect(tryMessageResponse.body.message).toContain('read-only');
        });
    });

    describe('Complete Company Journey', () => {
        it('should handle full company workflow: registration → profile → create offer → manage applications → messaging', async () => {
            // Step 1: Company Registration
            const companyData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'COMPANY',
                name: faker.company.name(),
                contactEmail: faker.internet.email(),
            };

            const registerResponse = await supertest(app.server)
                .post('/api/auth/register')
                .send(companyData);

            expect(registerResponse.status).toBe(201);

            // Step 2: Company Login
            const loginResponse = await supertest(app.server)
                .post('/api/auth/login')
                .send({
                    email: companyData.email,
                    password: companyData.password,
                });

            const companyAuthToken = loginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

            // Step 3: Get company profile (should exist from registration)
            const profileResponse = await supertest(app.server)
                .get('/api/profile')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(profileResponse.status).toBe(200);
            expect(profileResponse.body.name).toBe(companyData.name);

            // Step 4: Create multiple offers
            const offers = [
                {
                    title: 'Senior React Developer',
                    description: 'Lead our frontend team',
                    location: 'San Francisco',
                    duration: 'FULL_TIME',
                    skills: ['React', 'TypeScript'],
                },
                {
                    title: 'Backend Engineer Intern',
                    description: 'Work with our API team',
                    location: 'Remote',
                    duration: 'INTERNSHIP',
                    skills: ['Node.Js', 'Python'],
                },
            ];

            const createdOffers = [];
            for (const offer of offers) {
                const createResponse = await supertest(app.server)
                    .post('/api/offers')
                    .set('Cookie', `token=${companyAuthToken}`)
                    .send(offer);

                expect(createResponse.status).toBe(201);
                createdOffers.push(createResponse.body);
            }

            // Step 5: View company's offers
            const myOffersResponse = await supertest(app.server)
                .get('/api/offers/my-offers')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(myOffersResponse.status).toBe(200);
            expect(myOffersResponse.body).toHaveLength(2);

            // Step 6: Create some students and applications
            const students = [];
            for (let i = 0; i < 3; i++) {
                const studentData = {
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    role: 'STUDENT',
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                };

                await supertest(app.server)
                    .post('/api/auth/register')
                    .send(studentData);

                const studentLoginResponse = await supertest(app.server)
                    .post('/api/auth/login')
                    .send({
                        email: studentData.email,
                        password: studentData.password,
                    });

                const studentToken = studentLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

                // Create profile for student
                await supertest(app.server)
                    .post('/api/profile')
                    .set('Cookie', `token=${studentToken}`)
                    .send({
                        firstName: studentData.firstName,
                        lastName: studentData.lastName,
                        school: `University ${i + 1}`,
                        degree: 'Computer Science',
                        skills: i === 0 ? ['React', 'TypeScript'] : ['Node.Js', 'Python'],
                        isOpenToOpportunities: true,
                    });

                // Apply to first offer
                const applicationResponse = await supertest(app.server)
                    .post('/api/applications')
                    .set('Cookie', `token=${studentToken}`)
                    .send({ offerId: createdOffers[0].id });

                // Check if application was created successfully
                expect(applicationResponse.status).toBe(201);

                students.push({ ...studentData, token: studentToken });
            }

            // Step 7: Company views applicants
            const applicantsResponse = await supertest(app.server)
                .get(`/api/offers/${createdOffers[0].id}/applications`)
                .set('Cookie', `token=${companyAuthToken}`);

            expect(applicantsResponse.status).toBe(200);
            expect(applicantsResponse.body.applications).toHaveLength(3);

            // Step 8: Company searches for students
            const studentsResponse = await supertest(app.server)
                .get('/api/students?search=University&skills=React')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(studentsResponse.status).toBe(200);
            expect(studentsResponse.body.length).toBeGreaterThanOrEqual(1);

            // Step 9: Company sends adoption request to best candidate
            const bestCandidate = applicantsResponse.body.applications.find((app: any) =>
                app.student.skills.some((skill: string) => skill === 'React')
            );

            const adoptionResponse = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({
                    studentId: bestCandidate.student.userId,
                    message: 'We were impressed by your profile and would love to have you join our team!',
                });

            expect(adoptionResponse.status).toBe(201);

            // Step 10: Company views sent adoption requests
            const sentRequestsResponse = await supertest(app.server)
                .get('/api/adoption-requests/sent-requests')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(sentRequestsResponse.status).toBe(200);
            expect(sentRequestsResponse.body.requests).toHaveLength(1);

            // Step 11: Company manages conversations
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(conversationsResponse.status).toBe(200);
            expect(conversationsResponse.body).toHaveProperty('conversations');
            expect(conversationsResponse.body).toHaveProperty('pagination');
            expect(conversationsResponse.body.conversations).toHaveLength(1);

            // Step 12: Company updates application status
            const applicationId = applicantsResponse.body.applications[0].id;
            const updateStatusResponse = await supertest(app.server)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ status: 'HIRED' });

            expect(updateStatusResponse.status).toBe(200);
            expect(updateStatusResponse.body.status).toBe('HIRED');

            // Final verification
            const finalOffers = await prisma.offer.findMany({
                where: {
                    company: {
                        user: { email: companyData.email }
                    }
                },
                include: {
                    applications: true,
                    _count: { select: { applications: true } }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            expect(finalOffers).toHaveLength(2);
            
            // Find the offer that has applications (should be the first offer created)
            const offerWithApplications = finalOffers.find(offer => offer.applications.length > 0);
            expect(offerWithApplications).toBeDefined();
            expect(offerWithApplications!.applications).toHaveLength(3);
        });
    });

    describe('Complex Multi-User Scenarios', () => {
        it('should handle multiple companies competing for same student', async () => {
            // Create a student
            const studentData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'STUDENT',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            };

            await supertest(app.server)
                .post('/api/auth/register')
                .send(studentData);

            const studentLoginResponse = await supertest(app.server)
                .post('/api/auth/login')
                .send({
                    email: studentData.email,
                    password: studentData.password,
                });

            const studentToken = studentLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

            // Create student profile
            await supertest(app.server)
                .post('/api/profile')
                .set('Cookie', `token=${studentToken}`)
                .send({
                    firstName: studentData.firstName,
                    lastName: studentData.lastName,
                    school: 'Top University',
                    degree: 'Computer Science',
                    skills: ['React', 'Node.Js'],
                    isOpenToOpportunities: true,
                });

            // Create 3 companies
            const companies = [];
            for (let i = 0; i < 3; i++) {
                const companyData = {
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    role: 'COMPANY',
                    name: `Company ${i + 1}`,
                    contactEmail: faker.internet.email(),
                };

                await supertest(app.server)
                    .post('/api/auth/register')
                    .send(companyData);

                const companyLoginResponse = await supertest(app.server)
                    .post('/api/auth/login')
                    .send({
                        email: companyData.email,
                        password: companyData.password,
                    });

                const companyToken = companyLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');
                companies.push({ ...companyData, token: companyToken });
            }

            // Get student user ID
            const studentUser = await prisma.user.findUnique({
                where: { email: studentData.email }
            });

            // All companies send adoption requests
            for (let i = 0; i < companies.length; i++) {
                const adoptionResponse = await supertest(app.server)
                    .post('/api/adoption-requests')
                    .set('Cookie', `token=${companies[i].token}`)
                    .send({
                        studentId: studentUser!.id,
                        message: `Join ${companies[i].name} - we offer the best opportunities!`,
                    });

                expect(adoptionResponse.status).toBe(201);
            }

            // Student views all adoption requests
            const adoptionRequestsResponse = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentToken}`);

            expect(adoptionRequestsResponse.status).toBe(200);
            expect(adoptionRequestsResponse.body.requests).toHaveLength(3);

            // Student accepts one and rejects others
            const requests = adoptionRequestsResponse.body.requests;
            
            // Accept first
            await supertest(app.server)
                .patch(`/api/adoption-requests/${requests[0].id}/status`)
                .set('Cookie', `token=${studentToken}`)
                .send({ status: 'ACCEPTED' });

            // Reject others
            for (let i = 1; i < requests.length; i++) {
                await supertest(app.server)
                    .patch(`/api/adoption-requests/${requests[i].id}/status`)
                    .set('Cookie', `token=${studentToken}`)
                    .send({ status: 'REJECTED' });
            }

            // Verify final states
            const finalRequests = await prisma.adoptionRequest.findMany({
                where: { studentId: studentUser!.id }
            });

            expect(finalRequests.filter(r => r.status === 'ACCEPTED')).toHaveLength(1);
            expect(finalRequests.filter(r => r.status === 'REJECTED')).toHaveLength(2);
        });
    });

    // Helper function for common setup
    async function createBasicSetup() {
        // Create student
        const studentData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };

        await supertest(app.server).post('/api/auth/register').send(studentData);
        const studentLoginResponse = await supertest(app.server)
            .post('/api/auth/login')
            .send({ email: studentData.email, password: studentData.password });
        const studentToken = studentLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

        // Create company
        const companyData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: faker.company.name(),
            contactEmail: faker.internet.email(),
        };

        await supertest(app.server).post('/api/auth/register').send(companyData);
        const companyLoginResponse = await supertest(app.server)
            .post('/api/auth/login')
            .send({ email: companyData.email, password: companyData.password });
        const companyToken = companyLoginResponse.headers['set-cookie'][0].split(';')[0].replace('token=', '');

        // Create offer
        const createOfferResponse = await supertest(app.server)
            .post('/api/offers')
            .set('Cookie', `token=${companyToken}`)
            .send({
                title: 'Test Position',
                description: 'Test Description',
                location: 'Remote',
                duration: 'INTERNSHIP',
                skills: ['React'],
            });

        const studentUser = await prisma.user.findUnique({
            where: { email: studentData.email }
        });

        return {
            studentToken,
            companyToken,
            offerId: createOfferResponse.body.id,
            studentUserId: studentUser!.id,
        };
    }
}); 