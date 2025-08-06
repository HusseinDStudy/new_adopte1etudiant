import { FastifyRequest, FastifyReply } from 'fastify';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Role } from '@prisma/client';
import { AdminService } from '../services/AdminService.js';

const adminService = new AdminService();

// Admin Analytics
export const getAdminAnalytics = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('🔍 getAdminAnalytics function called!');
  
  const analytics = await adminService.getAdminAnalytics();
  
  console.log('📤 Final analytics object:', JSON.stringify(analytics, null, 2));
  
  return reply.send(analytics);
});

// Admin Users Management
export const getAdminUsers = asyncHandler(async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      role?: string;
      isActive?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '15', search, role, isActive } = request.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role: role as Role | undefined,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  };

  const result = await adminService.getUsers(filters);

  return reply.send({
    data: result.users,
    pagination: result.pagination
  });
});


export const updateUserRole = asyncHandler(async (
  request: FastifyRequest<{
    Params: { userId: string };
    Body: { role: Role };
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;
  const { role } = request.body;

  await adminService.updateUserRole(userId, role);

  return reply.send({ success: true });
});

export const updateUserStatus = asyncHandler(async (
  request: FastifyRequest<{
    Params: { userId: string };
    Body: { isActive: boolean };
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;

  await adminService.toggleUserActiveStatus(userId);

  return reply.send({ success: true });
});

export const deleteUser = asyncHandler(async (
  request: FastifyRequest<{
    Params: { userId: string };
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;

  await adminService.deleteUser(userId);

  return reply.code(204).send();
});

// Admin Offers Management
export const getAdminOffers = asyncHandler(async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      companyId?: string;
      isActive?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '15', search, companyId, isActive } = request.query;

  const result = await adminService.getAdminOffers({
    page,
    limit,
    search,
    companyId,
    isActive
  });

  console.log('📤 FINAL RESPONSE STRUCTURE:', {
    dataLength: result.data.length,
    pagination: result.pagination
  });

  return reply.send(result);
});

// Test endpoint for pagination (no auth required)
export const testAdminOffersPagination = asyncHandler(async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      companyId?: string;
      isActive?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '15', search, companyId, isActive } = request.query;

  console.log('=== TEST ADMIN OFFERS PAGINATION ===');
  console.log('Raw query params:', request.query);

  const result = await adminService.getAdminOffers({
    page,
    limit,
    search,
    companyId,
    isActive
  });

  console.log('📤 TEST: Final response structure:', {
    dataLength: result.data.length,
    pagination: result.pagination
  });

  return reply.send(result);
});


export const deleteOffer = asyncHandler(async (
  request: FastifyRequest<{
    Params: { offerId: string };
  }>,
  reply: FastifyReply
) => {
  const { offerId } = request.params;

  await adminService.deleteOffer(offerId);

  return reply.code(204).send();
});

export const updateOfferStatus = asyncHandler(async (
  request: FastifyRequest<{
    Params: { offerId: string };
    Body: { isActive: boolean };
  }>,
  reply: FastifyReply
) => {
  const { offerId } = request.params;
  const { isActive } = request.body;

  await adminService.updateOfferStatus(offerId, isActive);

  return reply.send({ success: true });
});

// Admin Messages
export const sendAdminMessage = asyncHandler(async (
  request: FastifyRequest<{
    Body: {
      recipientId: string;
      subject: string;
      content: string;
      isReadOnly?: boolean;
    }
  }>,
  reply: FastifyReply
) => {
  const { recipientId, subject, content, isReadOnly = false } = request.body;
  const senderId = (request as any).user.id;

  await adminService.sendBroadcastMessage(senderId, content, [recipientId]);

  return reply.send({ success: true });
});

export const sendBroadcastMessage = asyncHandler(async (
  request: FastifyRequest<{
    Body: {
      targetRole?: Role;
      subject: string;
      content: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { targetRole, subject, content } = request.body;
  const senderId = (request as any).user.id;

  // For now, we'll use the existing sendBroadcastMessage method
  // In the future, we might want to create a separate method for broadcast messages
  await adminService.sendBroadcastMessage(senderId, content, []);

  return reply.send({ success: true });
});


export const getAdminConversations = asyncHandler(async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { page = '1', limit = '20', search = '' } = request.query;
  const adminId = (request as any).user.id;

  const result = await adminService.getAdminConversations(adminId, {
    page,
    limit,
    search
  });

  return reply.send(result);
}); 
