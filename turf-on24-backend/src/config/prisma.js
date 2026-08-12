import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME;

if (!dbName) {
  console.error("ERROR: DB_NAME is missing from .env");
  process.exit(1);
}

const adapter = new PrismaMariaDb({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({
  adapter,
});

export default prisma;