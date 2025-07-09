import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { buildTestApp } from '../helpers/test-app';
import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';

describe('Two Factor Auth Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    let userAuthToken = '';
    let userId = '';
    let userEmail = '';

    beforeEach(async () => {
        // Create a user for testing 2FA
        const userData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'STUDENT',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };
        userEmail = userData.email;
        
        await supertest(app.server).post('/api/auth/register').send(userData);
        const loginResponse = await supertest(app.server).post('/api/auth/login').send({ 
            email: userData.email, 
            password: userData.password 
        });
        const cookie = loginResponse.headers['set-cookie'][0];
        userAuthToken = cookie.split(';')[0].replace('token=', '');

        const user = await prisma.user.findUnique({ where: { email: userData.email } });
        userId = user!.id;
    });

    afterEach(async () => {
        // Clean up
        await prisma.studentProfile.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('POST /api/2fa/generate', () => {
        it('should generate a 2FA secret and QR code for authenticated user', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/generate')
                .set('Cookie', `token=${userAuthToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('secret');
            expect(response.body).toHaveProperty('qrCodeUrl');
            expect(typeof response.body.secret).toBe('string');
            expect(response.body.secret.length).toBeGreaterThan(20); // Flexible length check
            expect(response.body.qrCodeUrl).toContain('data:image/png;base64,');

            // Verify secret was saved to database
            const user = await prisma.user.findUnique({ where: { id: userId } });
            expect(user!.twoFactorSecret).toBe(response.body.secret);
            expect(user!.isTwoFactorEnabled).toBe(false); // Not enabled until verified
        });

        it('should return 400 if 2FA is already enabled', async () => {
            // First enable 2FA
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    isTwoFactorEnabled: true,
                    twoFactorSecret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'
                }
            });

            const response = await supertest(app.server)
                .post('/api/2fa/generate')
                .set('Cookie', `token=${userAuthToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('2FA is already enabled');
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/generate');

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent user', async () => {
            // Delete the user but keep the token (simulate edge case)
            await prisma.user.delete({ where: { id: userId } });

            const response = await supertest(app.server)
                .post('/api/2fa/generate')
                .set('Cookie', `token=${userAuthToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('POST /api/2fa/verify', () => {
        let secret: string;

        beforeEach(async () => {
            // Generate a secret first
            const generateResponse = await supertest(app.server)
                .post('/api/2fa/generate')
                .set('Cookie', `token=${userAuthToken}`);
            secret = generateResponse.body.secret;
        });

        it('should verify a valid TOTP token and enable 2FA', async () => {
            // Generate a valid TOTP token
            const token = speakeasy.totp({
                secret: secret,
                encoding: 'base32'
            });

            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('2FA enabled successfully');
            expect(response.body).toHaveProperty('recoveryCodes');
            expect(response.body.recoveryCodes).toBeInstanceOf(Array);
            expect(response.body.recoveryCodes).toHaveLength(10);

            // Verify 2FA is enabled in database
            const user = await prisma.user.findUnique({ where: { id: userId } });
            expect(user!.isTwoFactorEnabled).toBe(true);
            expect(user!.twoFactorRecoveryCodes).toHaveLength(10);
        });

        it('should return 400 for invalid token format', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: '123' }); // Too short

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input');
        });

        it('should return 400 for invalid TOTP token', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: '123456' }); // Invalid token

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid token or recovery code');
        });

        it('should return 400 if no secret exists', async () => {
            // Remove the secret
            await prisma.user.update({
                where: { id: userId },
                data: { twoFactorSecret: null }
            });

            const token = speakeasy.totp({
                secret: secret,
                encoding: 'base32'
            });

            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('2FA not requested or secret not found');
        });

        it('should accept recovery codes for verification', async () => {
            // First setup recovery codes with 6-digit format
            const recoveryCode = '123456'; // 6-digit recovery code matching the schema
            const hashedCode = await bcrypt.hash(recoveryCode, 10);
            
            await prisma.user.update({
                where: { id: userId },
                data: { twoFactorRecoveryCodes: [hashedCode] }
            });

            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: recoveryCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('2FA enabled successfully');

            // Verify the recovery code was consumed
            const user = await prisma.user.findUnique({ where: { id: userId } });
            expect(user!.twoFactorRecoveryCodes).not.toContain(hashedCode);
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/verify')
                .send({ token: '123456' });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/2fa/disable', () => {
        let secret: string;

        beforeEach(async () => {
            // Generate secret and enable 2FA
            const generateResponse = await supertest(app.server)
                .post('/api/2fa/generate')
                .set('Cookie', `token=${userAuthToken}`);
            secret = generateResponse.body.secret;

            const token = speakeasy.totp({
                secret: secret,
                encoding: 'base32'
            });

            await supertest(app.server)
                .post('/api/2fa/verify')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token });
        });

        it('should disable 2FA with valid TOTP token', async () => {
            const token = speakeasy.totp({
                secret: secret,
                encoding: 'base32'
            });

            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('2FA disabled successfully');

            // Verify 2FA is disabled in database
            const user = await prisma.user.findUnique({ where: { id: userId } });
            expect(user!.isTwoFactorEnabled).toBe(false);
            expect(user!.twoFactorSecret).toBeNull();
            expect(user!.twoFactorRecoveryCodes).toHaveLength(0);
        });

        it('should disable 2FA with valid recovery code', async () => {
            // Create a test recovery code with 6-digit format
            const recoveryCode = '654321'; // 6-digit recovery code matching the schema
            const newHashedCode = await bcrypt.hash(recoveryCode, 10);
            
            await prisma.user.update({
                where: { id: userId },
                data: { twoFactorRecoveryCodes: [newHashedCode] }
            });

            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: recoveryCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('2FA disabled successfully');

            // Verify 2FA is disabled in database
            const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
            expect(updatedUser!.isTwoFactorEnabled).toBe(false);
        });

        it('should return 400 for invalid token format', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: '123' }); // Too short

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input');
        });

        it('should return 400 for invalid TOTP token', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: '123456' }); // Invalid token

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid token or recovery code');
        });

        it('should return 400 if 2FA is not enabled', async () => {
            // Disable 2FA first
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    isTwoFactorEnabled: false,
                    twoFactorSecret: null 
                }
            });

            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .set('Cookie', `token=${userAuthToken}`)
                .send({ token: '123456' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('2FA is not enabled for this user');
        });

        it('should require authentication', async () => {
            const response = await supertest(app.server)
                .post('/api/2fa/disable')
                .send({ token: '123456' });

            expect(response.status).toBe(401);
        });
    });
}); 