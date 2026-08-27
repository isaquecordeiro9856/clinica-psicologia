import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const passwordHash = await argon2.hash('Senha123!');

  // Psicóloga demo
  const psyUser = await prisma.user.upsert({
    where: { email: 'psi@clinica.app' },
    update: {},
    create: { email: 'psi@clinica.app', passwordHash, role: Role.psychologist, emailVerified: true },
  });

  let psychologist = await prisma.psychologist.findUnique({ where: { userId: psyUser.id } });
  if (!psychologist) {
    psychologist = await prisma.psychologist.create({
      data: { userId: psyUser.id, name: 'Dra. Ana Silva', crp: '06/123456', phone: '11999999999', pixKey: 'ana@clinica.app' },
    });
  }

  // Secretária
  const secUser = await prisma.user.upsert({
    where: { email: 'secretaria@clinica.app' },
    update: {},
    create: { email: 'secretaria@clinica.app', passwordHash, role: Role.secretary, emailVerified: true },
  });
  const secExists = await prisma.secretary.findUnique({ where: { userId: secUser.id } });
  if (!secExists) {
    await prisma.secretary.create({ data: { userId: secUser.id, psychologistId: psychologist.id, name: 'Secretaria Demo' } });
  }

  // Paciente demo
  const patUser = await prisma.user.upsert({
    where: { email: 'paciente@clinica.app' },
    update: {},
    create: { email: 'paciente@clinica.app', passwordHash, role: Role.patient, emailVerified: true },
  });
  let patient = await prisma.patient.findUnique({ where: { userId: patUser.id } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { userId: patUser.id, psychologistId: psychologist.id, name: 'Paciente Demo', status: 'active' },
    });
  }

  // Serviço
  let service = await prisma.service.findFirst({ where: { psychologistId: psychologist.id } });
  if (!service) {
    service = await prisma.service.create({
      data: { psychologistId: psychologist.id, name: 'Sessão 50min', durationMinutes: 50, price: 200, active: true },
    });
  }

  // Disponibilidade seg-sex 09-18
  const existingRules = await prisma.availabilityRule.count({ where: { psychologistId: psychologist.id } });
  if (existingRules === 0) {
    await prisma.availabilityRule.createMany({
      data: [1, 2, 3, 4, 5].map((weekday) => ({
        psychologistId: psychologist.id,
        weekday,
        startTime: '09:00',
        endTime: '18:00',
        slotDuration: 50,
      })),
    });
  }

  // Templates
  const tmplExists = await prisma.formTemplate.findFirst({ where: { name: 'Anamnese Adulto' } });
  if (!tmplExists) {
    await prisma.formTemplate.create({
      data: {
        name: 'Anamnese Adulto',
        schema: {
          type: 'object',
          properties: {
            queixa: { type: 'string', title: 'Queixa principal' },
            historico: { type: 'string', title: 'Histórico' },
            medicamentos: { type: 'string', title: 'Medicamentos em uso' },
          },
          required: ['queixa'],
        },
      },
    });
  }

  console.log('✅ Seed concluído');
  console.log(`   Psicóloga: psi@clinica.app / Senha123! (CRP 06/123456)`);
  console.log(`   Secretária: secretaria@clinica.app / Senha123!`);
  console.log(`   Paciente: paciente@clinica.app / Senha123!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
