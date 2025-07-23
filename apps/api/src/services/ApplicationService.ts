import { prisma } from 'db-postgres';
import { ApplicationStatus } from '@prisma/client';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError.js';

export interface CreateApplicationData {
  offerId: string;
}

export interface UpdateApplicationStatusData {
  status: string;
}

export class ApplicationService {
  async createApplication(studentId: string, data: CreateApplicationData) {
    const { offerId } = data;

    // Check if offer exists
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundError('Offer not found.');
    }

    // Check if student has a profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    if (!studentProfile) {
      throw new ForbiddenError('You must have a profile to apply.');
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_offerId: {
          studentId: studentId,
          offerId: offerId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictError('You have already applied to this offer.');
    }

    // Create the application
    const newApplication = await prisma.application.create({
      data: {
        offerId: offerId,
        studentId: studentId,
      },
    });

    return newApplication;
  }

  async getMyApplications(studentId: string) {
    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        offer: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return applications;
  }

  async updateApplicationStatus(
    applicationId: string, 
    companyUserId: string, 
    data: UpdateApplicationStatusData
  ) {
    const { status } = data;

    // Find the application and verify the company owns the related offer
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    if (application.offer.company.userId !== companyUserId) {
      throw new ForbiddenError('You do not have permission to update this application.');
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: status as ApplicationStatus },
    });

    return updatedApplication;
  }

  async getApplicationById(applicationId: string, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
        student: {
          include: {
            studentProfile: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    // Check if user has permission to view this application
    const isStudent = application.studentId === userId;
    const isCompanyOwner = application.offer.company.userId === userId;

    if (!isStudent && !isCompanyOwner) {
      throw new ForbiddenError('You do not have permission to view this application.');
    }

    return application;
  }

  async deleteApplication(applicationId: string, studentId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    if (application.studentId !== studentId) {
      throw new ForbiddenError('You do not have permission to delete this application.');
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });
  }
}
