import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Role } from '@prisma/client';

// Admin Analytics
export const getAdminAnalytics = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    console.log('🔍 getAdminAnalytics function called!');
    
    // Get total counts
    const [
      totalUsers,
      totalStudents, 
      totalCompanies,
      totalOffers,
      totalApplications,
      totalAdoptionRequests,
      totalBlogPosts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.offer.count(),
      prisma.application.count(),
      prisma.adoptionRequest.count(),
      prisma.blogPost.count()
    ]);

    console.log('📊 Total counts calculated:', {
      totalUsers,
      totalStudents,
      totalCompanies,
      totalOffers,
      totalApplications,
      totalAdoptionRequests,
      totalBlogPosts
    });

    // Get today's activity (last 24 hours)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      newUsersToday,
      newOffersToday,
      newApplicationsToday
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.offer.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { createdAt: { gte: today } } })
    ]);

    console.log('📊 Today activity calculated:', {
      newUsersToday,
      newOffersToday,
      newApplicationsToday
    });

    // Get user distribution by role - using direct queries instead of groupBy
    console.log('🔍 Calculating user role counts...');
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const companyCount = await prisma.user.count({ where: { role: 'COMPANY' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    console.log('📊 User role counts calculated:', {
      studentCount,
      companyCount,
      adminCount
    });

    // Get offers by status (active vs inactive)
    console.log('🔍 Calculating offer status counts...');
    const activeOffers = await prisma.offer.count({ where: { isActive: true } });
    const inactiveOffers = await prisma.offer.count({ where: { isActive: false } });

    console.log('📊 Offer status counts calculated:', {
      activeOffers,
      inactiveOffers
    });

    const analytics = {
      totalUsers,
      totalStudents,
      totalCompanies,
      totalOffers,
      totalApplications,
      totalAdoptionRequests,
      totalBlogPosts,
      recentActivity: {
        newUsersToday,
        newOffersToday,
        newApplicationsToday
      },
      usersByRole: {
        'STUDENT': studentCount,
        'COMPANY': companyCount,
        'ADMIN': adminCount
      },
      offersByStatus: {
        'ACTIVE': activeOffers,
        'INACTIVE': inactiveOffers
      }
    };

    console.log('📤 Final analytics object:', JSON.stringify(analytics, null, 2));

    return reply.send(analytics);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    return reply.code(500).send({ error: 'Analytics failed' });
  }
};

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
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { studentProfile: { firstName: { contains: search, mode: 'insensitive' } } },
      { studentProfile: { lastName: { contains: search, mode: 'insensitive' } } },
      { companyProfile: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (role) {
    whereClause.role = role;
  }

  if (isActive !== undefined) {
    whereClause.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        studentProfile: true,
        companyProfile: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.user.count({ where: whereClause })
  ]);

  const formattedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    passwordLoginDisabled: user.passwordLoginDisabled,
    isActive: user.isActive,
    profile: user.studentProfile ? {
      id: user.studentProfile.id,
      firstName: user.studentProfile.firstName,
      lastName: user.studentProfile.lastName,
      school: user.studentProfile.school,
      degree: user.studentProfile.degree,
      cvUrl: user.studentProfile.cvUrl,
      isOpenToOpportunities: user.studentProfile.isOpenToOpportunities,
      isCvPublic: user.studentProfile.isCvPublic
    } : user.companyProfile ? {
      id: user.companyProfile.id,
      name: user.companyProfile.name,
      logoUrl: user.companyProfile.logoUrl,
      size: user.companyProfile.size,
      sector: user.companyProfile.sector,
      contactEmail: user.companyProfile.contactEmail
    } : null
  }));

  return reply.send({
    data: formattedUsers,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total: total,
      limit: parseInt(limit)
    }
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

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

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
  const { isActive } = request.body;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive }
  });

  return reply.send({ success: true });
});

export const deleteUser = asyncHandler(async (
  request: FastifyRequest<{
    Params: { userId: string };
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;

  await prisma.user.delete({
    where: { id: userId }
  });

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
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Debug logging
  console.log('=== ADMIN OFFERS DEBUG ===');
  console.log('Raw query params:', request.query);
  console.log('Extracted params:', { page, limit, search, companyId, isActive });
  console.log('isActive type:', typeof isActive, 'value:', JSON.stringify(isActive));
  
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (companyId) {
    whereClause.companyId = companyId;
  }

  if (isActive !== undefined && isActive !== '') {
    const boolValue = isActive === 'true';
    console.log('🔍 ADDING isActive filter:');
    console.log('  - Raw value:', JSON.stringify(isActive));
    console.log('  - Converted to boolean:', boolValue);
    whereClause.isActive = boolValue;
  } else {
    console.log('🚫 NOT adding isActive filter - undefined or empty');
  }

  console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));

  console.log('About to execute Prisma query with whereClause:', whereClause);
  
  try {
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where: whereClause,
        include: {
          company: {
            include: {
              user: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.offer.count({ where: whereClause })
    ]);

    console.log('✅ Prisma query successful!');
    console.log('Prisma query returned:', offers.length, 'offers');
    console.log('Total count:', total);
    console.log('Type of total:', typeof total);
    console.log('Offer isActive values:', offers.map(o => ({ id: o.id, title: o.title, isActive: o.isActive })));

    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      location: offer.location,
      duration: offer.duration,
      isActive: offer.isActive,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      company: {
        id: offer.company.id,
        companyName: offer.company.name,
        email: offer.company.user.email
      },
      _count: {
        applications: offer._count.applications
      }
    }));

    // Ensure we have valid pagination values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalCount = total || 0;
    const totalPagesCount = Math.ceil(totalCount / limitNum);

    console.log('🔍 PAGINATION DEBUG:', {
      pageNum,
      limitNum, 
      totalCount,
      totalPagesCount,
      skip,
      originalPage: page,
      originalLimit: limit
    });

    const responseData = {
      data: formattedOffers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: totalPagesCount
      }
    };

    console.log('📤 FINAL RESPONSE STRUCTURE:', {
      dataLength: responseData.data.length,
      pagination: responseData.pagination
    });

    return reply.send(responseData);

  } catch (error) {
    console.error('❌ ERROR in getAdminOffers:', error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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
  const skip = (parseInt(page) - 1) * parseInt(limit);

  console.log('=== TEST ADMIN OFFERS PAGINATION ===');
  console.log('Raw query params:', request.query);
  
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (companyId) {
    whereClause.companyId = companyId;
  }

  if (isActive !== undefined && isActive !== '') {
    const boolValue = isActive === 'true';
    whereClause.isActive = boolValue;
  }

  console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
  
  try {
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where: whereClause,
        include: {
          company: {
            include: {
              user: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.offer.count({ where: whereClause })
    ]);

    console.log('✅ TEST: Prisma query successful!');
    console.log('TEST: Total count:', total);

    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      location: offer.location,
      duration: offer.duration,
      isActive: offer.isActive,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      company: {
        id: offer.company.id,
        companyName: offer.company.name,
        email: offer.company.user.email
      },
      _count: {
        applications: offer._count.applications
      }
    }));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalCount = total || 0;
    const totalPagesCount = Math.ceil(totalCount / limitNum);

    const responseData = {
      data: formattedOffers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: totalPagesCount
      }
    };

    console.log('📤 TEST: Final response structure:', {
      dataLength: responseData.data.length,
      pagination: responseData.pagination
    });

    return reply.send(responseData);

  } catch (error) {
    console.error('❌ TEST ERROR:', error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


export const deleteOffer = asyncHandler(async (
  request: FastifyRequest<{
    Params: { offerId: string };
  }>,
  reply: FastifyReply
) => {
  const { offerId } = request.params;

  await prisma.offer.delete({
    where: { id: offerId }
  });

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

  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: { isActive },
    include: {
      company: {
        include: {
          user: true
        }
      },
      _count: {
        select: { applications: true }
      }
    }
  });

  const formattedOffer = {
    id: updatedOffer.id,
    title: updatedOffer.title,
    description: updatedOffer.description,
    location: updatedOffer.location,
    duration: updatedOffer.duration,
    isActive: updatedOffer.isActive,
    createdAt: updatedOffer.createdAt,
    updatedAt: updatedOffer.updatedAt,
    company: {
      id: updatedOffer.company.id,
      companyName: updatedOffer.company.name,
      email: updatedOffer.company.user.email
    },
    _count: {
      applications: updatedOffer._count.applications
    }
  };

  return reply.send(formattedOffer);
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

  // Verify recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, email: true, role: true }
  });

  if (!recipient) {
    return reply.code(404).send({ message: 'Recipient not found' });
  }

  // Create conversation with participants
  const conversation = await prisma.conversation.create({
    data: {
      topic: subject,
      isReadOnly,
      isBroadcast: false,
      context: 'ADMIN_MESSAGE', // Add context for filtering
      participants: {
        create: [
          { userId: senderId },
          { userId: recipientId }
        ]
      },
      messages: {
        create: {
          content,
          senderId
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return reply.send({
    success: true,
    conversation: {
      id: conversation.id,
      topic: conversation.topic,
      isReadOnly: conversation.isReadOnly,
      isBroadcast: conversation.isBroadcast,
      participants: conversation.participants,
      lastMessage: conversation.messages[0]
    }
  });
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

  // Determine broadcast target
  let broadcastTarget: 'ALL' | 'STUDENTS' | 'COMPANIES';
  switch (targetRole) {
    case 'STUDENT':
      broadcastTarget = 'STUDENTS';
      break;
    case 'COMPANY':
      broadcastTarget = 'COMPANIES';
      break;
    default:
      broadcastTarget = 'ALL';
  }

  // Create a single broadcast conversation
  const conversation = await prisma.conversation.create({
    data: {
      topic: `[Broadcast] ${subject}`,
      isReadOnly: true, // Broadcast messages are always read-only
      isBroadcast: true,
      broadcastTarget,
      context: 'BROADCAST',
      participants: {
        create: {
          userId: senderId // Only the admin is a visible participant
        }
      },
      messages: {
        create: {
          content,
          senderId
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  });

  return reply.send({
    success: true,
    conversation: {
      id: conversation.id,
      topic: conversation.topic,
      isReadOnly: conversation.isReadOnly,
      isBroadcast: conversation.isBroadcast,
      broadcastTarget: conversation.broadcastTarget,
      participants: conversation.participants
    }
  });
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
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const adminId = (request as any).user.id;

  // Build where clause for conversations where admin is a participant
  const whereClause: any = {
    participants: {
      some: {
        userId: adminId
      }
    }
  };

  // Add search filter if provided
  if (search) {
    whereClause.OR = [
      { topic: { contains: search, mode: 'insensitive' } },
      {
        participants: {
          some: {
            user: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                {
                  studentProfile: {
                    OR: [
                      { firstName: { contains: search, mode: 'insensitive' } },
                      { lastName: { contains: search, mode: 'insensitive' } }
                    ]
                  }
                },
                {
                  companyProfile: {
                    name: { contains: search, mode: 'insensitive' }
                  }
                }
              ]
            }
          }
        }
      }
    ];
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                studentProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                companyProfile: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.conversation.count({ where: whereClause })
  ]);

  const formattedConversations = conversations.map(conversation => {
    const otherParticipants = conversation.participants.filter(p => p.userId !== adminId);
    const lastMessage = conversation.messages[0] || null;

    return {
      id: conversation.id,
      topic: conversation.topic,
      isReadOnly: conversation.isReadOnly,
      isBroadcast: conversation.isBroadcast,
      participants: otherParticipants,
      lastMessage,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt
    };
  });

  return reply.send({
    data: formattedConversations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
}); 
