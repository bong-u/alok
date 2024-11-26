import { PrismaClient } from "@prisma/client";
import { beforeAll, afterAll } from "@jest/globals";
const prisma = new PrismaClient();

beforeAll(async () => {
	await prisma.$connect();
});

afterAll(async () => {
	await prisma.$disconnect();
});
