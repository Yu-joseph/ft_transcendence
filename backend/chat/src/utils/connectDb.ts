import { prisma } from "../lib/prisma.js"

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("[🐘] DataBase connected successfully...");
    } catch (error) {
        console.error("[❌] DataBase connection failed:", error);
        throw error;
    }
}