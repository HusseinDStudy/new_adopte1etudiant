import { FastifyRequest, FastifyReply } from 'fastify';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';
import { studentProfileSchema } from 'shared-types';
import { ProfileService } from '../services/ProfileService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const profileService = new ProfileService();



export const getProfile = asyncHandler(async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: userId, role } = request.user!;

  const profile = await profileService.getProfile(userId, role);

  if (!profile) {
    // Return a 200 with null so the frontend knows to create one
    return reply.code(200).send(null);
  }

  return reply.send(profile);
});

export const upsertProfile = asyncHandler(async (
  request: FastifyRequest<{ Body: StudentProfileInput | CompanyProfileInput }>,
  reply: FastifyReply
) => {
  const userId = request.user!.id;
  const role = request.user!.role;
  const data = request.body;

  if (!userId) {
    console.error('No userId found in request.user');
    return reply.code(401).send({ message: 'User not authenticated' });
  }

  const profile = await profileService.upsertProfile(userId, role, data);

  if (!profile) {
    return reply.code(500).send({ message: 'Failed to create/update profile' });
  }

  // Flatten the user data into the profile for API compatibility
  const { user, ...profileData } = profile;
  const flattenedProfile = {
    ...profileData,
    role,
    email: user?.email,
  };

  // Handle student-specific fields
  if (role === 'STUDENT' && 'skills' in profile) {
    (flattenedProfile as any).skills = (profile as any).skills || [];
  }

  // Remove null fields that have format constraints
  if ('cvUrl' in flattenedProfile && flattenedProfile.cvUrl === null) {
    delete (flattenedProfile as any).cvUrl;
  }

  return reply.send(flattenedProfile);
}); 