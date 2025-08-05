import { FastifyRequest, FastifyReply } from 'fastify';
import { StudentService } from '../services/StudentService.js';

const studentService = new StudentService();

export const listAvailableStudents = async (
  request: FastifyRequest<{
    Querystring: { search?: string; skills?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { search, skills } = request.query;
    const filters = { search, skills };
    const students = await studentService.listAvailableStudents(filters);
    return reply.send(students);
  } catch (error) {
    console.error('Failed to list available students:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getStudentStats = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user.id;
    const stats = await studentService.getStudentStats(userId);
    return reply.send(stats);
  } catch (error) {
    console.error('Failed to get student stats:', error);
    if ((error as Error).message === 'Student profile not found') {
      return reply.code(404).send({ message: 'Student profile not found' });
    }
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};