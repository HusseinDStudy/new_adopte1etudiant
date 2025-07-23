import { prisma } from 'db-postgres';
import { NotFoundError } from '../errors/AppError.js';

export class CompanyService {
  async getCompaniesWithOffers() {
    const companies = await prisma.companyProfile.findMany({
      where: {
        offers: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      },
      distinct: ['name']
    });
    
    return companies;
  }

  async getCompanyProfile(userId: string) {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        offers: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError('Company profile not found');
    }

    return {
      id: profile.id,
      name: profile.name,
      logoUrl: profile.logoUrl,
      size: profile.size,
      sector: profile.sector,
      contactEmail: profile.contactEmail,
      email: profile.user.email,
      offers: profile.offers,
    };
  }

  async getCompanyStats(userId: string) {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Company profile not found');
    }

    // Get total offers count
    const totalOffers = await prisma.offer.count({
      where: { companyId: profile.id },
    });

    // Get total applications received
    const totalApplications = await prisma.application.count({
      where: {
        offer: {
          companyId: profile.id,
        },
      },
    });

    // Get applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        offer: {
          companyId: profile.id,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get adoption requests sent
    const adoptionRequestsSent = await prisma.adoptionRequest.count({
      where: { companyId: profile.id },
    });

    return {
      totalOffers,
      totalApplications,
      applicationsByStatus: applicationsByStatus.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      adoptionRequestsSent,
    };
  }

  async getAllCompanies() {
    const companies = await prisma.companyProfile.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        size: true,
        sector: true,
        contactEmail: true,
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return companies;
  }

  async searchCompanies(searchTerm: string) {
    const companies = await prisma.companyProfile.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { sector: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        size: true,
        sector: true,
        contactEmail: true,
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return companies;
  }
}
