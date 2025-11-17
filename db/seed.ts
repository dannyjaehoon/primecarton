import "dotenv/config";  
import { PrismaClient } from "@/lib/generated/prisma/client"; 
import sampleData from "./sample-data";


async function main() {
    const prisma = new PrismaClient();
    await prisma.product.deleteMany(); // delete all rows

    await prisma.product.createMany({data : sampleData.products});
    console.log("seed successfully");

}
main();

// npx tsx ./db/seed