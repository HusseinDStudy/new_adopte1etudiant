import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import { prisma } from 'db-postgres';
import { buildTestApp } from '../helpers/test-app';

describe('Profile Routes', () => {
  let app: FastifyInstance;
  let authToken = '';
  let user: any;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.offer.deleteMany();
    await prisma.studentSkill.deleteMany();
    await prisma.user.deleteMany();
    await prisma.skill.deleteMany();
  });

  describe('For a STUDENT user', () => {
    beforeEach(async () => {
      // 1. Create a student user
      const studentData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const registerResponse = await supertest(app.server)
        .post('/api/auth/register')
        .send(studentData);
      
      user = registerResponse.body;
      
      // 2. Login to get auth token
      const loginResponse = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: studentData.email, password: studentData.password });
        
      const cookie = loginResponse.headers['set-cookie'][0];
      authToken = cookie.split(';')[0].replace('token=', '');
    });

    it('GET /api/profile - should return the initial empty profile', async () => {
        // The controller returns the profile, which is created during registration.
        const response = await supertest(app.server)
            .get('/api/profile')
            .set('Cookie', `token=${authToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body.userId).toBe(user.id);
        expect(response.body.skills).toEqual([]);
    });

    it('POST /api/profile - should create/update a student profile with skills', async () => {
        const profileData = {
            firstName: 'John',
            lastName: 'Doe',
            school: 'Test University',
            degree: 'Computer Science',
            skills: ['TypeScript', 'React', 'Node.js'],
            isOpenToOpportunities: true,
            isCvPublic: false
        };

        const response = await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${authToken}`)
            .send(profileData);

        expect(response.status).toBe(200);
        expect(response.body.school).toBe(profileData.school);
        expect(response.body.skills.length).toBe(3);
        expect(response.body.skills.sort()).toEqual(['Node.js', 'React', 'TypeScript']);

        // Verify skills were created in the DB
        const skills = await prisma.skill.findMany();
        expect(skills.length).toBe(3);
    });

    it('POST /api/profile - should update an existing student profile', async () => {
        // First, create a profile by sending all required fields
        const initialProfile = {
            firstName: user.firstName || 'Initial',
            lastName: user.lastName || 'User',
            school: 'Old School',
            skills: ['Java']
        };
        await supertest(app.server).post('/api/profile').set('Cookie', `token=${authToken}`).send(initialProfile);

        // Then, update it, also sending all required fields
        const updatedProfileData = {
            firstName: user.firstName || 'Initial',
            lastName: user.lastName || 'User',
            school: 'New School',
            skills: ['Python', 'Django']
        };

        const response = await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${authToken}`)
            .send(updatedProfileData);
        
        expect(response.status).toBe(200);
        expect(response.body.school).toBe(updatedProfileData.school);
        expect(response.body.skills.length).toBe(2);
        expect(response.body.skills.sort()).toEqual(['Django', 'Python']);

        // Verify old skill connection is gone and new ones are there
        const dbProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            include: { skills: { include: { skill: true } } }
        });
        expect(dbProfile?.skills.map((s: any) => s.skill.name).sort()).toEqual(['Django', 'Python']);
    });

    it('POST /api/profile - should reject profile with invalid skill name', async () => {
        const profileData = {
            firstName: 'Test',
            lastName: 'User',
            skills: ['ValidSkill', 'Invalid<Skill>']
        };

        const response = await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${authToken}`)
            .send(profileData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('contains invalid characters');
    });
  });

  describe('For a COMPANY user', () => {
    beforeEach(async () => {
      // 1. Create a company user
      const companyData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'COMPANY',
        name: faker.company.name(),
        contactEmail: faker.internet.email(),
      };

      const registerResponse = await supertest(app.server)
        .post('/api/auth/register')
        .send(companyData);
      
      user = registerResponse.body;
      
      // 2. Login to get auth token
      const loginResponse = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: companyData.email, password: companyData.password });
        
      const cookie = loginResponse.headers['set-cookie'][0];
      authToken = cookie.split(';')[0].replace('token=', '');
    });

    it('GET /api/profile - should return the initial empty company profile', async () => {
        const response = await supertest(app.server)
            .get('/api/profile')
            .set('Cookie', `token=${authToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body.userId).toBe(user.id);
    });

    it('POST /api/profile - should create/update a company profile', async () => {
        const profileData = {
            name: 'Innovate Inc.',
            contactEmail: 'contact@innovate.com',
            sector: 'Technology',
            size: '100-200',
        };

        const response = await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${authToken}`)
            .send(profileData);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(profileData.name);
        expect(response.body.sector).toBe(profileData.sector);

        // Verify profile was created in the DB
        const dbProfile = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
        expect(dbProfile).not.toBeNull();
        expect(dbProfile?.size).toBe(profileData.size);
    });
  });
}); 