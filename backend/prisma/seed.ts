import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_USER_EMAIL = "demo@example.com";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
    },
  });

  console.log(`Demo user seeded with email: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
