import { FastifyRequest, FastifyReply } from 'fastify';
import { StudentService } from '../services/StudentService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const studentService = new StudentService();

export const listAvailableStudents = asyncHandler(async (
  request: FastifyRequest<{
    Querystring: { search?: string; skills?: string };
  }>,
  reply: FastifyReply
) => {
  const { search, skills } = request.query;
  const filters = { search, skills };
  const students = await studentService.listAvailableStudents(filters);
  return reply.send(students);
});

export const getStudentStats = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user.id;
  const stats = await studentService.getStudentStats(userId);
  return reply.send(stats);
});