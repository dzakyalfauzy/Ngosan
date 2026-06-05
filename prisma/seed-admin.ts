import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@ngosan.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✅ Admin sudah ada: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      nama: "Super Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin berhasil dibuat!`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: admin123`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
