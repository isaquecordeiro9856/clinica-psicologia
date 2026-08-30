import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './infra/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Integration Tests - Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-chars-long!!';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long!!';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.ENCRYPTION_MASTER_KEY = '887e3506373b206486f7312fbcc26be51fdb2e0bda62fc4ff5e55096343c9447';
    process.env.ENCRYPTION_HMAC_PEPPER = 'test-hmac-pepper-for-testing';
    process.env.PIX_KEY = 'test@clinica.app';
    process.env.PIX_RECEIVER_NAME = 'CLINICA TESTE';
    process.env.PIX_RECEIVER_CITY = 'SAO PAULO';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    await cleanDatabase();

    const passwordHash = await argon2.hash('Senha123!');

    await prisma.user.create({
      data: {
        email: 'psy.test@clinica.app',
        passwordHash,
        role: 'psychologist',
        emailVerified: true,
      },
    });

    await prisma.user.create({
      data: {
        email: 'pat.test@clinica.app',
        passwordHash,
        role: 'patient',
        emailVerified: true,
      },
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  async function cleanDatabase() {
    await prisma.user.deleteMany();
  }

  it('POST /auth/register - should register new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'new.user@clinica.app',
        password: 'Senha123!',
        name: 'Novo Usuario',
        lgpdConsent: true,
      })
      .expect(201);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toHaveProperty('email', 'new.user@clinica.app');
  });

  it('POST /auth/login - should login and return tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'psy.test@clinica.app', password: 'Senha123!' })
      .expect(201);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.role).toBe('psychologist');
  });

  it('POST /auth/refresh - should refresh access token', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'psy.test@clinica.app', password: 'Senha123!' });

    const refreshToken = login.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    expect(refreshToken).toBeDefined();

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(201);

    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('GET /auth/me - should return current user', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'psy.test@clinica.app', password: 'Senha123!' });

    const token = login.body.data.accessToken;

    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('email', 'psy.test@clinica.app');
    expect(res.body.data.role).toBe('psychologist');
  });

  it('POST /auth/login - should fail with wrong credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'psy.test@clinica.app', password: 'wrong' })
      .expect(401);
  });
});

describe('Integration Tests - Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-chars-long!!';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long!!';
    process.env.ENCRYPTION_MASTER_KEY = '887e3506373b206486f7312fbcc26be51fdb2e0bda62fc4ff5e55096343c9447';
    process.env.ENCRYPTION_HMAC_PEPPER = 'test-hmac-pepper-for-testing';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health - should return health status', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(['ok', 'degraded']).toContain(res.body.status);
  });
});