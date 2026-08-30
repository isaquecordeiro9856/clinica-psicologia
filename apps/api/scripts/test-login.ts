import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma/prisma.service';

async function test() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.setGlobalPrefix('api/v1');

  try {
    // Use an ephemeral port so this diagnostic never collides with the dev server.
    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'object' && address ? address.port : 0;
    console.log('API started on port', port);

    // Test Prisma and the resolved AuthController dependency manually.
    const prisma = app.get(PrismaService);
    const r = await prisma.$queryRaw`SELECT 1`;
    console.log('Prisma query OK:', r);
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'psi@clinica.app', password: 'Senha123!' }),
    });
    const body = await res.text();
    console.log('Login response:', res.status, body);
    if (!res.ok) process.exitCode = 1;
  } finally {
    await app.close();
  }
}

test().catch(e => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
