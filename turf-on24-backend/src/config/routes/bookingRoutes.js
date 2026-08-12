import express from "express";
import { prisma } from "../config/prisma.js";

const router = express.Router();

// Create hourly booking
router.post("/hourly", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      preferredDate,
      preferredTime,
      players,
      hours,
      totalPrice,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !preferredDate ||
      !preferredTime ||
      !players ||
      !hours ||
      totalPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details.",
      });
    }

    const booking = await prisma.hourlyBooking.create({
      data: {
        fullName,
        phone,
        preferredDate: new Date(preferredDate),
        preferredTime,
        players: Number(players),
        hours: Number(hours),
        totalPrice: Number(totalPrice),
      },
    });

    res.status(201).json({
      success: true,
      message: "Hourly booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Hourly booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create hourly booking.",
    });
  }
});

// Create extended booking enquiry
router.post("/enquiry", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      startDate,
      endDate,
      startTime,
      endTime,
      players,
      message,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required enquiry details.",
      });
    }

    const enquiry = await prisma.bookingEnquiry.create({
      data: {
        fullName,
        phone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        players: players ? Number(players) : null,
        message: message || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Booking enquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit booking enquiry.",
    });
  }
});

export default router;