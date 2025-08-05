import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import { prisma } from 'db-postgres';
import { buildTestApp } from '../helpers/test-app';

describe('Offer Routes', () => {
  let app: FastifyInstance;
  let companyUser: any;
  let companyAuthToken = '';
  let companyProfileId = '';

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });
  
  // Setup a company user before each test in the parent describe
  beforeEach(async () => {
    const companyData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'COMPANY',
      name: `TestCorp ${faker.company.name()}`,
      contactEmail: faker.internet.email(),
    };
    const registerResponse = await supertest(app.server).post('/api/auth/register').send(companyData);
    companyUser = registerResponse.body;
    
    const loginResponse = await supertest(app.server).post('/api/auth/login').send({ email: companyData.email, password: companyData.password });
    const cookie = loginResponse.headers['set-cookie'][0];
    companyAuthToken = cookie.split(';')[0].replace('token=', '');

    const profile = await prisma.companyProfile.findUnique({where: {userId: companyUser.id}});
    companyProfileId = profile!.id;
  });

  afterEach(async () => {
    await prisma.offer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.skill.deleteMany();
  });

  describe('Public Offer Routes', () => {
    it('GET /api/offers - should list all offers', async () => {
        await prisma.offer.create({ data: { title: 'Public Offer', description: 'desc', companyId: companyProfileId } });
        const response = await supertest(app.server).get('/api/offers');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data.find((o: any) => o.title === 'Public Offer')).toBeDefined();
    });

    it('GET /api/offers/:id - should return a single offer', async () => {
        const createdOffer = await prisma.offer.create({ data: { title: 'Public Offer', description: 'desc', companyId: companyProfileId } });
        const response = await supertest(app.server).get(`/api/offers/${createdOffer.id}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdOffer.id);
        expect(response.body.title).toBe('Public Offer');
    });

    it('GET /api/offers/:id - should return 404 for non-existent offer', async () => {
        const response = await supertest(app.server).get(`/api/offers/nonexistentid`);
        expect(response.status).toBe(404);
    });
  });

  describe('Company Offer Management', () => {
    it('POST /api/offers - should create a new offer successfully', async () => {
        const offerData = {
            title: 'Software Engineer Intern',
            description: 'Work on our amazing app.',
            location: 'Remote',
            skills: ['TypeScript', 'Prisma'],
        };
        const response = await supertest(app.server)
            .post('/api/offers')
            .set('Cookie', `token=${companyAuthToken}`)
            .send(offerData);
        
        expect(response.status).toBe(201);
        expect(response.body.title).toBe(offerData.title);
        expect(response.body.companyId).toBe(companyProfileId);

        const dbOffer = await prisma.offer.findUnique({
            where: { id: response.body.id },
            include: { skills: true }
        });
        expect(dbOffer?.skills.length).toBe(2);
    });

    it('GET /api/offers/my-offers - should list offers for the authenticated company', async () => {
        await prisma.offer.create({ data: { title: 'My Exclusive Offer', description: 'desc', companyId: companyProfileId } });

        const response = await supertest(app.server)
            .get('/api/offers/my-offers')
            .set('Cookie', `token=${companyAuthToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('My Exclusive Offer');
    });

    it('PUT /api/offers/:id - should update an offer successfully', async () => {
        const offer = await prisma.offer.create({ data: { title: 'To Be Updated', description: 'desc', companyId: companyProfileId } });
        const offerId = offer.id;

        const updateData = {
            title: 'Updated Title',
            description: 'Updated desc',
            skills: ['NewSkill1', 'NewSkill2'],
        };
        
        const updateResponse = await supertest(app.server)
            .put(`/api/offers/${offerId}`)
            .set('Cookie', `token=${companyAuthToken}`)
            .send(updateData);
        
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.title).toBe('Updated Title');
        
        const dbOffer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: { skills: true }
        });
        expect(dbOffer?.skills.map(s => s.name).sort()).toEqual(['Newskill1', 'Newskill2']);
    });

    it('DELETE /api/offers/:id - should delete an offer successfully', async () => {
        const offer = await prisma.offer.create({ data: { title: 'To Be Deleted', description: 'desc', companyId: companyProfileId } });
        const offerId = offer.id;

        const deleteResponse = await supertest(app.server)
            .delete(`/api/offers/${offerId}`)
            .set('Cookie', `token=${companyAuthToken}`);
        
        expect(deleteResponse.status).toBe(204);

        const dbOffer = await prisma.offer.findUnique({ where: { id: offerId } });
        expect(dbOffer).toBeNull();
    });
  });

  describe('Student Offer View with MatchScore', () => {
    let studentAuthToken = '';

    beforeEach(async () => {
      // Create a student user with a profile and skills
      const studentData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: 'Matching',
        lastName: 'Student',
      };
      await supertest(app.server).post('/api/auth/register').send(studentData);
      const loginResponse = await supertest(app.server).post('/api/auth/login').send({ email: studentData.email, password: studentData.password });
      const cookie = loginResponse.headers['set-cookie'][0];
      studentAuthToken = cookie.split(';')[0].replace('token=', '');

      await supertest(app.server).post('/api/profile').set('Cookie', `token=${studentAuthToken}`).send({
        firstName: 'Matching',
        lastName: 'Student',
        skills: ['React', 'Node.js']
      });

      // Ensure skills exist before creating offers that depend on them
      await prisma.skill.createMany({
        data: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Java' }],
        skipDuplicates: true,
      });

      // Create some offers
      await prisma.offer.create({ data: { title: 'High Match', description: 'desc', companyId: companyProfileId, skills: { connect: [{ name: 'React' }, { name: 'Node.js' }] } } });
      await prisma.offer.create({ data: { title: 'Mid Match', description: 'desc', companyId: companyProfileId, skills: { connect: [{ name: 'React' }, { name: 'Java' }] } } });
      await prisma.offer.create({ data: { title: 'No Match', description: 'desc', companyId: companyProfileId, skills: { connect: [{ name: 'Java' }] } } });
    });

    it('GET /api/offers - should return offers sorted by matchScore for a student', async () => {
      const response = await supertest(app.server)
        .get('/api/offers?sortBy=relevance')
        .set('Cookie', `token=${studentAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0].title).toBe('High Match');
      expect(response.body.data[0].matchScore).toBe(100);
      expect(response.body.data[1].title).toBe('Mid Match');
      expect(response.body.data[1].matchScore).toBe(50);
      expect(response.body.data[2].title).toBe('No Match');
      expect(response.body.data[2].matchScore).toBe(0);
    });
  });

  describe('Offer Route Authorization', () => {
    let studentAuthToken = '';

    beforeEach(async () => {
      const studentData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: 'Unauthorized',
        lastName: 'Student',
      };
      await supertest(app.server).post('/api/auth/register').send(studentData);
      const loginResponse = await supertest(app.server).post('/api/auth/login').send({ email: studentData.email, password: studentData.password });
      const cookie = loginResponse.headers['set-cookie'][0];
      studentAuthToken = cookie.split(';')[0].replace('token=', '');
    });

    it('POST /api/offers - should be forbidden for a student', async () => {
        const offerData = { 
          title: 'Student Offer', 
          description: 'This request should be forbidden',
          location: 'N/A',
          skills: ['Forbidden'] 
        };
        const response = await supertest(app.server)
            .post('/api/offers')
            .set('Cookie', `token=${studentAuthToken}`)
            .send(offerData);
        expect(response.status).toBe(403);
    });
  });
}); 