'use server';

//import { PrismaClient } from "@/lib/generated/prisma/client";
import { convertToPlainObject } from "../utils";
import { prisma } from "@/db/prisma";


// get latest products
export async function getLastestProducts() {
    //const prisma = new PrismaClient();

    const data = await prisma.product.findMany({
        take: 4,
        orderBy:  { createdAt: 'desc'}
    });

    return convertToPlainObject(data);
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: {slug : slug}
    })
}