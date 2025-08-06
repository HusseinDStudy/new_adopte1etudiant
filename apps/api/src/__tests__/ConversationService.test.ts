import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from 'db-postgres';
import { ConversationService } from '../services/ConversationService';
import { buildTestApp } from '../helpers/test-app.js';
import { createTestStudent, createTestCompany } from '../helpers/test-setup.js';

describe('ConversationService', () => {
  let app: any;
  let conversationService: ConversationService;
  let testStudent: any;
  let testCompany: any;
  let testAdmin: any;

  beforeAll(async () => {
    app = await buildTestApp();
    conversationService = new ConversationService();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up conversations and participants
    await prisma.conversationParticipant.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();

    // Create test users
    const studentData = await createTestStudent(app, { email: 'conversation-student@test.com' });
    const companyData = await createTestCompany(app, { email: 'conversation-company@test.com' });
    
    // Create admin user manually since there's no createTestAdmin helper
    const adminUser = await prisma.user.create({
      data: {
        email: 'conversation-admin@test.com',
        passwordHash: 'hashedpassword',
        role: 'ADMIN',
        isActive: true
      }
    });

    testStudent = await prisma.user.findUnique({ where: { id: studentData.user.id } });
    testCompany = await prisma.user.findUnique({ where: { id: companyData.user.id } });
    testAdmin = adminUser;
  });

  describe('getUserConversations', () => {
    test('should return user conversations with pagination', async () => {
      // Create test conversations
      const conversation1 = await prisma.conversation.create({
        data: {
          topic: 'Test Conversation 1',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testStudent.id,
              content: 'Hello from student'
            }
          }
        }
      });

      const conversation2 = await prisma.conversation.create({
        data: {
          topic: 'Test Conversation 2',
          context: 'OFFER',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testAdmin.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Hello from admin'
            }
          }
        }
      });

      const result = await conversationService.getUserConversations(testStudent.id, {
        page: 1,
        limit: 10
      });

      expect(result.conversations).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });

      // Verify conversation data structure
      const conv1 = result.conversations.find(c => c.id === conversation1.id);
      expect(conv1).toBeDefined();
      expect(conv1?.topic).toBe('Test Conversation 1');
      expect(conv1?.context).toBe('ADOPTION_REQUEST');
      expect(conv1?.participants).toHaveLength(2);
      expect(conv1?.lastMessage).toBeDefined();
    });

    test('should handle pagination correctly', async () => {
      // Create multiple conversations
      for (let i = 1; i <= 15; i++) {
        await prisma.conversation.create({
          data: {
            topic: `Test Conversation ${i}`,
            context: 'ADOPTION_REQUEST',
            status: 'ACTIVE',
            participants: {
              create: [
                { userId: testStudent.id },
                { userId: testCompany.id }
              ]
            },
            messages: {
              create: {
                senderId: testStudent.id,
                content: `Message ${i}`
              }
            }
          }
        });
      }

      const result = await conversationService.getUserConversations(testStudent.id, {
        page: 1,
        limit: 5
      });

      expect(result.conversations).toHaveLength(5);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 15,
        totalPages: 3
      });
    });

    test('should filter by context', async () => {
      // Create conversations with different contexts
      await prisma.conversation.create({
        data: {
          topic: 'Adoption Request',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testStudent.id,
              content: 'Adoption request message'
            }
          }
        }
      });

      await prisma.conversation.create({
        data: {
          topic: 'Offer Discussion',
          context: 'OFFER',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testCompany.id,
              content: 'Offer message'
            }
          }
        }
      });

      const result = await conversationService.getUserConversations(testStudent.id, {
        page: 1,
        limit: 10,
        context: 'ADOPTION_REQUEST'
      });

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].context).toBe('ADOPTION_REQUEST');
    });

    test('should handle user with no conversations', async () => {
      const newStudent = await createTestStudent(app, { email: 'new-student@test.com' });
      const newStudentUser = await prisma.user.findUnique({ where: { id: newStudent.user.id } });

      const result = await conversationService.getUserConversations(newStudentUser!.id, {
        page: 1,
        limit: 10
      });

      expect(result.conversations).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    });
  });

  describe('getBroadcastConversationsForUser', () => {
    test('should return broadcast conversations for student', async () => {
      // Create broadcast conversations
      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to All',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'ALL',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Broadcast to all users'
            }
          }
        }
      });

      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to Students',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'STUDENTS',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testStudent.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Broadcast to students only'
            }
          }
        }
      });

      const result = await conversationService.getBroadcastConversationsForUser(testStudent.id, {
        page: 1,
        limit: 10
      });

      expect(result.conversations).toHaveLength(2);
      expect(result.conversations.every(c => c.isBroadcast)).toBe(true);
      expect(result.conversations.every(c => c.isReadOnly)).toBe(true);
    });

    test('should return broadcast conversations for company', async () => {
      // Create broadcast conversations
      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to All',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'ALL',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Broadcast to all users'
            }
          }
        }
      });

      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to Companies',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'COMPANIES',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Broadcast to companies only'
            }
          }
        }
      });

      const result = await conversationService.getBroadcastConversationsForUser(testCompany.id, {
        page: 1,
        limit: 10
      });

      expect(result.conversations).toHaveLength(2);
      expect(result.conversations.every(c => c.isBroadcast)).toBe(true);
      expect(result.conversations.every(c => c.isReadOnly)).toBe(true);
    });

    test('should filter broadcast conversations by target correctly', async () => {
      // Create broadcast conversations with different targets
      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to Students Only',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'STUDENTS',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testStudent.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Students only'
            }
          }
        }
      });

      await prisma.conversation.create({
        data: {
          topic: 'Broadcast to Companies Only',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget: 'COMPANIES',
          isReadOnly: true,
          participants: {
            create: [
              { userId: testAdmin.id },
              { userId: testCompany.id }
            ]
          },
          messages: {
            create: {
              senderId: testAdmin.id,
              content: 'Companies only'
            }
          }
        }
      });

      // Student should only see STUDENTS and ALL broadcasts
      const studentResult = await conversationService.getBroadcastConversationsForUser(testStudent.id, {
        page: 1,
        limit: 10
      });

      expect(studentResult.conversations).toHaveLength(1);
      expect(studentResult.conversations[0].broadcastTarget).toBe('STUDENTS');

      // Company should only see COMPANIES and ALL broadcasts
      const companyResult = await conversationService.getBroadcastConversationsForUser(testCompany.id, {
        page: 1,
        limit: 10
      });

      expect(companyResult.conversations).toHaveLength(1);
      expect(companyResult.conversations[0].broadcastTarget).toBe('COMPANIES');
    });

    test('should handle user not found', async () => {
      await expect(
        conversationService.getBroadcastConversationsForUser('non-existent-user-id', {
          page: 1,
          limit: 10
        })
      ).rejects.toThrow('User not found');
    });

    test('should handle pagination for broadcast conversations', async () => {
      // Create multiple broadcast conversations
      for (let i = 1; i <= 12; i++) {
        await prisma.conversation.create({
          data: {
            topic: `Broadcast ${i}`,
            context: 'BROADCAST',
            status: 'ACTIVE',
            isBroadcast: true,
            broadcastTarget: 'ALL',
            isReadOnly: true,
            participants: {
              create: [
                { userId: testAdmin.id },
                { userId: testStudent.id }
              ]
            },
            messages: {
              create: {
                senderId: testAdmin.id,
                content: `Broadcast message ${i}`
              }
            }
          }
        });
      }

      const result = await conversationService.getBroadcastConversationsForUser(testStudent.id, {
        page: 1,
        limit: 5
      });

      expect(result.conversations).toHaveLength(5);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 12,
        totalPages: 3
      });
    });
  });

  describe('isConversationAccessible', () => {
    test('should return accessible for user who is participant', async () => {
      const conversation = await prisma.conversation.create({
        data: {
          topic: 'Test Conversation',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          }
        }
      });

      const result = await conversationService.isConversationAccessible(conversation.id, testStudent.id);

      expect(result.accessible).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.conversation.id).toBe(conversation.id);
    });

    test('should return not accessible for user who is not participant', async () => {
      const conversation = await prisma.conversation.create({
        data: {
          topic: 'Private Conversation',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          participants: {
            create: [
              { userId: testCompany.id },
              { userId: testAdmin.id }
            ]
          }
        }
      });

      const result = await conversationService.isConversationAccessible(conversation.id, testStudent.id);

      expect(result.accessible).toBe(false);
      expect(result.reason).toBe('Not a participant');
    });

    test('should return not accessible for non-existent conversation', async () => {
      const result = await conversationService.isConversationAccessible('non-existent-id', testStudent.id);

      expect(result.accessible).toBe(false);
      expect(result.reason).toBe('Conversation not found');
    });
  });

  describe('cleanupExpiredConversations', () => {
    test('should cleanup expired conversations', async () => {
      // Create an expired conversation
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1); // 1 hour ago

      await prisma.conversation.create({
        data: {
          topic: 'Expired Conversation',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          expiresAt: expiredDate,
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          }
        }
      });

      const cleanedCount = await conversationService.cleanupExpiredConversations();

      expect(cleanedCount).toBeGreaterThan(0);

      // Verify the conversation status was updated
      const updatedConversation = await prisma.conversation.findFirst({
        where: { topic: 'Expired Conversation' }
      });
      expect(updatedConversation?.status).toBe('EXPIRED');
    });

    test('should not cleanup active conversations', async () => {
      // Create a future expiration date
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now

      await prisma.conversation.create({
        data: {
          topic: 'Active Conversation',
          context: 'ADOPTION_REQUEST',
          status: 'ACTIVE',
          expiresAt: futureDate,
          participants: {
            create: [
              { userId: testStudent.id },
              { userId: testCompany.id }
            ]
          }
        }
      });

      const cleanedCount = await conversationService.cleanupExpiredConversations();

      // Should not clean up this conversation
      const activeConversation = await prisma.conversation.findFirst({
        where: { topic: 'Active Conversation' }
      });
      expect(activeConversation?.status).toBe('ACTIVE');
    });
  });
}); 