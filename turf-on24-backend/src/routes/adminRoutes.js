import express from "express";
import { prisma } from "../config/prisma.js";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PASSWORD HELPERS
|--------------------------------------------------------------------------
|
| Uses Node.js built-in crypto module with scrypt for secure password
| hashing. No external dependencies required. Passwords are stored as
| "salt:hash" where salt is 32 hex chars and hash is 64 hex chars.
|--------------------------------------------------------------------------
*/

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;

  const [salt, hash] = stored.split(":");
  const hashToVerify = scryptSync(password, salt, 64).toString("hex");

  try {
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(hashToVerify, "hex")
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| ENSURE DEFAULT ADMIN
|--------------------------------------------------------------------------
|
| Auto-creates a default admin account (demo123 / demo123) if no admin
| exists in the database. This runs on the first login attempt.
|--------------------------------------------------------------------------
*/

const DEFAULT_USERNAME = "demo123";
const DEFAULT_PASSWORD = "demo123";

async function ensureDefaultAdmin() {
  try {
    const count = await prisma.admin.count();

    if (count === 0) {
      await prisma.admin.create({
        data: {
          name: "Admin",
          email: DEFAULT_USERNAME,
          password: hashPassword(DEFAULT_PASSWORD),
        },
      });

      console.log("[Admin] Default admin account created (demo123 / demo123)");
    }
  } catch (error) {
    console.error("[Admin] Failed to ensure default admin:", error.message);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/admin/login
|--------------------------------------------------------------------------
|
| Verifies admin credentials against the database.
| If no admin exists, auto-creates the default admin first.
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: String(username).trim() },
          { name: String(username).trim() },
        ],
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const valid = verifyPassword(String(password), admin.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/login ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/admin/change-credentials
|--------------------------------------------------------------------------
|
| Changes the admin username and/or password.
| Requires the current password for verification.
|--------------------------------------------------------------------------
*/

router.post("/change-credentials", async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Provide a new username or new password",
      });
    }

    const admin = await prisma.admin.findFirst();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    const valid = verifyPassword(String(currentPassword), admin.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const updateData = {};

    if (newUsername && String(newUsername).trim() !== "") {
      const trimmed = String(newUsername).trim();

      if (trimmed.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters",
        });
      }

      const existing = await prisma.admin.findFirst({
        where: {
          email: trimmed,
          id: { not: admin.id },
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }

      updateData.email = trimmed;
      updateData.name = trimmed;
    }

    if (newPassword && String(newPassword).trim() !== "") {
      const pwd = String(newPassword).trim();

      if (pwd.length < 4) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 4 characters",
        });
      }

      updateData.password = hashPassword(pwd);
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
    });

    console.log("[Admin] Credentials updated for admin id:", admin.id);

    return res.status(200).json({
      success: true,
      message: "Credentials updated successfully",
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/change-credentials ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update credentials",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/admin/customers
|--------------------------------------------------------------------------
|
| Aggregates unique customers from all booking records.
| Returns customer name, phone, email, booking count, and earliest
| booking date (registration date).
|--------------------------------------------------------------------------
*/

function isHourlyBooking(enquiry) {
  if (!enquiry) return false;

  const sameDate =
    enquiry.startDate instanceof Date &&
    enquiry.endDate instanceof Date &&
    enquiry.startDate.getTime() === enquiry.endDate.getTime();

  const sameTime = enquiry.startTime === enquiry.endTime;

  const hourlyMessage =
    typeof enquiry.message === "string" &&
    enquiry.message.startsWith("Hourly booking -");

  return hourlyMessage || (sameDate && sameTime);
}

router.get("/customers", async (req, res) => {
  try {
    const all = await prisma.bookingEnquiry.findMany({
      orderBy: { createdAt: "asc" },
    });

    const customerMap = new Map();

    for (const booking of all) {
      const key = booking.phone || `unknown-${booking.id}`;
      const existing = customerMap.get(key);

      const bookingDate =
        booking.createdAt instanceof Date
          ? booking.createdAt
          : new Date(booking.createdAt);

      if (existing) {
        existing.bookings += 1;

        if (
          bookingDate instanceof Date &&
          !Number.isNaN(bookingDate.getTime()) &&
          bookingDate < existing.registrationDate
        ) {
          existing.registrationDate = bookingDate;
        }
      } else {
        customerMap.set(key, {
          name: booking.fullName || "Unknown",
          phone: booking.phone || "",
          email: "",
          bookings: 1,
          registrationDate:
            bookingDate instanceof Date && !Number.isNaN(bookingDate.getTime())
              ? bookingDate
              : new Date(),
        });
      }
    }

    const customers = Array.from(customerMap.values()).map((c) => ({
      ...c,
      registrationDate: c.registrationDate.toISOString(),
    }));

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("GET /api/admin/customers ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customers",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/admin/settings
|--------------------------------------------------------------------------
|
| Returns all site settings as a key-value map.
|--------------------------------------------------------------------------
*/

router.get("/settings", async (req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany();

    const map = {};

    for (const setting of settings) {
      map[setting.key] = setting.value;
    }

    return res.status(200).json({
      success: true,
      settings: map,
    });
  } catch (error) {
    console.error("GET /api/admin/settings ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load settings",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/admin/settings/:key
|--------------------------------------------------------------------------
|
| Returns a single setting by key.
|--------------------------------------------------------------------------
*/

router.get("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    return res.status(200).json({
      success: true,
      setting: setting
        ? { key: setting.key, value: setting.value }
        : null,
    });
  } catch (error) {
    console.error("GET /api/admin/settings/:key ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load setting",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| PUT /api/admin/settings
|--------------------------------------------------------------------------
|
| Creates or updates a site setting.
| Body: { key: string, value: string }
|--------------------------------------------------------------------------
*/

router.put("/settings", async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || typeof key !== "string" || key.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Setting key is required",
      });
    }

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Setting value is required",
      });
    }

    const trimmedKey = key.trim();
    const stringValue = String(value);

    const setting = await prisma.siteSetting.upsert({
      where: { key: trimmedKey },
      update: { value: stringValue },
      create: { key: trimmedKey, value: stringValue },
    });

    console.log("[Admin] Setting updated:", trimmedKey, "=", stringValue);

    return res.status(200).json({
      success: true,
      message: "Setting updated",
      setting: { key: setting.key, value: setting.value },
    });
  } catch (error) {
    console.error("PUT /api/admin/settings ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update setting",
      error: String(error?.message || error),
    });
  }
});

export default router;
