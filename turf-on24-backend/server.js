import "dotenv/config";

import express from "express";
import cors from "cors";

import bookingRoutes from "./src/routes/bookingRoutes.js";
import { prisma } from "./src/config/prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| The frontend is deployed on Vercel (https://turf-on24.vercel.app) while the
| backend runs on its own domain, so cross-origin requests must be allowed.
|
| Origins can be overridden with the CORS_ORIGINS env var (comma separated).
| When unset, the defaults below (production + local development) are used.
|--------------------------------------------------------------------------
*/

const DEFAULT_CORS_ORIGINS = [
  "https://turf-on24.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const configuredCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins =
  configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : DEFAULT_CORS_ORIGINS;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`CORS blocked origin: ${origin}`);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TurfOn24 backend is running",
  });
});

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
| GET /api/health
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TurfOn24 backend is healthy",
    env: process.env.NODE_ENV || "development",
  });
});

/*
|--------------------------------------------------------------------------
| DATABASE TEST
|--------------------------------------------------------------------------
*/

app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "MySQL database connected successfully",
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("DATABASE CONNECTION FAILED");
    console.error("========================================");
    console.error(error);
    console.error("========================================");
    console.error("");

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| BOOKING ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/bookings", bookingRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:");
  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: String(error?.message || error),
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
|
| On Vercel the app is imported as a serverless function, so app.listen()
| must not run there (VERCEL=1). When running locally (node server.js)
| the server starts normally.
|--------------------------------------------------------------------------
*/

if (process.env.VERCEL !== "1") {
  const server = app.listen(PORT, () => {
    console.log("");
    console.log("========================================");
    console.log("       TURFON24 BACKEND STARTED");
    console.log("========================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Booking: http://localhost:${PORT}/api/bookings`);
    console.log(
      `Booking Test: http://localhost:${PORT}/api/bookings/test`
    );
    console.log(
      `Enquiries: http://localhost:${PORT}/api/bookings/enquiries`
    );
    console.log(
      `Database Test: http://localhost:${PORT}/api/test-db`
    );
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log("========================================");
    console.log("");
  });

  /*
  |--------------------------------------------------------------------------
  | SHUTDOWN
  |--------------------------------------------------------------------------
  */

  async function shutdown(signal) {
    console.log(`${signal} received. Closing server...`);

    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log("Database disconnected.");
      } catch (error) {
        console.error("Error disconnecting Prisma:", error);
      }

      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/*
|--------------------------------------------------------------------------
| EXPORT (used by Vercel serverless functions)
|--------------------------------------------------------------------------
*/

export default app;