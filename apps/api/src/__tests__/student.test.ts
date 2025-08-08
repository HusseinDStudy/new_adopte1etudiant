import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';
import { StudentService } from '../services/StudentService.js';
import { NotFoundError } from '../errors/AppError.js';

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
            contactEmail: faker.internet.email(),
        };
        const registerResponse = await supertest(app.server).post('/api/auth/register').send(companyData);
        if (registerResponse.status !== 201) {
            console.log('Registration failed:', registerResponse.status, registerResponse.body);
        }
        expect(registerResponse.status).toBe(201);

        const companyLoginResponse = await supertest(app.server).post('/api/auth/login').send({
            email: companyData.email,
            password: companyData.password
        });
        expect(companyLoginResponse.status).toBe(200);
        expect(companyLoginResponse.headers['set-cookie']).toBeDefined();

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
                .get('/api/students');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(3); // Alice, Bob, Diana (Charlie is not open)
            
            const studentNames = response.body.map((student: any) => `${student.firstName} ${student.lastName}`);
            expect(studentNames).toContain('Alice Johnson');
            expect(studentNames).toContain('Bob Smith');
            expect(studentNames).toContain('Diana Prince');
            expect(studentNames).not.toContain('Charlie Brown'); // Not open to opportunities
        });

        it('should return students with correct structure and data (includes email for company)', async () => {
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
            // Ensure internal user object is not leaked
            expect(alice).not.toHaveProperty('user');
            // Email should be present for company viewers
            expect(alice).toHaveProperty('email');
            expect(typeof alice.email).toBe('string');
            expect(alice).toHaveProperty('school', 'MIT');
            expect(alice).toHaveProperty('degree', 'Computer Science');
            expect(alice).toHaveProperty('skills');
            expect(alice).toHaveProperty('cvUrl', 'https://example.com/alice-cv.pdf');
            expect(alice).toHaveProperty('isCvPublic', true);
            expect(alice.skills).toBeInstanceOf(Array);
            expect(alice.skills).toHaveLength(2);
            
            expect(alice.skills).toContain('React');
            expect(alice.skills).toContain('Node.js');
        });

        it('should not include email when unauthenticated (public view)', async () => {
            const response = await supertest(app.server)
                .get('/api/students');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);

            const alice = response.body.find((student: any) => student.firstName === 'Alice');
            expect(alice).toBeDefined();
            expect(alice).not.toHaveProperty('email');
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

        it('should be public (no authentication required)', async () => {
            const response = await supertest(app.server)
                .get('/api/students');

            expect(response.status).toBe(200);
        });

        it('should not require company role (public)', async () => {
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

            expect(response.status).toBe(200);
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

describe('StudentService', () => {
    let studentService: StudentService;
    let testStudentUserId: string;
    let testSkillIds: string[];

    beforeAll(async () => {
        studentService = new StudentService();
    });

    beforeEach(async () => {
        // Clean up database in correct order to respect foreign key constraints
        await prisma.adoptionRequest.deleteMany();
        await prisma.application.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.studentSkill.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.studentProfile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.skill.deleteMany();

        // Create test skills
        await prisma.skill.createMany({
            data: [
                { name: 'React' },
                { name: 'Node.js' },
                { name: 'TypeScript' },
            ],
        });

        const createdSkills = await prisma.skill.findMany();
        testSkillIds = createdSkills.map(skill => skill.id);

        // Create a test student
        const testUser = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                passwordHash: 'hashedpassword',
                role: 'STUDENT',
            },
        });
        testStudentUserId = testUser.id;

        await prisma.studentProfile.create({
            data: {
                userId: testUser.id,
                firstName: 'John',
                lastName: 'Doe',
                school: 'Test University',
                degree: 'Computer Science',
                isOpenToOpportunities: true,
                isCvPublic: true,
                cvUrl: 'https://example.com/cv.pdf',
                skills: {
                    create: [
                        { skillId: testSkillIds[0] }, // React
                        { skillId: testSkillIds[1] }, // Node.js
                    ],
                },
            },
        });
    });

    afterEach(async () => {
        // Clean up after each test in correct order
        await prisma.adoptionRequest.deleteMany();
        await prisma.application.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.studentSkill.deleteMany();
        await prisma.companyProfile.deleteMany();
        await prisma.studentProfile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.skill.deleteMany();
    });

    describe('getStudentProfile', () => {
        it('should return student profile with user email and skills', async () => {
            const result = await studentService.getStudentProfile(testStudentUserId);

            expect(result).toHaveProperty('id', testStudentUserId);
            expect(result).toHaveProperty('firstName', 'John');
            expect(result).toHaveProperty('lastName', 'Doe');
            expect(result).toHaveProperty('school', 'Test University');
            expect(result).toHaveProperty('degree', 'Computer Science');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('skills');
            expect(result).toHaveProperty('cvUrl', 'https://example.com/cv.pdf');
            expect(result).toHaveProperty('isCvPublic', true);
            expect(result).toHaveProperty('isOpenToOpportunities', true);

            expect(Array.isArray(result.skills)).toBe(true);
            expect(result.skills).toHaveLength(2);

            const skillNames = result.skills.map(skill => skill.name);
            expect(skillNames).toContain('React');
            expect(skillNames).toContain('Node.js');
        });

        it('should throw NotFoundError when student profile does not exist', async () => {
            const nonExistentUserId = 'non-existent-id';

            await expect(studentService.getStudentProfile(nonExistentUserId))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('updateStudentVisibility', () => {
        it('should update student visibility to false', async () => {
            const result = await studentService.updateStudentVisibility(testStudentUserId, false);

            expect(result).toHaveProperty('isOpenToOpportunities', false);
            expect(result).toHaveProperty('userId', testStudentUserId);

            // Verify the change was persisted
            const updatedProfile = await prisma.studentProfile.findUnique({
                where: { userId: testStudentUserId },
            });
            expect(updatedProfile?.isOpenToOpportunities).toBe(false);
        });

        it('should update student visibility to true', async () => {
            // First set to false
            await studentService.updateStudentVisibility(testStudentUserId, false);

            // Then update to true
            const result = await studentService.updateStudentVisibility(testStudentUserId, true);

            expect(result).toHaveProperty('isOpenToOpportunities', true);
            expect(result).toHaveProperty('userId', testStudentUserId);

            // Verify the change was persisted
            const updatedProfile = await prisma.studentProfile.findUnique({
                where: { userId: testStudentUserId },
            });
            expect(updatedProfile?.isOpenToOpportunities).toBe(true);
        });

        it('should throw NotFoundError when student profile does not exist', async () => {
            const nonExistentUserId = 'non-existent-id';

            await expect(studentService.updateStudentVisibility(nonExistentUserId, true))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('getStudentStats', () => {
        it('should return correct student statistics', async () => {
            // Create test company and offers for applications
            const testCompanyUser = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    passwordHash: 'hashedpassword',
                    role: 'COMPANY',
                },
            });

            const testCompanyProfile = await prisma.companyProfile.create({
                data: {
                    userId: testCompanyUser.id,
                    name: 'Test Company',
                    contactEmail: faker.internet.email(),
                },
            });

            const offer1 = await prisma.offer.create({
                data: {
                    title: 'Software Engineer',
                    description: 'Great opportunity',
                    location: 'Remote',
                    duration: 'INTERNSHIP',
                    companyId: testCompanyProfile.id,
                },
            });

            const offer2 = await prisma.offer.create({
                data: {
                    title: 'Data Scientist',
                    description: 'Another opportunity',
                    location: 'On-site',
                    duration: 'FULL_TIME',
                    companyId: testCompanyProfile.id,
                },
            });

            // Create test applications with different statuses
            await prisma.application.create({
                data: {
                    studentId: testStudentUserId,
                    offerId: offer1.id,
                    status: 'NEW',
                },
            });

            await prisma.application.create({
                data: {
                    studentId: testStudentUserId,
                    offerId: offer2.id,
                    status: 'HIRED',
                },
            });

            // Create adoption request
            await prisma.adoptionRequest.create({
                data: {
                    companyId: testCompanyProfile.id,
                    studentId: testStudentUserId,
                },
            });

            const result = await studentService.getStudentStats(testStudentUserId);

            expect(result).toHaveProperty('totalApplications', 2);
            expect(result).toHaveProperty('applicationsByStatus');
            expect(result.applicationsByStatus).toHaveProperty('NEW', 1);
            expect(result.applicationsByStatus).toHaveProperty('HIRED', 1);
            expect(result).toHaveProperty('adoptionRequestsReceived', 1);
        });

        it('should throw NotFoundError when student profile does not exist', async () => {
            const nonExistentUserId = 'non-existent-id';

            await expect(studentService.getStudentStats(nonExistentUserId))
                .rejects
                .toThrow(NotFoundError);
        });

        it('should return zero stats for student with no activity', async () => {
            const result = await studentService.getStudentStats(testStudentUserId);

            expect(result).toHaveProperty('totalApplications', 0);
            expect(result).toHaveProperty('applicationsByStatus', {});
            expect(result).toHaveProperty('adoptionRequestsReceived', 0);
        });
    });
});