import express from "express";
import { prisma } from "../config/prisma.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function sameDay(a, b) {
  return (
    a instanceof Date &&
    b instanceof Date &&
    a.getTime() === b.getTime()
  );
}

function isHourlyBooking(enquiry) {
  if (!enquiry) return false;

  const sameDate = sameDay(enquiry.startDate, enquiry.endDate);
  const sameTime =
    enquiry.startTime === enquiry.endTime;

  const hourlyMessage =
    typeof enquiry.message === "string" &&
    enquiry.message.startsWith("Hourly booking -");

  return hourlyMessage || (sameDate && sameTime);
}

function isCancelledBooking(enquiry) {
  if (!enquiry) return false;

  const status =
    typeof enquiry.status === "string"
      ? enquiry.status.toLowerCase()
      : "";

  return status === "cancelled" || status === "canceled";
}

function parseHourlyHours(message) {
  if (typeof message === "string") {
    const match = message.match(
      /Hourly booking - (\d+) hour/
    );

    if (match) return Number(match[1]);
  }

  return 1;
}

function toDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
|--------------------------------------------------------------------------
| SLOT CONFLICT HELPERS
|--------------------------------------------------------------------------
|
| Every booking reserves one or more (date, time) slots:
|
|   - Hourly  booking: a single time slot on a single date.
|   - Extended booking: every time slot from startTime up to
|     (but not including) endTime, across every date from
|     startDate through endDate.
|
| The server re-checks availability inside a mutex right before
| creating a booking, so the first request to claim a slot
| reserves it ("first come, first served") and later requests
| for the same slot are rejected with HTTP 409.
|--------------------------------------------------------------------------
*/

let bookingLock = Promise.resolve();

function withBookingLock(task) {
  const run = bookingLock.then(() => task());
  bookingLock = run.catch(() => {});
  return run;
}

function timeRangesConflict(aStart, aEnd, aHourly, bStart, bEnd, bHourly) {
  if (aHourly && bHourly) {
    return aStart === bStart;
  }

  if (aHourly && !bHourly) {
    return aStart >= bStart && aStart < bEnd;
  }

  if (!aHourly && bHourly) {
    return bStart >= aStart && bStart < aEnd;
  }

  return aStart < bEnd && bStart < aEnd;
}

function bookingsConflict(candidate, existing) {
  const dateOverlap =
    candidate.startDate <= existing.endDate &&
    existing.startDate <= candidate.endDate;

  if (!dateOverlap) {
    return false;
  }

  return timeRangesConflict(
    candidate.startTime,
    candidate.endTime,
    candidate.hourly === true,
    existing.startTime,
    existing.endTime,
    isHourlyBooking(existing)
  );
}

const SLOT_ALREADY_BOOKED_MESSAGE =
  "This slot is already booked. Please choose another time or date.";

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
| GET /api/bookings/test
|--------------------------------------------------------------------------
*/

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Booking routes are working",
  });
});

/*
|--------------------------------------------------------------------------
| DATABASE TEST FROM BOOKING ROUTES
|--------------------------------------------------------------------------
*/

router.get("/db-test", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Booking database connection working",
    });
  } catch (error) {
    console.error("BOOKING DATABASE ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Booking database connection failed",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL EXTENDED BOOKING ENQUIRIES
|--------------------------------------------------------------------------
| GET /api/bookings/enquiries
|--------------------------------------------------------------------------
*/

router.get("/enquiries", async (req, res) => {
  try {
    const all = await prisma.bookingEnquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const enquiries = all.filter(
      (enquiry) => !isHourlyBooking(enquiry)
    );

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("GET /api/bookings/enquiries ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load booking enquiries",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL HOURLY BOOKINGS
|--------------------------------------------------------------------------
| GET /api/bookings/hourly
|--------------------------------------------------------------------------
*/

router.get("/hourly", async (req, res) => {
  try {
    const all = await prisma.bookingEnquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const bookings = all
      .filter((enquiry) => isHourlyBooking(enquiry))
      .map((enquiry) => {
        const hours = parseHourlyHours(enquiry.message);

        return {
          id: enquiry.id,
          fullName: enquiry.fullName,
          phone: enquiry.phone,
          preferredDate: toDateString(enquiry.startDate),
          preferredTime: enquiry.startTime,
          players: enquiry.players,
          hours,
          totalPrice: hours * 700,
          status: enquiry.status,
          message: enquiry.message,
          createdAt: enquiry.createdAt,
          updatedAt: enquiry.updatedAt,
        };
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("GET /api/bookings/hourly ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load hourly bookings",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE HOURLY BOOKING
|--------------------------------------------------------------------------
| POST /api/bookings
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    console.log("");
    console.log("========================================");
    console.log("NEW HOURLY BOOKING");
    console.log("========================================");
    console.log(req.body);

    const {
      fullName,
      name,
      phone,
      bookingDate,
      date,
      bookingTime,
      time,
      players,
      numberOfPlayers,
      bookingHours,
      hours,
      message,
    } = req.body;

    const finalName = fullName || name;
    const finalDate = bookingDate || date;
    const finalTime = bookingTime || time;

    const finalPlayers =
      players !== undefined
        ? players
        : numberOfPlayers;

    const finalHours =
      bookingHours !== undefined
        ? bookingHours
        : hours;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!finalName || !String(finalName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!finalDate) {
      return res.status(400).json({
        success: false,
        message: "Booking date is required",
      });
    }

    if (!finalTime) {
      return res.status(400).json({
        success: false,
        message: "Booking time is required",
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const parsedDate = new Date(`${finalDate}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PLAYERS
    |--------------------------------------------------------------------------
    */

    let playerCount = Number(finalPlayers || 0);

    if (!Number.isFinite(playerCount) || playerCount < 0) {
      playerCount = 0;
    }

    /*
    |--------------------------------------------------------------------------
    | HOURS
    |--------------------------------------------------------------------------
    */

    let hourCount = Number(finalHours || 1);

    if (!Number.isFinite(hourCount) || hourCount < 1) {
      hourCount = 1;
    }

    /*
    |--------------------------------------------------------------------------
    | END TIME
    |--------------------------------------------------------------------------
    |
    | The BookingEnquiry model requires endTime.
    | For hourly bookings we store the selected time here.
    |
    */

    const result = await withBookingLock(async () => {
      const existing = await prisma.bookingEnquiry.findMany();

      const conflict = existing.find(
        (item) =>
          !isCancelledBooking(item) &&
          bookingsConflict(
            {
              hourly: true,
              startDate: parsedDate,
              endDate: parsedDate,
              startTime: String(finalTime),
              endTime: String(finalTime),
            },
            item
          )
      );

      if (conflict) {
        return { conflict: true };
      }

      const created = await prisma.bookingEnquiry.create({
        data: {
          fullName: String(finalName).trim(),

          phone: String(phone).trim(),

          startDate: parsedDate,

          endDate: parsedDate,

          startTime: String(finalTime),

          endTime: String(finalTime),

          players: playerCount,

          message:
            message !== undefined && message !== null
              ? String(message).trim()
              : `Hourly booking - ${hourCount} hour(s)`,

          status: "pending",
        },
      });

      return { conflict: false, enquiry: created };
    });

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: SLOT_ALREADY_BOOKED_MESSAGE,
      });
    }

    const enquiry = result.enquiry;

    console.log("HOURLY BOOKING SAVED:");
    console.log(enquiry);

    return res.status(201).json({
      success: true,
      message: "Hourly booking submitted successfully",
      booking: enquiry,
      enquiry,
    });
  } catch (error) {
    console.error("POST /api/bookings ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save hourly booking",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE EXTENDED BOOKING ENQUIRY
|--------------------------------------------------------------------------
| POST /api/bookings/enquiries
|--------------------------------------------------------------------------
*/

router.post("/enquiries", async (req, res) => {
  try {
    console.log("");
    console.log("========================================");
    console.log("NEW EXTENDED BOOKING ENQUIRY");
    console.log("========================================");
    console.log(req.body);

    const {
      fullName,
      name,
      phone,
      startDate,
      endDate,
      startTime,
      endTime,
      players,
      numberOfPlayers,
      message,
    } = req.body;

    const finalName = fullName || name;

    const finalPlayers =
      players !== undefined
        ? players
        : numberOfPlayers;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!finalName || !String(finalName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required",
      });
    }

    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: "Start time is required",
      });
    }

    if (!endTime) {
      return res.status(400).json({
        success: false,
        message: "End time is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PHONE
    |--------------------------------------------------------------------------
    */

    const cleanPhone = String(phone).replace(/\D/g, "");

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const parsedStartDate =
      new Date(`${startDate}T00:00:00Z`);

    const parsedEndDate =
      new Date(`${endDate}T00:00:00Z`);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TIME
    |--------------------------------------------------------------------------
    */

    if (
      String(startDate) === String(endDate) &&
      String(endTime) <= String(startTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PLAYERS
    |--------------------------------------------------------------------------
    */

    let playerCount = 0;

    if (
      finalPlayers !== undefined &&
      finalPlayers !== null &&
      String(finalPlayers).trim() !== ""
    ) {
      playerCount = Number(finalPlayers);

      if (!Number.isFinite(playerCount) || playerCount < 0) {
        playerCount = 0;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const result = await withBookingLock(async () => {
      const existing = await prisma.bookingEnquiry.findMany();

      const conflict = existing.find(
        (item) =>
          !isCancelledBooking(item) &&
          bookingsConflict(
            {
              hourly: false,
              startDate: parsedStartDate,
              endDate: parsedEndDate,
              startTime: String(startTime),
              endTime: String(endTime),
            },
            item
          )
      );

      if (conflict) {
        return { conflict: true };
      }

      const created = await prisma.bookingEnquiry.create({
        data: {
          fullName: String(finalName).trim(),

          phone: String(phone).trim(),

          startDate: parsedStartDate,

          endDate: parsedEndDate,

          startTime: String(startTime),

          endTime: String(endTime),

          players: playerCount,

          message:
            message !== undefined && message !== null
              ? String(message).trim()
              : "",

          status: "pending",
        },
      });

      return { conflict: false, enquiry: created };
    });

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: SLOT_ALREADY_BOOKED_MESSAGE,
      });
    }

    const enquiry = result.enquiry;

    console.log("");
    console.log("========================================");
    console.log("EXTENDED BOOKING SAVED SUCCESSFULLY");
    console.log("========================================");
    console.log(enquiry);
    console.log("");

    return res.status(201).json({
      success: true,
      message: "Booking enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("POST /api/bookings/enquiries ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save booking enquiry",
      error: String(error?.message || error),
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS (ADMIN APPROVAL)
|--------------------------------------------------------------------------
| PATCH /api/bookings/:id
| Body: { status: "pending" | "confirmed" | "completed" | "cancelled" }
|
| Approving a booking ("confirmed") is what actually books the slot.
| Rejecting it ("cancelled") frees the slot for other customers.
|--------------------------------------------------------------------------
*/

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "canceled",
];

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const normalizedStatus = status.trim().toLowerCase();

    if (!BOOKING_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${BOOKING_STATUSES.join(", ")}`,
      });
    }

    const existing = await prisma.bookingEnquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const updated = await prisma.bookingEnquiry.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    console.log("BOOKING STATUS UPDATED:");
    console.log({
      id,
      from: existing.status,
      to: normalizedStatus,
    });

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${normalizedStatus}`,
      enquiry: updated,
    });
  } catch (error) {
    console.error("PATCH /api/bookings/:id ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: String(error?.message || error),
    });
  }
});

export default router;