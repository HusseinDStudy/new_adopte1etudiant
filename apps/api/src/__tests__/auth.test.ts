import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import { prisma } from 'db-postgres';
import { buildTestApp } from '../helpers/test-app';
import { sanitizeString } from '../middleware/sanitizationMiddleware';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up database after each test
    await prisma.offer.deleteMany();
    await prisma.studentSkill.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.skill.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student user successfully', async () => {
      const studentData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await supertest(app.server)
        .post('/api/auth/register')
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(studentData.email);
      expect(response.body.role).toBe('STUDENT');

      // Verify user and profile were created in the database
      const user = await prisma.user.findUnique({ where: { email: studentData.email } });
      expect(user).not.toBeNull();
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user!.id } });
      expect(studentProfile).not.toBeNull();
      expect(studentProfile?.firstName).toBe(studentData.firstName);
    });

    it('should register a new company user successfully', async () => {
      const companyData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'COMPANY',
        name: "O'Conner - Lebsack", // Use a fixed string to guarantee an apostrophe
        contactEmail: faker.internet.email(),
      };

      const response = await supertest(app.server)
        .post('/api/auth/register')
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(companyData.email);
      expect(response.body.role).toBe('COMPANY');

      // Verify user and profile were created
      const user = await prisma.user.findUnique({ where: { email: companyData.email } });
      expect(user).not.toBeNull();
      const companyProfile = await prisma.companyProfile.findUnique({ where: { userId: user!.id } });
      expect(companyProfile).not.toBeNull();
      expect(companyProfile?.name).toBe("O&#x27;Conner - Lebsack");
    });

    it('should return 409 if user with the same email already exists', async () => {
      const existingUser = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      
      // Create user first
      await supertest(app.server).post('/api/auth/register').send(existingUser);
      
      // Attempt to register again with the same email
      const response = await supertest(app.server)
        .post('/api/auth/register')
        .send({ ...existingUser, password: 'anotherpassword' });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 for invalid role', async () => {
      const invalidData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'INVALID_ROLE',
      };

      const response = await supertest(app.server)
        .post('/api/auth/register')
        .send(invalidData);
      
      // The backend will reject the request due to schema validation.
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const studentData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'STUDENT',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    beforeEach(async () => {
      // Create a user to be used for login tests
      await supertest(app.server).post('/api/auth/register').send(studentData);
    });

    it('should login a user successfully and return a token cookie', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({
          email: studentData.email,
          password: studentData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged in successfully');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({
          email: studentData.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 200 with twoFactorRequired for user with 2FA enabled', async () => {
      // Enable 2FA for the user
      const user = await prisma.user.findUnique({ where: { email: studentData.email } });
      await prisma.user.update({
        where: { id: user!.id },
        data: { isTwoFactorEnabled: true, twoFactorSecret: 'secret' },
      });

      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({
          email: studentData.email,
          password: studentData.password,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.twoFactorRequired).toBe(true);
      expect(response.headers['set-cookie'][0]).toContain('2fa_token=');
    });

    it('should return 403 when password login is disabled', async () => {
      // Disable password login for the user
      const user = await prisma.user.findUnique({ where: { email: studentData.email } });
      await prisma.user.update({
        where: { id: user!.id },
        data: { passwordLoginDisabled: true },
      });

      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({
          email: studentData.email,
          password: studentData.password,
        });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Password login is disabled');
    });
  });

  describe('Authenticated Routes', () => {
    let authToken = '';
    const userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'STUDENT',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    beforeEach(async () => {
      // Create user
      await supertest(app.server).post('/api/auth/register').send(userData);
      
      // Login to get token
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      
      const cookie = response.headers['set-cookie'][0];
      authToken = cookie.split(';')[0].replace('token=', '');
    });

    describe('GET /api/auth/me', () => {
      it('should return user data for an authenticated user', async () => {
        const response = await supertest(app.server)
          .get('/api/auth/me')
          .set('Cookie', `token=${authToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(userData.email);
        expect(response.body).toHaveProperty('hasPassword', true);
        expect(response.body).toHaveProperty('linkedProviders');
      });

      it('should return 401 if not authenticated', async () => {
        const response = await supertest(app.server).get('/api/auth/me');
        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should clear the token cookie on logout', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/logout')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logged out successfully');
        expect(response.headers['set-cookie'][0]).toContain('token=;');
        expect(response.headers['set-cookie'][0]).toContain('Expires=');
      });
    });
  });

  describe('POST /api/auth/verify-2fa', () => {
    let twoFaTokenCookie = '';
    const secret = speakeasy.generateSecret({ length: 20 }).base32;

    const userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'STUDENT',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    beforeEach(async () => {
      // Create user with 2FA enabled
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          role: userData.role as 'STUDENT' | 'COMPANY',
          passwordHash: await bcrypt.hash(userData.password, 10),
          isTwoFactorEnabled: true,
          twoFactorSecret: secret,
        },
      });
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });

      // Login to get 2fa_token cookie
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      
      twoFaTokenCookie = response.headers['set-cookie'][0];
    });

    it('should verify 2FA token and log in user', async () => {
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      const response = await supertest(app.server)
        .post('/api/auth/login/verify-2fa')
        .set('Cookie', twoFaTokenCookie)
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged in successfully');
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 401 for an invalid 2FA token', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/login/verify-2fa')
        .set('Cookie', twoFaTokenCookie)
        .send({ token: '123456' });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid 2FA token or recovery code.');
    });

    it('should return 401 if 2fa_token cookie is missing', async () => {
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });
      
      const response = await supertest(app.server)
        .post('/api/auth/login/verify-2fa')
        .send({ token });
        
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No 2FA session found. Please login again.');
    });
  });

  describe('OAuth Routes', () => {
    describe('POST /api/auth/complete-link', () => {
      it('should link Google account to existing user', async () => {
        // Create existing user
        const userData = {
          email: faker.internet.email(),
          password: faker.internet.password(),
          role: 'STUDENT',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        };
        
        await supertest(app.server)
          .post('/api/auth/register')
          .send(userData);

        // Create linking token
        const linkingPayload = {
          userId: (await prisma.user.findFirst({ where: { email: userData.email } }))!.id,
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const linkingToken = jwt.sign(linkingPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', `Bearer ${linkingToken}`)
          .send({ choice: 'keep_both' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Account linked successfully.');

        // Verify account was created
        const account = await prisma.account.findFirst({
          where: { provider: 'google', providerAccountId: linkingPayload.providerAccountId }
        });
        expect(account).toBeTruthy();
      });

      it('should link Google account and disable password login', async () => {
        // Create existing user
        const userData = {
          email: faker.internet.email(),
          password: faker.internet.password(),
          role: 'STUDENT',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        };
        
        await supertest(app.server)
          .post('/api/auth/register')
          .send(userData);

        const user = await prisma.user.findFirst({ where: { email: userData.email } });

        // Create linking token
        const linkingPayload = {
          userId: user!.id,
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const linkingToken = jwt.sign(linkingPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', `Bearer ${linkingToken}`)
          .send({ choice: 'google_only' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Account linked successfully.');

        // Verify password was disabled
        const updatedUser = await prisma.user.findFirst({ where: { id: user!.id } });
        expect(updatedUser!.passwordHash).toBeNull();
        expect(updatedUser!.passwordLoginDisabled).toBe(true);
      });

      it('should return 401 for missing authorization header', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .send({ choice: 'keep_both' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should return 401 for invalid authorization header format', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', 'InvalidFormat')
          .send({ choice: 'keep_both' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should return 401 for invalid JWT token', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', 'Bearer invalid_token')
          .send({ choice: 'keep_both' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid linking token');
      });

      it('should return 401 for non-existent user in token', async () => {
        const invalidPayload = {
          userId: faker.string.uuid(), // Non-existent user ID
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const invalidToken = jwt.sign(invalidPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({ choice: 'keep_both' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid user in token.');
      });

      it('should return 400 for invalid request body', async () => {
        // Create user and valid token
        const userData = {
          email: faker.internet.email(),
          password: faker.internet.password(),
          role: 'STUDENT',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        };
        
        await supertest(app.server)
          .post('/api/auth/register')
          .send(userData);

        const user = await prisma.user.findFirst({ where: { email: userData.email } });

        const linkingPayload = {
          userId: user!.id,
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const linkingToken = jwt.sign(linkingPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-link')
          .set('Authorization', `Bearer ${linkingToken}`)
          .send({ invalid: 'data' });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/auth/complete-oauth-registration', () => {
      it('should complete OAuth registration for student', async () => {
        const registrationPayload = {
          email: faker.internet.email(),
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const registrationToken = jwt.sign(registrationPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-oauth-registration')
          .set('Authorization', `Bearer ${registrationToken}`)
          .send({
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          });

        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(registrationPayload.email);
        expect(response.headers['set-cookie']).toBeDefined();

        // Verify user was created
        const user = await prisma.user.findFirst({ where: { email: registrationPayload.email } });
        expect(user).toBeTruthy();
        expect(user!.passwordLoginDisabled).toBe(true);
        expect(user!.passwordHash).toBeNull();

        // Verify student profile was created
        const studentProfile = await prisma.studentProfile.findFirst({ where: { userId: user!.id } });
        expect(studentProfile).toBeTruthy();

        // Verify account was created
        const account = await prisma.account.findFirst({ where: { userId: user!.id, provider: 'google' } });
        expect(account).toBeTruthy();
      });

      it('should complete OAuth registration for company', async () => {
        const registrationPayload = {
          email: faker.internet.email(),
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const registrationToken = jwt.sign(registrationPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-oauth-registration')
          .set('Authorization', `Bearer ${registrationToken}`)
          .send({
            role: 'COMPANY',
            name: faker.company.name(),
            contactEmail: faker.internet.email(),
          });

        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(registrationPayload.email);

        // Verify company profile was created
        const user = await prisma.user.findFirst({ where: { email: registrationPayload.email } });
        const companyProfile = await prisma.companyProfile.findFirst({ where: { userId: user!.id } });
        expect(companyProfile).toBeTruthy();
      });

      it('should return 401 for missing authorization header', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/complete-oauth-registration')
          .send({
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should return 401 for invalid JWT token', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/complete-oauth-registration')
          .set('Authorization', 'Bearer invalid_token')
          .send({
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid registration token');
      });

      it('should return 400 for invalid request body', async () => {
        const registrationPayload = {
          email: faker.internet.email(),
          provider: 'google',
          providerAccountId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          refreshToken: faker.string.uuid(),
          expiresAt: 3600,
        };

        const registrationToken = jwt.sign(registrationPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        const response = await supertest(app.server)
          .post('/api/auth/complete-oauth-registration')
          .set('Authorization', `Bearer ${registrationToken}`)
          .send({
            role: 'INVALID_ROLE', // Invalid role
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          });

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/auth/google/delete-callback', () => {
      let authToken = '';
      let userId = '';
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      beforeEach(async () => {
        // Create user
        await supertest(app.server).post('/api/auth/register').send(userData);
        
        // Login to get token
        const response = await supertest(app.server)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });
        
        const cookie = response.headers['set-cookie'][0];
        authToken = cookie.split(';')[0].replace('token=', '');

        const user = await prisma.user.findFirst({ where: { email: userData.email } });
        userId = user!.id;
      });

      it('should return 401 when user is not authenticated', async () => {
        const response = await supertest(app.server)
          .get('/api/auth/google/delete-callback')
          .query({ code: 'mock_auth_code', state: 'mock_state' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication required');
      });

      it('should handle authenticated user but fail OAuth due to missing external service', async () => {
        // This test will fail because we don't have real Google OAuth setup
        // But it tests that the route is properly protected by authMiddleware
        const response = await supertest(app.server)
          .get('/api/auth/google/delete-callback')
          .set('Cookie', `token=${authToken}`)
          .query({ code: 'mock_auth_code', state: 'mock_state' });

        // Should fail due to OAuth setup issues, but not due to auth
        expect([400, 500]).toContain(response.status);
      });
    });

    describe('GET /api/auth/google/callback edge cases', () => {
      let authToken = '';
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      beforeEach(async () => {
        // Create user and enable 2FA
        await supertest(app.server).post('/api/auth/register').send(userData);
        
        const user = await prisma.user.findFirst({ where: { email: userData.email } });
        
        // Enable 2FA for testing 2FA flow in OAuth
        await prisma.user.update({
          where: { id: user!.id },
          data: { 
            isTwoFactorEnabled: true, 
            twoFactorSecret: 'test_secret' 
          },
        });

        // Login to get token
        const response = await supertest(app.server)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });
        
        if (response.headers['set-cookie']) {
          const cookie = response.headers['set-cookie'][0];
          authToken = cookie.split(';')[0].replace('token=', '');
        }
      });

      it('should handle OAuth callback with missing external service', async () => {
        // Test that route exists and handles missing OAuth properly
        const response = await supertest(app.server)
          .get('/api/auth/google/callback')
          .query({ code: 'mock_auth_code', state: 'mock_state' });

        // Should fail due to OAuth setup issues
        expect([400, 500]).toContain(response.status);
      });

      it('should handle OAuth callback when user is already logged in', async () => {
        // Test authenticated user hitting OAuth callback
        const response = await supertest(app.server)
          .get('/api/auth/google/callback')
          .set('Cookie', `token=${authToken}`)
          .query({ code: 'mock_auth_code', state: 'mock_state' });

        // Should fail due to OAuth setup issues, not auth issues
        expect([400, 500]).toContain(response.status);
      });
    });
  });

  describe('AuthController Edge Cases', () => {
    let authToken = '';
    let userId = '';
    const userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'STUDENT',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    beforeEach(async () => {
      // Create user
      await supertest(app.server).post('/api/auth/register').send(userData);
      
      // Login to get token
      const response = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      
      const cookie = response.headers['set-cookie'][0];
      authToken = cookie.split(';')[0].replace('token=', '');

      const user = await prisma.user.findFirst({ where: { email: userData.email } });
      userId = user!.id;
    });

    describe('DELETE /api/auth/account', () => {
      it('should delete account with correct password', async () => {
        const response = await supertest(app.server)
          .delete('/api/auth/account')
          .set('Cookie', `token=${authToken}`)
          .send({ password: userData.password });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Account deleted successfully.');
        expect(response.headers['set-cookie'][0]).toContain('token=;');

        // Verify user was deleted
        const user = await prisma.user.findFirst({ where: { id: userId } });
        expect(user).toBeNull();
      });

      it('should return 400 when password is missing', async () => {
        const response = await supertest(app.server)
          .delete('/api/auth/account')
          .set('Cookie', `token=${authToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Password is required for deletion.');
      });

      it('should return 401 for incorrect password', async () => {
        const response = await supertest(app.server)
          .delete('/api/auth/account')
          .set('Cookie', `token=${authToken}`)
          .send({ password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Incorrect password.');
      });

      it('should return 400 for OAuth user without password', async () => {
        // Update user to remove password (simulate OAuth user)
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: null, passwordLoginDisabled: true },
        });

        const response = await supertest(app.server)
          .delete('/api/auth/account')
          .set('Cookie', `token=${authToken}`)
          .send({ password: 'anypassword' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('This account must be deleted via the original sign-in provider.');
      });

      it('should return 404 for non-existent user', async () => {
        // Delete user first
        await prisma.user.delete({ where: { id: userId } });

        const response = await supertest(app.server)
          .delete('/api/auth/account')
          .set('Cookie', `token=${authToken}`)
          .send({ password: userData.password });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });
    });

    describe('POST /api/auth/disable-password', () => {
      it('should disable password login when user has linked accounts', async () => {
        // Create a linked account first
        await prisma.account.create({
          data: {
            userId: userId,
            type: 'oauth',
            provider: 'google',
            providerAccountId: faker.string.uuid(),
          },
        });

        const response = await supertest(app.server)
          .post('/api/auth/disable-password')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password login has been disabled.');

        // Verify password was disabled
        const user = await prisma.user.findFirst({ where: { id: userId } });
        expect(user!.passwordHash).toBeNull();
        expect(user!.passwordLoginDisabled).toBe(true);
      });

      it('should return 400 when user has no linked accounts', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/disable-password')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You must have at least one social login linked before disabling your password.');
      });

      it('should return 400 when password is already disabled', async () => {
        // Disable password first
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: null, passwordLoginDisabled: true },
        });

        const response = await supertest(app.server)
          .post('/api/auth/disable-password')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Password login is already disabled.');
      });

      it('should return 404 for non-existent user', async () => {
        // Delete user first
        await prisma.user.delete({ where: { id: userId } });

        const response = await supertest(app.server)
          .post('/api/auth/disable-password')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });
    });

    describe('PATCH /api/auth/change-password', () => {
      it('should change password successfully', async () => {
        const newPassword = 'newpassword123';
        
        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            currentPassword: userData.password,
            newPassword: newPassword,
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password changed successfully. Please log in again.');
        expect(response.headers['set-cookie'][0]).toContain('token=;');

        // Verify password was changed
        const user = await prisma.user.findFirst({ where: { id: userId } });
        const isNewPasswordValid = await bcrypt.compare(newPassword, user!.passwordHash!);
        expect(isNewPasswordValid).toBe(true);
      });

      it('should return 401 for incorrect current password', async () => {
        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            currentPassword: 'wrongpassword',
            newPassword: 'newpassword123',
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Current password is incorrect');
      });

      it('should return 400 for password too short', async () => {
        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            currentPassword: userData.password,
            newPassword: 'short',
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('body/newPassword must NOT have fewer than 8 characters');
      });

      it('should return 400 for OAuth user without password', async () => {
        // Update user to remove password (simulate OAuth user)
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: null, passwordLoginDisabled: true },
        });

        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            currentPassword: 'anypassword',
            newPassword: 'newpassword123',
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('This account does not have a password set');
      });

      it('should return 404 for non-existent user', async () => {
        // Delete user first
        await prisma.user.delete({ where: { id: userId } });

        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            currentPassword: userData.password,
            newPassword: 'newpassword123',
          });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });

      it('should return 400 for invalid request body', async () => {
        const response = await supertest(app.server)
          .patch('/api/auth/change-password')
          .set('Cookie', `token=${authToken}`)
          .send({
            // Missing required fields
            invalidField: 'value',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/auth/me error cases', () => {
      it('should return 404 when user is deleted but token is valid', async () => {
        // Delete user but keep token valid
        await prisma.user.delete({ where: { id: userId } });

        const response = await supertest(app.server)
          .get('/api/auth/me')
          .set('Cookie', `token=${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });
    });
  });

  describe('Additional Auth Controller Error Handling', () => {
    describe('POST /api/auth/login/verify-2fa edge cases', () => {
      let tempToken = '';
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      beforeEach(async () => {
        // Create user with 2FA enabled
        await supertest(app.server).post('/api/auth/register').send(userData);
        
        const user = await prisma.user.findFirst({ where: { email: userData.email } });
        
        await prisma.user.update({
          where: { id: user!.id },
          data: { 
            isTwoFactorEnabled: true, 
            twoFactorSecret: 'JBSWY3DPEHPK3PXP' // Valid base32 secret
          },
        });

        // Login to get 2FA temp token
        const response = await supertest(app.server)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });
        
        if (response.headers['set-cookie']) {
          const cookie = response.headers['set-cookie'][0];
          tempToken = cookie.split(';')[0].replace('2fa_token=', '');
        }
      });

      it('should return 401 for missing 2FA token cookie', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/login/verify-2fa')
          .send({ token: '123456' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('No 2FA session found. Please login again.');
      });

      it('should return 401 for invalid 2FA token format', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/login/verify-2fa')
          .set('Cookie', `2fa_token=${tempToken}`)
          .send({ token: 'invalid' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid 2FA token or recovery code.');
      });

      it('should return 401 for invalid 2FA verification token', async () => {
        const response = await supertest(app.server)
          .post('/api/auth/login/verify-2fa')
          .set('Cookie', `2fa_token=${tempToken}`)
          .send({ token: '000000' }); // Wrong TOTP

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid 2FA token or recovery code.');
      });

      it('should handle expired 2FA session token', async () => {
        // Create an expired token
        const expiredPayload = {
          id: faker.string.uuid(),
          email: userData.email,
          '2fa_in_progress': true,
        };
        const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET!, { expiresIn: '-1h' });

        const response = await supertest(app.server)
          .post('/api/auth/login/verify-2fa')
          .set('Cookie', `2fa_token=${expiredToken}`)
          .send({ token: '123456' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('2FA session expired. Please login again.');
      });
    });

    describe('Server error simulation', () => {
             it('should handle database errors gracefully in getMe', async () => {
         // Create a user first
         const userData = {
           email: faker.internet.email(),
           password: faker.internet.password(),
           role: 'STUDENT',
           firstName: faker.person.firstName(),
           lastName: faker.person.lastName(),
         };

         await supertest(app.server).post('/api/auth/register').send(userData);
         
         const response = await supertest(app.server)
           .post('/api/auth/login')
           .send({ email: userData.email, password: userData.password });
         
         const cookie = response.headers['set-cookie'][0];
         const authToken = cookie.split(';')[0].replace('token=', '');

         // Create a token with a non-existent user ID to trigger internal error handling  
         const invalidUserPayload: any = {
           id: faker.string.uuid(), // Non-existent ID
           email: userData.email,
           role: 'STUDENT',
         };
         const invalidToken = jwt.sign(invalidUserPayload, process.env.JWT_SECRET!);

         const meResponse = await supertest(app.server)
           .get('/api/auth/me')
           .set('Cookie', `token=${invalidToken}`);

         expect(meResponse.status).toBe(404);
         expect(meResponse.body.message).toBe('User not found');
       });
    });
  });

  describe('Route Input Validation', () => {
    it('should validate request body for complete-link endpoint', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/complete-link')
        .set('Authorization', 'Bearer valid_token_format')
        .send({}); // Empty body

      expect(response.status).toBe(400); // Will fail at schema validation first
    });

    it('should validate request body for complete-oauth-registration endpoint', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/complete-oauth-registration')
        .set('Authorization', 'Bearer valid_token_format')
        .send({}); // Empty body

      expect(response.status).toBe(400); // Will fail at schema validation first
    });

    it('should validate request body for login/verify-2fa endpoint', async () => {
      const response = await supertest(app.server)
        .post('/api/auth/login/verify-2fa')
        .send({}); // Missing token field

      expect(response.status).toBe(400);
    });

    it('should validate request body for change-password endpoint', async () => {
      // Create and login user first
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'STUDENT',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      await supertest(app.server).post('/api/auth/register').send(userData);
      
      const loginResponse = await supertest(app.server)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      
      const cookie = loginResponse.headers['set-cookie'][0];
      const authToken = cookie.split(';')[0].replace('token=', '');

      const response = await supertest(app.server)
        .patch('/api/auth/change-password')
        .set('Cookie', `token=${authToken}`)
        .send({ invalidField: 'value' }); // Missing required fields

      expect(response.status).toBe(400);
    });
  });
}); 