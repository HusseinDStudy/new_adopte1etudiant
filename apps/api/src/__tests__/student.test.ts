import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';

describe('Student Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    let companyAuthToken = '';

    beforeEach(async () => {
        // Create a company user for authentication
        const companyData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'COMPANY',
            name: faker.company.name(),
            firstName: faker.person.firstName(),
            contactEmail: faker.internet.email(),
        };
        await supertest(app.server).post('/api/auth/register').send(companyData);
        const companyLoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: companyData.email, 
            password: companyData.password 
        });
        const companyCookie = companyLoginResponse.headers['set-cookie'][0];
        companyAuthToken = companyCookie.split(';')[0].replace('token=', '');

        // Create skills for students
        await prisma.skill.createMany({
            data: [
                { name: 'React' },
                { name: 'Node.js' },
                { name: 'Python' },
                { name: 'Java' }
            ],
            skipDuplicates: true,
        });

        // Create students with different profiles
        // Student 1: Open to opportunities, has React and Node.js skills
        const student1Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: 'Alice',
            lastName: 'Johnson',
        };
        await supertest(app.server).post('/api/auth/register').send(student1Data);
        const student1LoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: student1Data.email, 
            password: student1Data.password 
        });
        const student1Cookie = student1LoginResponse.headers['set-cookie'][0];
        const student1Token = student1Cookie.split(';')[0].replace('token=', '');
        
        await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${student1Token}`)
            .send({
                firstName: 'Alice',
                lastName: 'Johnson',
                school: 'MIT',
                degree: 'Computer Science',
                skills: ['React', 'Node.js'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/alice-cv.pdf',
                isCvPublic: true
            });

        // Student 2: Open to opportunities, has Python skills
        const student2Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: 'Bob',
            lastName: 'Smith',
        };
        await supertest(app.server).post('/api/auth/register').send(student2Data);
        const student2LoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: student2Data.email, 
            password: student2Data.password 
        });
        const student2Cookie = student2LoginResponse.headers['set-cookie'][0];
        const student2Token = student2Cookie.split(';')[0].replace('token=', '');
        
        await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${student2Token}`)
            .send({
                firstName: 'Bob',
                lastName: 'Smith',
                school: 'Stanford',
                degree: 'Data Science',
                skills: ['Python'],
                isOpenToOpportunities: true,
                cvUrl: '',
                isCvPublic: false
            });

        // Student 3: NOT open to opportunities, has Java skills
        const student3Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: 'Charlie',
            lastName: 'Brown',
        };
        await supertest(app.server).post('/api/auth/register').send(student3Data);
        const student3LoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: student3Data.email, 
            password: student3Data.password 
        });
        const student3Cookie = student3LoginResponse.headers['set-cookie'][0];
        const student3Token = student3Cookie.split(';')[0].replace('token=', '');
        
        await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${student3Token}`)
            .send({
                firstName: 'Charlie',
                lastName: 'Brown',
                school: 'Harvard',
                degree: 'Software Engineering',
                skills: ['Java'],
                isOpenToOpportunities: false, // Not open to opportunities
                cvUrl: 'https://example.com/charlie-cv.pdf',
                isCvPublic: true
            });

        // Student 4: Open to opportunities, no skills
        const student4Data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: 'Diana',
            lastName: 'Prince',
        };
        await supertest(app.server).post('/api/auth/register').send(student4Data);
        const student4LoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: student4Data.email, 
            password: student4Data.password 
        });
        const student4Cookie = student4LoginResponse.headers['set-cookie'][0];
        const student4Token = student4Cookie.split(';')[0].replace('token=', '');
        
        await supertest(app.server)
            .post('/api/profile')
            .set('Cookie', `token=${student4Token}`)
            .send({
                firstName: 'Diana',
                lastName: 'Prince',
                school: 'Berkeley',
                degree: 'Art History',
                skills: [],
                isOpenToOpportunities: true,
                cvUrl: '',
                isCvPublic: false
            });
    });

    afterEach(async () => {
        // Clean up in correct order to respect foreign key constraints
        await prisma.studentSkill.deleteMany();
        await prisma.studentProfile.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.skill.deleteMany();
    });

    describe('GET /api/students', () => {
        it('should return all students open to opportunities', async () => {
            const response = await supertest(app.server)
                .get('/api/students')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(3); // Alice, Bob, Diana (Charlie is not open)
            
            const studentNames = response.body.map((student: any) => `${student.firstName} ${student.lastName}`);
            expect(studentNames).toContain('Alice Johnson');
            expect(studentNames).toContain('Bob Smith');
            expect(studentNames).toContain('Diana Prince');
            expect(studentNames).not.toContain('Charlie Brown'); // Not open to opportunities
        });

        it('should return students with correct structure and data', async () => {
            const response = await supertest(app.server)
                .get('/api/students')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            
            const alice = response.body.find((student: any) => student.firstName === 'Alice');
            expect(alice).toBeDefined();
            expect(alice).toHaveProperty('id');
            expect(alice).toHaveProperty('firstName', 'Alice');
            expect(alice).toHaveProperty('lastName', 'Johnson');
            expect(alice).toHaveProperty('email');
            expect(alice).toHaveProperty('school', 'MIT');
            expect(alice).toHaveProperty('degree', 'Computer Science');
            expect(alice).toHaveProperty('skills');
            expect(alice).toHaveProperty('cvUrl', 'https://example.com/alice-cv.pdf');
            expect(alice).toHaveProperty('isCvPublic', true);
            expect(alice.skills).toBeInstanceOf(Array);
            expect(alice.skills).toHaveLength(2);
            
            const skillNames = alice.skills.map((skill: any) => skill.name);
            expect(skillNames).toContain('React');
            expect(skillNames).toContain('Node.js');
        });

        it('should filter students by search term in firstName', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Alice')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Alice');
        });

        it('should filter students by search term in lastName', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Smith')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].lastName).toBe('Smith');
        });

        it('should filter students by search term in school', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Stanford')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].school).toBe('Stanford');
        });

        it('should filter students by search term in degree', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Data Science')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].degree).toBe('Data Science');
        });

        it('should filter students by single skill', async () => {
            const response = await supertest(app.server)
                .get('/api/students?skills=Python')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Bob');
        });

        it('should filter students by multiple skills (AND logic)', async () => {
            const response = await supertest(app.server)
                .get('/api/students?skills=React,Node.js')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Alice'); // Only Alice has both React AND Node.js
        });

        it('should return empty array when filtering by non-existent skill', async () => {
            const response = await supertest(app.server)
                .get('/api/students?skills=NonExistentSkill')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });

        it('should combine search and skills filters', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Alice&skills=React')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Alice');
        });

        it('should return empty array when search and skills filters do not match', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=Bob&skills=React')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0); // Bob doesn't have React skill
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .get('/api/students');

            expect(response.status).toBe(401);
        });

        it('should require company role', async () => {
            // Create a student user
            const studentData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                role: 'STUDENT',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
            };
            await supertest(app.server).post('/api/auth/register').send(studentData);
            const studentLoginResponse = await supertest(app.server).post('/api/auth/login').send({ 
                email: studentData.email, 
                password: studentData.password 
            });
            const studentCookie = studentLoginResponse.headers['set-cookie'][0];
            const studentToken = studentCookie.split(';')[0].replace('token=', '');

            const response = await supertest(app.server)
                .get('/api/students')
                .set('Cookie', `token=${studentToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('permission');
        });

        it('should handle empty search gracefully', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3); // All open students
        });

        it('should handle empty skills filter gracefully', async () => {
            const response = await supertest(app.server)
                .get('/api/students?skills=')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3); // All open students
        });

        it('should be case insensitive for search', async () => {
            const response = await supertest(app.server)
                .get('/api/students?search=alice')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Alice');
        });

        it('should be case insensitive for skills filter', async () => {
            const response = await supertest(app.server)
                .get('/api/students?skills=react')
                .set('Cookie', `token=${companyAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('Alice');
        });
    });
}); 