import { prisma } from 'db-postgres';
import { Role } from '@prisma/client';

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalOffers: number;
  totalApplications: number;
  totalAdoptionRequests: number;
  totalBlogPosts: number;
  recentActivity: {
    newUsersToday: number;
    newOffersToday: number;
    newApplicationsToday: number;
  };
  usersByRole: {
    STUDENT: number;
    COMPANY: number;
    ADMIN: number;
  };
  offersByStatus: Record<string, number>;
}

export interface UserListFilters {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface UserListResult {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AdminService {
  async getAdminAnalytics(): Promise<AdminAnalytics> {
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

    // Get user distribution by role
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

    return {
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
        ACTIVE: activeOffers,
        INACTIVE: inactiveOffers
      }
    };
  }

  async getUsers(filters: UserListFilters): Promise<UserListResult> {
    const { role, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', isActive } = filters;

    const whereClause: any = {};
    
    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { firstName: { contains: search, mode: 'insensitive' } } },
        { studentProfile: { lastName: { contains: search, mode: 'insensitive' } } },
        { companyProfile: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          studentProfile: {
            select: {
              firstName: true,
              lastName: true,
              school: true,
              degree: true,
            },
          },
          companyProfile: {
            select: {
              name: true,
              sector: true,
              size: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  async updateUserRole(userId: string, role: Role): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async toggleUserActiveStatus(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async getAdminOffers(filters: {
    page?: string;
    limit?: string;
    search?: string;
    companyId?: string;
    isActive?: string;
  }) {
    const { page = '1', limit = '15', search, companyId, isActive } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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

    const formattedOffers = offers.map((offer: any) => ({
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

    return {
      data: formattedOffers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: totalPagesCount
      }
    };
  }

  async deleteOffer(offerId: string): Promise<void> {
    await prisma.offer.delete({
      where: { id: offerId }
    });
  }

  async updateOfferStatus(offerId: string, isActive: boolean): Promise<void> {
    await prisma.offer.update({
      where: { id: offerId },
      data: { isActive }
    });
  }

  async sendBroadcastMessage(adminId: string, message: string, targetRole?: 'STUDENT' | 'COMPANY' | 'ALL'): Promise<{
    conversationId: string;
    sentTo: number;
  }> {
    // Determine broadcast target based on role
    let broadcastTarget: 'ALL' | 'STUDENTS' | 'COMPANIES';
    let userFilter: any = { isActive: true };

    if (targetRole === 'STUDENT') {
      broadcastTarget = 'STUDENTS';
      userFilter.role = 'STUDENT';
    } else if (targetRole === 'COMPANY') {
      broadcastTarget = 'COMPANIES';
      userFilter.role = 'COMPANY';
    } else {
      broadcastTarget = 'ALL';
      // No additional filter for ALL
    }

    // Get all target users
    const targetUsers = await prisma.user.findMany({
      where: userFilter,
      select: { id: true }
    });

    if (targetUsers.length === 0) {
      throw new Error(`No users found for target role: ${targetRole || 'ALL'}`);
    }

    // Create broadcast conversation with better error handling and connection management
    let conversation: any = null;
    try {
      // First, create the conversation and message outside of a large transaction
      conversation = await prisma.conversation.create({
        data: {
          topic: 'Broadcast Message',
          context: 'BROADCAST',
          status: 'ACTIVE',
          isBroadcast: true,
          broadcastTarget,
          isReadOnly: true, // Broadcast conversations are read-only for non-admins
        }
      });

      // Create the message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: adminId,
          content: message,
        }
      });

      // Create participants in smaller batches with individual transactions
      const participantData = [
        { conversationId: conversation.id, userId: adminId }, // Admin as creator
        ...targetUsers.map(user => ({ conversationId: conversation.id, userId: user.id }))
      ];

      // Create participants in very small batches to avoid connection issues
      const batchSize = 10; // Reduced batch size
      let participantCreationErrors: any[] = [];
      
      for (let i = 0; i < participantData.length; i += batchSize) {
        const batch = participantData.slice(i, i + batchSize);
        
        try {
          await prisma.conversationParticipant.createMany({
            data: batch,
            skipDuplicates: true
          });
        } catch (batchError) {
          console.error(`Failed to create batch ${i / batchSize + 1}:`, batchError);
          participantCreationErrors.push(batchError);
        }
      }
      
      // If any participant creation failed, throw an error
      if (participantCreationErrors.length > 0) {
        throw new Error(`Failed to create ${participantCreationErrors.length} participant batches`);
      }

    } catch (error) {
      console.error('Broadcast creation failed:', error);
      
      // If conversation was created but participants failed, clean up
      if (conversation?.id) {
        try {
          await prisma.conversation.delete({
            where: { id: conversation.id }
          });
        } catch (cleanupError) {
          console.error('Failed to cleanup conversation:', cleanupError);
        }
      }
      
      if (error instanceof Error && error.message.includes('Server has closed the connection')) {
        throw new Error('Database connection failed. Please try again.');
      }
      throw new Error('Failed to create broadcast message. Please try again.');
    }

    return {
      conversationId: conversation.id,
      sentTo: targetUsers.length
    };
  }

  async getAdminConversations(adminId: string, filters: {
    page?: string;
    limit?: string;
    search?: string;
    context?: string;
  }) {
    const { page = '1', limit = '15', search, context } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { topic: { contains: search, mode: 'insensitive' } },
        { messages: { some: { content: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (context) {
      whereClause.context = context;
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
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.conversation.count({ where: whereClause })
    ]);

    const formattedConversations = conversations.map((conversation: any) => {
      const otherParticipants = conversation.participants.filter((p: any) => p.userId !== adminId);
      return {
        id: conversation.id,
        topic: conversation.topic,
        context: conversation.context,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        participants: otherParticipants.map((p: any) => ({
          id: p.user.id,
          email: p.user.email,
          role: p.user.role,
          name: p.user.studentProfile ? 
            `${p.user.studentProfile.firstName} ${p.user.studentProfile.lastName}` :
            p.user.companyProfile?.name || 'Unknown'
        })),
        lastMessage: conversation.messages[0] || null,
        messageCount: conversation._count.messages
      };
    });

    return {
      data: formattedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }
} 