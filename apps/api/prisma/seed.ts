import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean the database
  console.log('Cleaning database...');
  await prisma.application.deleteMany({});
  await prisma.studentSkill.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.companyProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Company and Offers
  console.log('Creating company and offers...');
  const companyPasswordHash = await bcrypt.hash('Company123!', 10);
  const companyUser = await prisma.user.create({
    data: {
      email: 'ole.kemmer87@gmail.com',
      passwordHash: companyPasswordHash,
      role: Role.COMPANY,
      companyProfile: {
        create: {
          name: 'Ole',
          contactEmail: 'ole.kemmer87@gmail.com',
          sector: 'Tech',
          size: '50',
        },
      },
    },
    include: { companyProfile: true },
  });

  const offerSkills = ['React', 'Node.js', 'GraphQL', 'TypeScript', 'Prisma'];
  const skillOps = offerSkills.map(name =>
    prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
  );
  const createdOfferSkills = await prisma.$transaction(skillOps);

  await prisma.offer.createMany({
    data: [
      {
        title: 'Senior Frontend Developer (React)',
        description: 'Join our team to lead the development of our next-gen user interfaces.',
        location: 'Remote',
        duration: 'Full-time',
        companyId: companyUser.companyProfile!.id,
      },
      {
        title: 'Full-Stack Engineer (Node.js/TypeScript)',
        description: 'We are looking for a skilled full-stack engineer to build and maintain our backend services.',
        location: 'Berlin, Germany',
        duration: 'Full-time',
        companyId: companyUser.companyProfile!.id,
      },
      {
        title: 'DevOps Engineer',
        description: 'Help us scale our infrastructure and improve our deployment pipelines.',
        location: 'Remote',
        duration: 'Contract',
        companyId: companyUser.companyProfile!.id,
      },
    ],
  });
  
  const offerToApply = await prisma.offer.findFirst({ where: { title: 'Senior Frontend Developer (React)' }});

  // 3. Create Student and Profile
  console.log('Creating student...');
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const studentUser = await prisma.user.create({
    data: {
      email: 'thomas.dubois@insa-lyon.fr',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const studentSkills = ['Django Dev', 'Fluetter Dev', 'Management', 'Critical Thinking'];
  const studentSkillOps = studentSkills.map(name =>
    prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
  );
  const createdStudentSkills = await prisma.$transaction(studentSkillOps);

  await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      firstName: 'Thomas',
      lastName: 'Dubois',
      school: '42',
      degree: 'Masters Web Debeloppement',
      skills: {
        create: createdStudentSkills.map(skill => ({
          skillId: skill.id,
        })),
      },
    },
  });

  // 4. Create Application
  console.log('Creating application...');
  if (offerToApply) {
    await prisma.application.create({
      data: {
        studentId: studentUser.id,
        offerId: offerToApply.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 