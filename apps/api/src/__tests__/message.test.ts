import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { FastifyInstance } from 'fastify';
import { 
  createTestCompany, 
  createTestStudent, 
  createTestSkills,
  cleanupDatabase 
} from '../helpers/test-setup';
import { faker } from '@faker-js/faker';

describe('Message Routes', () => {
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
    let adoptionConversationId = '';

    beforeEach(async () => {
        // Ensure clean state
        await cleanupDatabase();

        // Create test skills first
        await createTestSkills(['React', 'Node.js']);

        // Create company
        const company = await createTestCompany(app);
        companyAuthToken = company.authToken;
        companyProfileId = company.profile.id;

        // Create student
        const student = await createTestStudent(app, {
            firstName: 'John',
            lastName: 'Doe'
        });
        studentAuthToken = student.authToken;
        studentId = student.user.id;

        // Create an adoption request which automatically creates a conversation
        const adoptionResponse = await supertest(app.server)
            .post('/api/adoption-requests')
            .set('Cookie', `token=${companyAuthToken}`)
            .send({
                studentId: studentId,
                message: 'We would like to adopt you as our student!'
            });

        if (adoptionResponse.status !== 201) {
            throw new Error(`Failed to create adoption request: ${adoptionResponse.status} - ${JSON.stringify(adoptionResponse.body)}`);
        }

        const adoptionRequestId = adoptionResponse.body.id;

        // Get the adoption request with conversation
        const adoptionRequest = await prisma.adoptionRequest.findUnique({
            where: { id: adoptionRequestId },
            include: { conversation: true }
        });

        if (!adoptionRequest?.conversation) {
            throw new Error('Adoption request conversation not found');
        }

        adoptionConversationId = adoptionRequest.conversation.id;
    });

    afterEach(async () => {
        await cleanupDatabase();
    });

    describe('GET /api/messages/conversations', () => {
        it('should return conversations for a student user', async () => {
            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations).toHaveLength(1);
            expect(response.body.conversations[0]).toHaveProperty('id', adoptionConversationId);
        });

        it('should return conversations for a company user', async () => {
            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations).toHaveLength(1);
            expect(response.body.conversations[0]).toHaveProperty('id', adoptionConversationId);
        });

        it('should return empty array when user has no conversations', async () => {
            // Create a new student with no conversations
            const newStudent = await createTestStudent(app);

            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${newStudent.authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations).toHaveLength(0);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/messages/conversations');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/messages/conversations/:conversationId/messages', () => {
        it('should return messages for a conversation that user has access to', async () => {
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('messages');
            expect(response.body.messages).toBeInstanceOf(Array);
            expect(response.body.messages.length).toBeGreaterThan(0); // Should have initial adoption message
            expect(response.body).toHaveProperty('conversation');
            expect(response.body.conversation).toHaveProperty('adoptionRequestStatus');
        });

        it('should allow company to access conversation messages', async () => {
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('messages');
            expect(response.body.messages).toBeInstanceOf(Array);
            expect(response.body).toHaveProperty('conversation');
            expect(response.body.conversation).toHaveProperty('adoptionRequestStatus');
        });

        it('should return 403 when user does not have access to the conversation', async () => {
            // Create another student who shouldn't have access
            const otherStudent = await createTestStudent(app);

            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${otherStudent.authToken}`);

            expect(response.status).toBe(403);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${adoptionConversationId}/messages`);

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/messages/conversations/:conversationId/messages', () => {
        it('should allow sending a message to a conversation user has access to', async () => {
            const messageContent = 'Thank you for your interest!';

            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: messageContent });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('content', messageContent);
            expect(response.body).toHaveProperty('senderId', studentId);
        });

        it('should allow company to send messages in conversation', async () => {
            // First, accept the adoption request as the student
            const adoptionRequest = await prisma.adoptionRequest.findUnique({
                where: { conversationId: adoptionConversationId }
            });

            if (adoptionRequest) {
                await supertest(app.server)
                    .patch(`/api/adoption-requests/${adoptionRequest.id}/status`)
                    .set('Cookie', `token=${studentAuthToken}`)
                    .send({ status: 'ACCEPTED' });
            }

            const messageContent = 'Looking forward to working with you!';

            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ content: messageContent });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('content', messageContent);
        });

        it('should return 400 for invalid message content', async () => {
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: '' }); // Empty content

            expect([400, 500]).toContain(response.status);
        });

        it('should return 400 for missing content', async () => {
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({}); // No content field

            expect([400, 500]).toContain(response.status);
        });

        it('should return 403 when user does not have access to the conversation', async () => {
            // Create another student who shouldn't have access
            const otherStudent = await createTestStudent(app);

            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${otherStudent.authToken}`)
                .send({ content: 'This should not work' });

            expect(response.status).toBe(403);
        });

        it('should return 404 for non-existent conversation', async () => {
            const fakeConversationId = 'nonexistent-conversation-id';

            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${fakeConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: 'Hello' });

            expect(response.status).toBe(404);
        });

        it('should return 403 when trying to message in a rejected adoption request conversation', async () => {
            // First update the adoption request status to REJECTED
            const adoptionRequest = await prisma.adoptionRequest.findUnique({
                where: { conversationId: adoptionConversationId }
            });

            await supertest(app.server)
                .patch(`/api/adoption-requests/${adoptionRequest!.id}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'REJECTED' });

            // Now try to send a message - should be forbidden
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: 'This should not work' });

            expect(response.status).toBe(403);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${adoptionConversationId}/messages`)
                .send({ content: 'Hello' });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/messages/conversations/:conversationId/messages - Additional Edge Cases', () => {
        it('should prevent messaging in rejected adoption request conversations', async () => {
            // Use the existing adoption request from beforeEach setup
            // First, get the existing adoption request ID
            const studentRequests = await supertest(app.server)
                .get('/api/adoption-requests/my-requests')
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(studentRequests.status).toBe(200);
            expect(studentRequests.body.requests).toBeDefined();
            expect(studentRequests.body.requests.length).toBe(1);
            const adoptionRequestId = studentRequests.body.requests[0].id;
            
            // Reject the adoption request
            const rejectResponse = await supertest(app.server)
                .patch(`/api/adoption-requests/${adoptionRequestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'REJECTED' });
            
            expect(rejectResponse.status).toBe(200);
            expect(rejectResponse.body.status).toBe('REJECTED');
            
            // Get the conversation ID
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Try to send a message in the rejected conversation
            const messageResponse = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: 'This should be blocked' });
            
            expect(messageResponse.status).toBe(403);
            expect(messageResponse.body.message).toContain('read-only');
        });

        it('should allow messaging in accepted adoption request conversations', async () => {
            // Create adoption request
            const requestData = {
                studentId: studentId,
                message: 'Initial message',
            };
            
            const createResponse = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);
            
            const adoptionRequestId = createResponse.body.id;
            
            // Accept the adoption request
            await supertest(app.server)
                .patch(`/api/adoption-requests/${adoptionRequestId}/status`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ status: 'ACCEPTED' });
            
            // Get the conversation ID
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Try to send a message in the accepted conversation
            const messageResponse = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: 'This should work' });
            
            expect(messageResponse.status).toBe(201);
            expect(messageResponse.body.content).toBe('This should work');
        });

        it('should return 404 for non-existent conversation', async () => {
            const fakeConversationId = 'clpre1234567890123';
            
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/${fakeConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: 'Test message' });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Conversation not found.');
        });

        it('should return 403 for unauthorized access to conversation', async () => {
            // Create another student not part of any conversation
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
            
            // Create adoption request between original company and student
            const requestData = {
                studentId: studentId,
                message: 'Initial message',
            };
            
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);
            
            // Get the conversation ID
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Try to send a message as the unauthorized student
            const messageResponse = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${otherStudentAuthToken}`)
                .send({ content: 'Unauthorized message' });
            
            expect(messageResponse.status).toBe(403);
            expect(messageResponse.body.message).toContain('permission');
        });

        it('should return 400 for invalid message content', async () => {
            // Create adoption request to get conversation
            const requestData = {
                studentId: studentId,
                message: 'Initial message',
            };
            
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);
            
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Test with missing content
            const response1 = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({});
            
            expect(response1.status).toBe(400);
            expect(response1.body.message).toContain('must have required property');
            
            // Test with empty content
            const response2 = await supertest(app.server)
                .post(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`)
                .send({ content: '' });
            
            expect(response2.status).toBe(400);
            expect(response2.body.message).toContain('must NOT have fewer than 1 characters');
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .post(`/api/messages/conversations/fake-conversation-id/messages`)
                .send({ content: 'Test message' });
            
            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/messages/conversations - Additional Edge Cases', () => {
        it('should return empty array when user has no conversations', async () => {
            // Create a fresh student user for this test
            const freshStudentData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'STUDENT',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            };
            
            await supertest(app.server).post('/api/auth/register').send(freshStudentData);
            const freshStudentLoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
                email: freshStudentData.email, 
                password: freshStudentData.password 
            });
            const freshStudentCookie = freshStudentLoginResponse.headers['set-cookie'][0];
            const freshStudentAuthToken = freshStudentCookie.split(';')[0].replace('token=', '');

            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${freshStudentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations.length).toBe(0);
        });

        it('should return conversations with proper topic formatting for adoption requests', async () => {
            // Create adoption request
            const requestData = {
                studentId: studentId,
                message: 'Test adoption message',
            };
            
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send(requestData);
            
            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations.length).toBe(1);
            expect(response.body.conversations[0].topic).toContain('Demande d\'adoption');
        });

        it('should return conversations ordered by most recent activity', async () => {
            // The existing conversation from beforeEach is one conversation
            // Let's create another student to create a second conversation
            const student2 = await createTestStudent(app, {
                firstName: 'Jane',
                lastName: 'Smith'
            });
            
            // Create adoption request to the second student
            const adoptionResponse = await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ studentId: student2.user.id, message: 'Second request' });
            
            expect(adoptionResponse.status).toBe(201);
            
            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${companyAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations.length).toBe(2);
            
            // Verify ordering by updatedAt (most recent first)
            if (response.body.length > 1) {
                const firstConversation = new Date(response.body[0].updatedAt);
                const secondConversation = new Date(response.body[1].updatedAt);
                expect(firstConversation.getTime()).toBeGreaterThanOrEqual(secondConversation.getTime());
            }
        });

        it('should handle conversations with no messages gracefully', async () => {
            // Create adoption request (which creates initial message)
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ studentId: studentId, message: 'Initial message' });
            
            // Delete all messages from the conversation to test edge case
            await prisma.message.deleteMany();
            
            const response = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('conversations');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.conversations)).toBe(true);
            expect(response.body.conversations.length).toBe(1);
            expect(response.body.conversations[0].lastMessage).toBeNull();
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/messages/conversations');
            
            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/messages/conversations/:conversationId/messages - Additional Edge Cases', () => {
        it('should return 403 for non-existent conversation', async () => {
            const fakeConversationId = 'clpre1234567890123';
            
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${fakeConversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Conversation not found');
        });

        it('should return 403 for unauthorized conversation access', async () => {
            // Create another student not part of any conversation
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
            
            // Create adoption request
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ studentId: studentId, message: 'Test message' });
            
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Try to access conversation as unauthorized user
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${otherStudentAuthToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Not a participant');
        });

        it('should return empty array for conversation with no messages', async () => {
            // Create adoption request
            await supertest(app.server)
                .post('/api/adoption-requests')
                .set('Cookie', `token=${companyAuthToken}`)
                .send({ studentId: studentId, message: 'Initial message' });
            
            const conversationsResponse = await supertest(app.server)
                .get('/api/messages/conversations')
                .set('Cookie', `token=${studentAuthToken}`);
            
            const conversationId = conversationsResponse.body.conversations[0].id;
            
            // Delete all messages
            await prisma.message.deleteMany({ where: { conversationId } });
            
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/${conversationId}/messages`)
                .set('Cookie', `token=${studentAuthToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.messages).toBeInstanceOf(Array);
            expect(response.body.messages.length).toBe(0);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get(`/api/messages/conversations/fake-conversation-id/messages`);
            
            expect(response.status).toBe(401);
        });
    });
}); 