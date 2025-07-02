import { PrismaClient, Role, Prisma, Offer, Application, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const userWithCompanyProfile = Prisma.validator<Prisma.UserArgs>()({
  include: { companyProfile: true },
});
type UserWithCompanyProfile = Prisma.UserGetPayload<typeof userWithCompanyProfile>

async function main() {
  console.log('Start seeding...');

  // 1. Clean the database
  console.log('Cleaning database...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.adoptionRequest.deleteMany();
  await prisma.application.deleteMany();
  await prisma.studentSkill.deleteMany();
  // We can't delete offer skills directly, it's a relation table managed by Prisma.
  // Deleting offers will cascade.
  await prisma.offer.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleaned.');

  // 2. Create Skills
  console.log('Creating skills...');
  const skillNames = [
    'TypeScript', 'JavaScript', 'React', 'Node.js', 'GraphQL', 
    'Prisma', 'PostgreSQL', 'Docker', 'Git', 'CI/CD', 'Management',
    'Marketing Digital', 'Communication', 'Design UI/UX', 'SEO'
  ];
  const skills = await Promise.all(
    skillNames.map(name => prisma.skill.create({ data: { name } }))
  );
  console.log(`${skills.length} skills created.`);

  // 3. Create Companies
  console.log('Creating companies...');
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const companies: UserWithCompanyProfile[] = [];
  for (let i = 0; i < 5; i++) {
    const companyName = faker.company.name();
    const company = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash,
        role: Role.COMPANY,
        companyProfile: {
          create: {
            name: companyName,
            contactEmail: faker.internet.email(),
            sector: faker.company.buzzAdjective(),
            size: '100-250'
          },
        },
      },
      include: { companyProfile: true },
    });
    companies.push(company);
  }
  
  const googleCompany = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      role: Role.COMPANY,
      companyProfile: { create: { name: faker.company.name(), contactEmail: faker.internet.email() }},
      accounts: { create: { type: 'oauth', provider: 'google', providerAccountId: faker.string.uuid() } }
    },
    include: { companyProfile: true },
  });
  companies.push(googleCompany);
  console.log(`${companies.length} companies created.`);
  
  // 4. Create Offers for each company
  console.log('Creating offers...');
  const offers: Offer[] = [];
  for (const company of companies) {
    if (company.companyProfile) {
      for (let i = 0; i < 3; i++) {
        const offer = await prisma.offer.create({
          data: {
            title: faker.person.jobTitle(),
            description: faker.lorem.paragraphs(3),
            location: faker.location.city(),
            duration: faker.helpers.arrayElement(['6 months', '1 year', 'Full-time']),
            companyId: company.companyProfile.id,
            skills: {
              connect: faker.helpers.arrayElements(skills, 3).map(skill => ({
                id: skill.id,
              })),
            },
          },
        });
        offers.push(offer);
      }
    }
  }
  console.log(`${offers.length} offers created.`);

  // 5. Create Students
  console.log('Creating students...');
  const students: User[] = [];
  for (let i = 0; i < 10; i++) {
    const student = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            school: faker.helpers.arrayElement(['42', 'Epitech', 'INSA', 'HEC']),
            degree: faker.person.jobArea(),
            isOpenToOpportunities: faker.datatype.boolean(),
            skills: {
              create: faker.helpers.arrayElements(skills, 5).map(skill => ({
                skillId: skill.id,
              })),
            },
          },
        },
      },
    });
    students.push(student);
  }
  console.log(`${students.length} students created.`);
  
  // 6. Create Applications
  console.log('Creating applications...');
  const applications: Application[] = [];
  if (students.length > 0 && offers.length > 0) {
    for(let i = 0; i < 5; i++) {
      const application = await prisma.application.create({
        data: {
          studentId: faker.helpers.arrayElement(students).id,
          offerId: faker.helpers.arrayElement(offers).id
        }
      }).catch(() => null); // Ignore duplicates for simplicity
      if (application) applications.push(application);
    }
  }
  console.log(`${applications.length} applications created.`);

  // 7. Create an adoption request
  console.log('Creating an adoption request...');
  if (companies.length > 0 && students.length > 0) {
    const requestingCompany = companies.find(c => c.companyProfile);
    const requestedStudent = faker.helpers.arrayElement(students);
    if (requestingCompany && requestingCompany.companyProfile) {
      await prisma.adoptionRequest.create({
        data: {
          companyId: requestingCompany.companyProfile.id,
          studentId: requestedStudent.id,
        }
      });
      console.log('Adoption request created.');
    }
  }

  // 8. Create a conversation in an application
  console.log('Creating a conversation...');
  if (applications.length > 0) {
    const appWithConversation = faker.helpers.arrayElement(applications);
    const appStudent = await prisma.user.findUnique({ where: { id: appWithConversation.studentId } });
    const appOffer = await prisma.offer.findUnique({ where: { id: appWithConversation.offerId }, include: { company: { include: { user: true } } } });

    if (appStudent && appOffer) {
      const appCompanyUser = appOffer.company.user;

      // Create a conversation linked to the application
      const conversation = await prisma.conversation.create({
        data: {
          application: {
            connect: { id: appWithConversation.id },
          },
        },
      });

      await prisma.message.createMany({
        data: [
          { conversationId: conversation.id, senderId: appStudent.id, content: 'Hello, I am very interested in this offer. Is it still available?' },
          { conversationId: conversation.id, senderId: appCompanyUser.id, content: 'Yes, absolutely. We are reviewing applications this week. Could you tell us more about your experience with React?' },
          { conversationId: conversation.id, senderId: appStudent.id, content: 'Certainly, I have two years of professional experience...' },
        ]
      });
      console.log('Conversation created.');
    }
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