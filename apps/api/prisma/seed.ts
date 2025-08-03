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
  // Clean blog data
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
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

  // 6. Create Admin Users
  console.log('Creating admin users...');
  const adminUsers: User[] = [];

  // Create a main admin user with predictable credentials for testing
  const mainAdmin = await prisma.user.create({
    data: {
      email: 'admin@adopte1etudiant.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
  });
  adminUsers.push(mainAdmin);

  // Create additional admin users with Faker data
  for (let i = 0; i < 2; i++) {
    const admin = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN,
      },
    });
    adminUsers.push(admin);
  }
  console.log(`${adminUsers.length} admin users created.`);

  // 7. Create Applications
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

  // 8. Create an adoption request
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

  // 9. Create a conversation in an application
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

  // 10. Create Blog Categories
  console.log('Creating blog categories...');

  // Helper function to generate slug from name
  const generateCategorySlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Generate dynamic blog categories with Faker
  const availableIcons = ['BookOpen', 'TrendingUp', 'FileText', 'Users', 'Briefcase', 'GraduationCap', 'Target', 'Lightbulb'];
  const availableColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  const numberOfCategories = faker.number.int({ min: 3, max: 6 });
  const blogCategories: Array<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
  }> = [];

  for (let i = 0; i < numberOfCategories; i++) {
    const name = faker.lorem.words({ min: 1, max: 2 });
    const capitalizedName = name.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    blogCategories.push({
      name: capitalizedName,
      slug: generateCategorySlug(capitalizedName),
      description: faker.lorem.sentence({ min: 8, max: 15 }),
      icon: faker.helpers.arrayElement(availableIcons),
      color: faker.helpers.arrayElement(availableColors)
    });
  }

  const createdCategories = await Promise.all(
    blogCategories.map(category =>
      prisma.blogCategory.create({ data: category })
    )
  );
  console.log(`${createdCategories.length} blog categories created.`);

  // 11. Create Blog Posts
  console.log('Creating blog posts...');

  // Helper function to generate blog content
  const generateBlogContent = () => {
    const sections = faker.number.int({ min: 3, max: 6 });
    let content = `<h2>${faker.lorem.sentence()}</h2>`;
    content += `<p>${faker.lorem.paragraphs(2, '<br/>')}</p>`;

    for (let i = 0; i < sections; i++) {
      content += `<h3>${faker.lorem.sentence()}</h3>`;
      content += `<p>${faker.lorem.paragraphs(1)}</p>`;

      // Sometimes add a list
      if (faker.datatype.boolean()) {
        content += '<ul>';
        const listItems = faker.number.int({ min: 3, max: 6 });
        for (let j = 0; j < listItems; j++) {
          content += `<li>${faker.lorem.sentence()}</li>`;
        }
        content += '</ul>';
      }
    }

    content += `<p>${faker.lorem.paragraph()}</p>`;
    return content;
  };

  // Helper function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Generate blog posts with Faker
  const blogPosts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    readTimeMinutes: number;
    published: boolean;
    featured: boolean;
    image: string;
    metaTitle: string;
    metaDescription: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  // Use the dynamic categories created above
  const categoryNames = blogCategories.map(cat => cat.name);
  const authors = [
    faker.person.fullName(),
    faker.person.fullName(),
    faker.person.fullName(),
    faker.person.fullName(),
    faker.person.fullName()
  ];

  // Create 8-12 blog posts
  const numberOfPosts = faker.number.int({ min: 8, max: 12 });

  for (let i = 0; i < numberOfPosts; i++) {
    const title = faker.lorem.words({ min: 4, max: 8 }).slice(0, 130); // Ensure title is under 140 chars
    const category = faker.helpers.arrayElement(categoryNames);
    const author = faker.helpers.arrayElement(authors);
    const isPublished = faker.datatype.boolean(0.8); // 80% chance of being published
    const isFeatured = isPublished && faker.datatype.boolean(0.2); // 20% chance of being featured if published
    const createdDate = faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date()
    });

    const metaTitle = `${title.slice(0, 40)} | Adopte1Etudiant`.slice(0, 60); // Ensure under 60 chars
    const metaDescription = faker.lorem.sentence({ min: 8, max: 12 }).slice(0, 160); // Ensure under 160 chars

    blogPosts.push({
      title,
      slug: generateSlug(title),
      excerpt: faker.lorem.sentences(2),
      content: generateBlogContent(),
      category,
      author,
      readTimeMinutes: faker.number.int({ min: 3, max: 12 }),
      published: isPublished,
      featured: isFeatured,
      image: `https://picsum.photos/800/400?random=${i + 1}`,
      metaTitle,
      metaDescription,
      publishedAt: isPublished ? createdDate : null,
      createdAt: createdDate,
      updatedAt: createdDate
    });
  }

  const createdPosts = await Promise.all(
    blogPosts.map(async (post) => {
      // Find the category by name and get its ID
      const category = await prisma.blogCategory.findFirst({
        where: { name: post.category }
      });
      
      return prisma.blogPost.create({ 
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          readTimeMinutes: post.readTimeMinutes,
          featured: post.featured,
          image: post.image,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          categoryId: category?.id || null,
          status: post.published ? 'PUBLISHED' : 'DRAFT'
        }
      });
    })
  );
  console.log(`${createdPosts.length} blog posts created.`);

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