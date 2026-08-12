import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/*
 * The MariaDB driver adapter accepts either a connection string
 * (DATABASE_URL) or a config object built from the DB_* variables.
 * Prefer DATABASE_URL when set (standard for production hosts);
 * fall back to the DB_* variables for local development.
 */
function buildPoolConfig() {
  const connectionUrl = process.env.DATABASE_URL;

  if (connectionUrl && connectionUrl.trim() !== "") {
    return connectionUrl.trim();
  }

  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error(
      "DB_NAME is missing. Set DATABASE_URL or the DB_* environment variables."
    );
  }

  return {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: 5,
  };
}

const adapter = new PrismaMariaDb(buildPoolConfig());

export const prisma = new PrismaClient({
  adapter,
});

export default prisma;
