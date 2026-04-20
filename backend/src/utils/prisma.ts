import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default prisma;
