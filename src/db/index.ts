import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

prisma
	.$connect()
	.then(() => {
		console.log("Connected to database");
	})
	.catch((err: any) => {
		console.log(err);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

export default prisma;
