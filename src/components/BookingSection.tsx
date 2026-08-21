import {
  ArrowRight,
  BadgeCheck,
  Mail,
  Phone,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import { API_URL } from "@/lib/api";

/* =========================================================
   TIME SLOTS
========================================================= */

export const pitchTimeSlots = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`
);

export function formatBookingTime(value: string) {
  if (!value) return "Not selected";

  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minutePart} ${period}`;
}

/* =========================================================
   SLOT DATE KEY

   The backend returns preferredDate as "YYYY-MM-DD".
   Older responses may include an ISO timestamp, so
   normalize any full timestamp to a plain date string.
========================================================= */

export function toDateKey(value: string) {
  if (!value) return "";

  if (value.includes("T")) {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-CA");
    }

    return "";
  }

  return value;
}

/* =========================================================
   SLOT RANGE HELPERS

   Used to expand an extended booking (date range + time
   range) into the individual "date::time" slots it occupies.
========================================================= */

export function eachDateBetween(
  start: string,
  end: string
): string[] {
  const keys: string[] = [];

  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  if (
    Number.isNaN(current.getTime()) ||
    Number.isNaN(last.getTime())
  ) {
    return keys;
  }

  while (current.getTime() <= last.getTime()) {
    keys.push(current.toLocaleDateString("en-CA"));

    current.setDate(current.getDate() + 1);
  }

  return keys;
}

function eachTimeBetween(
  start: string,
  end: string
): string[] {
  const startIndex = pitchTimeSlots.indexOf(start);
  const endIndex = pitchTimeSlots.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return start ? [start] : [];
  }

  const times: string[] = [];

  for (
    let index = startIndex;
    index < endIndex;
    index += 1
  ) {
    const slot = pitchTimeSlots[index];

    if (slot) {
      times.push(slot);
    }
  }

  return times;
}

/* =========================================================
   BACKEND URL

   Resolved centrally in src/lib/api.ts:
   - VITE_API_URL (if set in .env / Vercel dashboard) is used.
   - localhost/127.0.0.1 -> http://localhost:5000
   - any other host       -> the production backend URL.
========================================================= */

/* =========================================================
   BOOKING HOOK
========================================================= */

export function useBooking() {
  /* -------------------------------------------------------
     BOOKING TYPE
  ------------------------------------------------------- */

  const [bookingType, setBookingType] = useState<
    "hourly" | "extended"
  >("hourly");

  /* -------------------------------------------------------
     HOURLY BOOKING
  ------------------------------------------------------- */

  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingPlayers, setBookingPlayers] = useState(0);
  const [bookingHours, setBookingHours] = useState(0);

  /* -------------------------------------------------------
     EXTENDED BOOKING
  ------------------------------------------------------- */

  const [extName, setExtName] = useState("");
  const [extPhone, setExtPhone] = useState("");
  const [extStartDate, setExtStartDate] = useState("");
  const [extEndDate, setExtEndDate] = useState("");
  const [extStartTime, setExtStartTime] = useState("09:00");
  const [extEndTime, setExtEndTime] = useState("18:00");
  const [extPlayers, setExtPlayers] = useState("");
  const [extMessage, setExtMessage] = useState("");

  /* -------------------------------------------------------
     SUBMISSION STATE
  ------------------------------------------------------- */

  const [animatedBookingTotal, setAnimatedBookingTotal] =
    useState(700);

  const [extSubmitted, setExtSubmitted] = useState(false);
  const [extError, setExtError] = useState("");

  const [hourlySubmitted, setHourlySubmitted] =
    useState(false);

  const [hourlyError, setHourlyError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------------------------------------------
     OTP + PAYMENT FLOW (HOURLY)

     bookingStage:
       "details" -> name + phone only
       "otp"     -> demo OTP verification (right after phone)
       "form"    -> date / time / players / hours
       "payment" -> scan-to-pay scanner
     Only after the payment step succeeds is the booking
     actually submitted and the success message shown.
  ------------------------------------------------------- */

  const [bookingStage, setBookingStage] = useState<
    "details" | "otp" | "form" | "payment"
  >("details");

  const [demoOtp, setDemoOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  /* -------------------------------------------------------
     BOOKED SLOTS

     Fetches existing hourly bookings from the backend so
     already-taken time slots are disabled in the picker.
  ------------------------------------------------------- */

  const [bookedSlots, setBookedSlots] = useState<
    Set<string>
  >(new Set());

  const refreshBookedSlots = useCallback(async () => {
    try {
      const [hourlyResponse, enquiriesResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/api/bookings/hourly`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          ),
          fetch(
            `${API_URL}/api/bookings/enquiries`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          ),
        ]);

      const next = new Set<string>();

      const extractList = (
        payload: unknown,
        keys: string[]
      ): unknown[] => {
        if (Array.isArray(payload)) {
          return payload;
        }

        if (
          !payload ||
          typeof payload !== "object"
        ) {
          return [];
        }

        const record = payload as Record<
          string,
          unknown
        >;

        for (const key of keys) {
          const value = record[key];

          if (Array.isArray(value)) {
            return value;
          }
        }

        return [];
      };

      if (hourlyResponse.ok) {
        const payload: unknown =
          await hourlyResponse.json();

        const bookings = extractList(payload, [
          "bookings",
          "data",
          "results",
        ]);

        for (const item of bookings) {
          if (
            !item ||
            typeof item !== "object"
          ) {
            continue;
          }

          const record = item as Record<
            string,
            unknown
          >;

          const bookingStatus =
            typeof record["status"] === "string"
              ? record["status"].toLowerCase()
              : "";

          if (
            bookingStatus === "cancelled" ||
            bookingStatus === "canceled"
          ) {
            continue;
          }

          const date =
            typeof record["preferredDate"] ===
            "string"
              ? toDateKey(record["preferredDate"])
              : "";

          const time =
            typeof record["preferredTime"] ===
            "string"
              ? record["preferredTime"]
              : "";

          if (date && time) {
            next.add(`${date}::${time}`);
          }
        }
      }

      if (enquiriesResponse.ok) {
        const payload: unknown =
          await enquiriesResponse.json();

        const enquiries = extractList(payload, [
          "enquiries",
          "bookings",
          "data",
          "results",
        ]);

        for (const item of enquiries) {
          if (
            !item ||
            typeof item !== "object"
          ) {
            continue;
          }

          const record = item as Record<
            string,
            unknown
          >;

          const bookingStatus =
            typeof record["status"] === "string"
              ? record["status"].toLowerCase()
              : "";

          if (
            bookingStatus === "cancelled" ||
            bookingStatus === "canceled"
          ) {
            continue;
          }

          const startDate =
            typeof record["startDate"] ===
            "string"
              ? toDateKey(record["startDate"])
              : "";

          const endDate =
            typeof record["endDate"] ===
            "string"
              ? toDateKey(record["endDate"])
              : "";

          const startTime =
            typeof record["startTime"] ===
            "string"
              ? record["startTime"]
              : "";

          const endTime =
            typeof record["endTime"] ===
            "string"
              ? record["endTime"]
              : "";

          if (
            !startDate ||
            !endDate ||
            !startTime ||
            !endTime
          ) {
            continue;
          }

          const dates = eachDateBetween(
            startDate,
            endDate
          );

          const times = eachTimeBetween(
            startTime,
            endTime
          );

          for (const date of dates) {
            for (const time of times) {
              next.add(`${date}::${time}`);
            }
          }
        }
      }

      setBookedSlots(next);
    } catch (error) {
      console.error(
        "[Booking] Booked slots refresh error:",
        error
      );
    }
  }, []);

  const isSlotBooked = useCallback(
    (date: string, time: string) => {
      if (!date || !time) return false;

      return bookedSlots.has(
        `${toDateKey(date)}::${time}`
      );
    },
    [bookedSlots]
  );

  useEffect(() => {
    void refreshBookedSlots();

    const interval = window.setInterval(
      () => {
        void refreshBookedSlots();
      },
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshBookedSlots]);

  useEffect(() => {
    if (!bookingDate) return;

    if (isSlotBooked(bookingDate, bookingTime)) {
      const available = pitchTimeSlots.find(
        (slot) =>
          !isSlotBooked(bookingDate, slot)
      );

      if (available) {
        setBookingTime(available);
      }
    }
  }, [
    bookedSlots,
    bookingDate,
    bookingTime,
    isSlotBooked,
  ]);

  useEffect(() => {
    if (!extStartDate) return;

    if (isSlotBooked(extStartDate, extStartTime)) {
      const available = pitchTimeSlots.find(
        (slot) =>
          !isSlotBooked(extStartDate, slot)
      );

      if (available) {
        setExtStartTime(available);
      }
    }
  }, [
    bookedSlots,
    extStartDate,
    extStartTime,
    isSlotBooked,
  ]);

  useEffect(() => {
    const anchorDate = extEndDate || extStartDate;

    if (!anchorDate) return;

    if (isSlotBooked(anchorDate, extEndTime)) {
      const startIndex = pitchTimeSlots.indexOf(
        extStartTime
      );

      const available = pitchTimeSlots
        .slice(startIndex + 1)
        .find(
          (slot) =>
            !isSlotBooked(anchorDate, slot)
        );

      if (available) {
        setExtEndTime(available);
      }
    }
  }, [
    bookedSlots,
    extStartDate,
    extEndDate,
    extStartTime,
    extEndTime,
    isSlotBooked,
  ]);

  const totalAnimationRef =
    useRef<number | null>(null);

  const animatedTotalRef =
    useRef<number>(700);

  /* -------------------------------------------------------
     TOTAL
  ------------------------------------------------------- */

  const safeHours = Math.max(
    1,
    Number(bookingHours) || 1
  );

  const bookingTotal =
    bookingType === "hourly"
      ? 700 * safeHours
      : 700 * 18;

  /* =======================================================
     TOTAL ANIMATION
  ======================================================= */

  useEffect(() => {
    if (totalAnimationRef.current !== null) {
      cancelAnimationFrame(
        totalAnimationRef.current
      );
    }

    const startValue = animatedTotalRef.current;
    const endValue = bookingTotal;
    const duration = 400;

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      const nextValue = Math.round(
        startValue +
          (endValue - startValue) * eased
      );

      animatedTotalRef.current = nextValue;
      setAnimatedBookingTotal(nextValue);

      if (progress < 1) {
        totalAnimationRef.current =
          requestAnimationFrame(step);
      } else {
        totalAnimationRef.current = null;
      }
    };

    totalAnimationRef.current =
      requestAnimationFrame(step);

    return () => {
      if (totalAnimationRef.current !== null) {
        cancelAnimationFrame(
          totalAnimationRef.current
        );
      }
    };
  }, [bookingTotal]);

  /* =======================================================
     BOOKING STEPS
  ======================================================= */

  const isVerified =
    hourlySubmitted ||
    bookingStage === "form" ||
    bookingStage === "payment";

  const bookingSteps = [
    {
      key: "verify",
      label: "Verify",
      done: isVerified,
      current: false,
    },
    {
      key: "date",
      label: "Date",
      done: Boolean(bookingDate),
      current: false,
    },
    {
      key: "time",
      label: "Time",
      done: Boolean(bookingTime),
      current: false,
    },
    {
      key: "players",
      label: "Players",
      done: bookingPlayers > 0,
      current: false,
    },
    {
      key: "hour",
      label: "Hour",
      done: bookingHours > 0,
      current: false,
    },
  ];

  let previousStepDone = true;

  bookingSteps.forEach((step) => {
    step.done =
      step.done && previousStepDone;

    previousStepDone = step.done;
  });

  const firstIncompleteIndex =
    bookingSteps.findIndex(
      (step) => !step.done
    );

  const bookingCurrentStep =
    firstIncompleteIndex === -1
      ? bookingSteps.length - 1
      : firstIncompleteIndex;

  bookingSteps.forEach((step, index) => {
    step.current =
      index === bookingCurrentStep;
  });

  /* =======================================================
     RESET EXTENDED
  ======================================================= */

  const resetExtendedEnquiry = () => {
    setExtName("");
    setExtPhone("");
    setExtStartDate("");
    setExtEndDate("");
    setExtStartTime("09:00");
    setExtEndTime("18:00");
    setExtPlayers("");
    setExtMessage("");
    setExtError("");
    setExtSubmitted(false);
  };

  /* =======================================================
     RESET HOURLY
  ======================================================= */

  const resetHourlyBooking = () => {
    setBookingName("");
    setBookingPhone("");
    setBookingDate("");
    setBookingTime("");
    setBookingPlayers(0);
    setBookingHours(0);
    setHourlyError("");
    setHourlySubmitted(false);
    setBookingStage("details");
    setDemoOtp("");
    setOtpInput("");
    setOtpError("");
  };

  /* =======================================================
     VALIDATE HOURLY FORM
  ======================================================= */

  const validateHourlyForm = () => {
    setHourlyError("");

    /* Validate name */

    if (!bookingName.trim()) {
      setHourlyError(
        "Please enter your name."
      );
      return false;
    }

    /* Validate phone */

    const phoneDigits =
      bookingPhone.replace(/[^0-9]/g, "");

    if (
      !bookingPhone.trim() ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      setHourlyError(
        "Please enter a valid phone number."
      );
      return false;
    }

    /* Validate date */

    if (!bookingDate) {
      setHourlyError(
        "Please select a date."
      );
      return false;
    }

    /* Validate time */

    if (!bookingTime) {
      setHourlyError(
        "Please select a time."
      );
      return false;
    }

    /* Validate players */

    if (
      !bookingPlayers ||
      Number(bookingPlayers) < 1
    ) {
      setHourlyError(
        "Please enter the number of players."
      );
      return false;
    }

    /* Validate hours */

    if (
      !bookingHours ||
      Number(bookingHours) < 1
    ) {
      setHourlyError(
        "Please enter the number of hours."
      );
      return false;
    }

    /* Validate slot availability */

    if (isSlotBooked(bookingDate, bookingTime)) {
      setHourlyError(
        "This time slot is already booked. Please choose another time."
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     VALIDATE DETAILS (NAME + PHONE ONLY)
  ======================================================= */

  const validateDetails = () => {
    setHourlyError("");

    if (!bookingName.trim()) {
      setHourlyError(
        "Please enter your name."
      );
      return false;
    }

    const phoneDigits =
      bookingPhone.replace(/[^0-9]/g, "");

    if (
      !bookingPhone.trim() ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      setHourlyError(
        "Please enter a valid phone number."
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     PROCEED TO OTP VERIFICATION (HOURLY)
  ======================================================= */

  const proceedToOtp = () => {
    if (!validateDetails()) {
      return;
    }

    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    setDemoOtp(otp);
    setOtpInput("");
    setOtpError("");
    setBookingStage("otp");
  };

  /* =======================================================
     VERIFY OTP (HOURLY)
  ======================================================= */

  const verifyOtp = () => {
    if (!otpInput.trim()) {
      setOtpError("Please enter the OTP sent to your phone.");
      return;
    }

    if (otpInput.trim() !== demoOtp) {
      setOtpError(
        "Incorrect OTP. Please try again."
      );
      return;
    }

    setOtpError("");
    setBookingStage("form");
  };

  /* =======================================================
     PROCEED TO PAYMENT (HOURLY)
  ======================================================= */

  const proceedToPayment = () => {
    if (!validateHourlyForm()) {
      return;
    }

    setBookingStage("payment");
  };

  /* =======================================================
     SUBMIT HOURLY BOOKING
  ======================================================= */

  const submitHourlyBooking = async () => {
    if (!validateHourlyForm()) {
      return;
    }

    setIsSubmitting(true);

    setHourlyError("");
    setHourlySubmitted(true);
    setBookingStage("details");
    setIsSubmitting(false);
  };

  /* =======================================================
     SUBMIT EXTENDED ENQUIRY
  ======================================================= */

  const submitExtendedEnquiry = async () => {
    setExtError("");

    /* Validate name */

    if (!extName.trim()) {
      setExtError(
        "Please enter your name."
      );
      return;
    }

    /* Validate phone */

    const phoneDigits =
      extPhone.replace(/[^0-9]/g, "");

    if (
      !extPhone.trim() ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      setExtError(
        "Please enter a valid phone number."
      );
      return;
    }

    /* Validate start date */

    if (!extStartDate) {
      setExtError(
        "Please select a preferred start date."
      );
      return;
    }

    /* Validate end date */

    if (!extEndDate) {
      setExtError(
        "Please select a preferred end date."
      );
      return;
    }

    /* Validate dates */

    if (extEndDate < extStartDate) {
      setExtError(
        "The end date cannot be before the start date."
      );
      return;
    }

    /* Validate same-day time */

    if (
      extStartDate === extEndDate &&
      extEndTime <= extStartTime
    ) {
      setExtError(
        "The end time must be after the start time on the same day."
      );
      return;
    }

    /* Validate that no slot in the range is already
       booked by an hourly or extended booking. */

    const conflictDates = eachDateBetween(
      extStartDate,
      extEndDate
    );

    const conflictTimes = eachTimeBetween(
      extStartTime,
      extEndTime
    );

    const conflictSlots: string[] = [];

    for (const date of conflictDates) {
      for (const time of conflictTimes) {
        if (isSlotBooked(date, time)) {
          conflictSlots.push(
            `${date} at ${time}`
          );
        }
      }
    }

    if (conflictSlots.length > 0) {
      setExtError(
        conflictSlots.length > 3
          ? `Some preferred slots are already booked (e.g. ${conflictSlots
              .slice(0, 3)
              .join(", ")}). Please adjust your preferred time.`
          : `The following preferred slots are already booked: ${conflictSlots.join(
              ", "
            )}. Please adjust your preferred time.`
      );
      return;
    }

    setIsSubmitting(true);

    setExtSubmitted(true);
    setIsSubmitting(false);
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    bookingType,
    setBookingType,

    bookingName,
    setBookingName,

    bookingPhone,
    setBookingPhone,

    bookingDate,
    setBookingDate,

    bookingTime,
    setBookingTime,

    bookingPlayers,
    setBookingPlayers,

    bookingHours,
    setBookingHours,

    animatedBookingTotal,

    selectedPitchTime: bookingTime,
    setSelectedPitchTime:
      setBookingTime,

    extName,
    setExtName,

    extPhone,
    setExtPhone,

    extStartDate,
    setExtStartDate,

    extEndDate,
    setExtEndDate,

    extStartTime,
    setExtStartTime,

    extEndTime,
    setExtEndTime,

    extPlayers,
    setExtPlayers,

    extMessage,
    setExtMessage,

    extSubmitted,
    extError,

    hourlySubmitted,
    hourlyError,

    isSubmitting,

    bookingSteps,

    bookedSlots,
    isSlotBooked,
    refreshBookedSlots,

    bookingStage,
    setBookingStage,
    demoOtp,
    otpInput,
    setOtpInput,
    otpError,

    proceedToOtp,
    proceedToPayment,
    verifyOtp,

    resetExtendedEnquiry,
    resetHourlyBooking,

    submitExtendedEnquiry,
    submitHourlyBooking,
  };
}

/* =========================================================
   PROPS
========================================================= */

interface BookingSectionProps {
  booking: ReturnType<typeof useBooking>;
  sectionRef?: Ref<HTMLElement>;
}

/* =========================================================
   BOOKING SECTION
========================================================= */

export function BookingSection({
  booking,
  sectionRef,
}: BookingSectionProps) {
  const {
    bookingType,
    setBookingType,

    bookingName,
    setBookingName,

    bookingPhone,
    setBookingPhone,

    bookingDate,
    setBookingDate,

    bookingTime,
    setBookingTime,

    bookingPlayers,
    setBookingPlayers,

    bookingHours,
    setBookingHours,

    animatedBookingTotal,

    extName,
    setExtName,

    extPhone,
    setExtPhone,

    extStartDate,
    setExtStartDate,

    extEndDate,
    setExtEndDate,

    extStartTime,
    setExtStartTime,

    extEndTime,
    setExtEndTime,

    extPlayers,
    setExtPlayers,

    extMessage,
    setExtMessage,

    extSubmitted,
    extError,

    hourlySubmitted,
    hourlyError,

    isSubmitting,

    bookingSteps,

    isSlotBooked,

    bookingStage,
    setBookingStage,
    demoOtp,
    otpInput,
    setOtpInput,
    otpError,

    proceedToOtp,
    proceedToPayment,
    verifyOtp,

    resetExtendedEnquiry,
    resetHourlyBooking,

    submitExtendedEnquiry,
    submitHourlyBooking,
  } = booking;

  const [bookingsEnabled, setBookingsEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/admin/settings/online_bookings_enabled`, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.setting) {
          setBookingsEnabled(data.setting.value !== "false");
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!bookingsEnabled) {
    return (
      <section
        id="booking"
        ref={sectionRef}
        className="mx-auto mb-16 max-w-7xl scroll-mt-24 rounded-3xl border border-turf/15 bg-[#030607]/85 px-6 py-16 shadow-[0_0_35px_-18px_rgba(15,168,87,0.35)] backdrop-blur-2xl md:mb-0 lg:px-10 xl:px-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
          Bookings
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Book a Slot
        </h2>

        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/5 p-10 text-center backdrop-blur-xl">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-300"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>

          <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
            Online bookings are currently unavailable.
          </h3>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            Please contact us directly to make a booking. We apologize for the
            inconvenience.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="mx-auto mb-16 max-w-7xl scroll-mt-24 rounded-3xl border border-turf/15 bg-black/40 px-6 py-16 shadow-[0_0_35px_-18px_rgba(60,235,120,0.45)] backdrop-blur-2xl md:mb-0 lg:px-10 xl:px-12"
    >
      {/* HEADER */}

      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-turf">
        Bookings
      </p>

      <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
        {bookingType === "hourly"
          ? "Book an hourly slot"
          : "Plan Your Extended Booking"}
      </h2>

      {bookingType === "extended" && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Need the turf for multiple hours, a
          full day, or multiple days? Send us
          your preferred schedule and our team
          will contact you to confirm availability
          and pricing.
        </p>
      )}

      {/* BOOKING TYPE */}

      <div className="mt-8 flex items-center">
        <ToggleGroup
          type="single"
          value={bookingType}
          onValueChange={(value) => {
            if (value) {
              setBookingType(
                value as
                  | "hourly"
                  | "extended"
              );
            }
          }}
          className="relative flex h-[52px] w-[208px] gap-0 overflow-hidden rounded-full border border-turf/20 bg-night p-1 shadow-[0_0_24px_rgba(60,235,120,0.10)]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-1 top-1 z-0 w-[calc(50%_-_4px)] rounded-full bg-turf shadow-[0_0_18px_rgba(96,240,120,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform:
                bookingType === "extended"
                  ? "translateX(100%)"
                  : "translateX(0%)",
            }}
          />
          <ToggleGroupItem
            value="hourly"
            className="relative z-10 flex h-full flex-1 items-center justify-center rounded-full bg-transparent px-6 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:bg-transparent hover:text-turf hover:shadow-[0_0_16px_-4px_rgba(96,240,120,0.22)] focus-visible:ring-turf/40 data-[state=on]:bg-transparent data-[state=on]:text-night"
          >
            Hourly
          </ToggleGroupItem>

          <ToggleGroupItem
            value="extended"
            className="relative z-10 flex h-full flex-1 items-center justify-center rounded-full bg-transparent px-6 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:bg-transparent hover:text-turf hover:shadow-[0_0_16px_-4px_rgba(96,240,120,0.22)] focus-visible:ring-turf/40 data-[state=on]:bg-transparent data-[state=on]:text-night"
          >
            Extended
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* HOURLY STEPS */}

      {bookingType === "hourly" && (
        <div className="booking-steps mt-8">
          {bookingSteps.map(
            (step, index) => (
              <div
                key={step.key}
                className={`booking-step ${
                  step.done
                    ? "booking-step-done"
                    : ""
                } ${
                  step.current
                    ? "booking-step-current"
                    : ""
                }`}
              >
                <span className="booking-step-dot">
                  {step.done
                    ? "✓"
                    : index + 1}
                </span>

                <span className="booking-step-label">
                  {step.label}
                </span>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* LEFT */}

        <div className="booking-field-group rounded-3xl border border-turf/15 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          {/* =================================================
              HOURLY
          ================================================= */}

          {bookingType === "hourly" && (
            <>
              {hourlySubmitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-turf/30 bg-turf/10 shadow-[0_0_40px_rgba(60,235,120,0.25)]">
                    <BadgeCheck className="h-10 w-10 text-turf" />
                  </span>

                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
                    Slot Booked
                    Successfully
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Thank you, your slot has been
                    booked. Our team will contact
                    you shortly.
                    <span className="block pt-2">
                      Booking for{" "}
                    <span className="font-semibold text-white">
                      {bookingName}
                    </span>
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetHourlyBooking
                    }
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-6 py-3 text-sm font-semibold text-turf transition hover:bg-turf/20"
                  >
                    Book Another Slot
                  </button>
                </div>
              ) : bookingStage === "otp" ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-turf/30 bg-turf/10 shadow-[0_0_40px_rgba(60,235,120,0.25)]">
                    <Smartphone className="h-10 w-10 text-turf" />
                  </span>

                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
                    Verify Your Phone
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    A one-time password has been
                    sent to{" "}
                    <span className="font-semibold text-white">
                      {bookingPhone.trim() ||
                        "your phone"}
                    </span>
                    . Enter it below to confirm
                    your booking.
                  </p>

                  <div className="mt-5 rounded-2xl border border-turf/25 bg-turf/5 px-5 py-3 text-sm">
                    <span className="text-foreground/60">
                      Demo OTP:{" "}
                    </span>
                    <span className="font-mono font-bold tracking-[0.3em] text-turf">
                      {demoOtp}
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(event) =>
                      setOtpInput(
                        event.target.value.replace(
                          /[^0-9]/g,
                          ""
                        )
                      )
                    }
                    placeholder="Enter 6-digit OTP"
                    className="mt-5 w-full max-w-xs rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-foreground outline-none focus:border-turf"
                  />

                  {otpError && (
                    <div className="mt-4 w-full max-w-xs rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                      {otpError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-turf px-6 py-4 text-sm font-semibold text-night shadow-[0_0_30px_rgba(60,235,120,0.4)] transition hover:scale-[1.02]"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify OTP
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBookingStage("details")
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-6 py-3 text-sm font-semibold text-turf transition hover:bg-turf/20"
                  >
                    Back to details
                  </button>
                </div>
              ) : bookingStage === "payment" ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-turf/30 bg-turf/10 shadow-[0_0_40px_rgba(60,235,120,0.25)]">
                    <QrCode className="h-10 w-10 text-turf" />
                  </span>

                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
                    Scan to Pay
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Scan the QR code with your
                    UPI app and pay{" "}
                    <span className="font-semibold text-turf">
                      ₹{animatedBookingTotal}
                    </span>{" "}
                    to lock in your slot.
                  </p>

                  <div className="relative mt-6 h-56 w-56 overflow-hidden rounded-2xl border border-turf/25 bg-white p-4 shadow-[0_0_40px_rgba(60,235,120,0.2)]">
                    <svg
                      viewBox="0 0 21 21"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      {[
                        [0, 0],
                        [3, 0],
                        [6, 0],
                        [0, 3],
                        [2, 3],
                        [4, 3],
                        [7, 3],
                        [1, 6],
                        [5, 6],
                        [9, 2],
                        [11, 6],
                        [14, 1],
                        [16, 2],
                        [13, 7],
                        [2, 9],
                        [4, 9],
                        [6, 8],
                        [9, 9],
                        [11, 9],
                        [13, 9],
                        [17, 9],
                        [0, 12],
                        [3, 11],
                        [6, 13],
                        [8, 12],
                        [10, 13],
                        [15, 13],
                        [18, 12],
                        [1, 15],
                        [4, 15],
                        [7, 16],
                        [9, 16],
                        [12, 15],
                        [14, 16],
                        [17, 15],
                        [19, 16],
                        [2, 18],
                        [5, 18],
                        [8, 19],
                        [11, 18],
                        [13, 19],
                        [16, 18],
                        [18, 19],
                      ].map(([x, y]) => (
                        <rect
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          width={1}
                          height={1}
                          fill="#0a0a0f"
                        />
                      ))}

                      <rect
                        x={0}
                        y={0}
                        width={7}
                        height={7}
                        fill="none"
                        stroke="#0a0a0f"
                        strokeWidth={1}
                      />
                      <rect
                        x={14}
                        y={0}
                        width={7}
                        height={7}
                        fill="none"
                        stroke="#0a0a0f"
                        strokeWidth={1}
                      />
                      <rect
                        x={0}
                        y={14}
                        width={7}
                        height={7}
                        fill="none"
                        stroke="#0a0a0f"
                        strokeWidth={1}
                      />
                    </svg>

                    <span className="qr-scan-line" />
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={
                      submitHourlyBooking
                    }
                    className="mt-7 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-turf px-6 py-4 text-sm font-semibold text-night shadow-[0_0_30px_rgba(60,235,120,0.4)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        I've Completed Payment
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {hourlyError && (
                    <div className="mt-4 w-full max-w-xs rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                      {hourlyError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setBookingStage("otp")
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-6 py-3 text-sm font-semibold text-turf transition hover:bg-turf/20"
                  >
                    Back
                  </button>
                </div>
              ) : bookingStage === "form" ? (
                <>
                  {/* DATE / TIME */}

                  <div className="booking-field-title mt-8 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      2
                    </span>

                    Pick a slot
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred Date *
                      </span>

                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(event) =>
                          setBookingDate(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred Time *
                      </span>

                      <select
                        value={bookingTime}
                        onChange={(event) =>
                          setBookingTime(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      >
                        {pitchTimeSlots.map(
                          (slot) => {
                            const booked =
                              bookingDate
                                ? isSlotBooked(
                                    bookingDate,
                                    slot
                                  )
                                : false;

                            return (
                              <option
                                key={slot}
                                value={slot}
                                disabled={booked}
                              >
                                {formatBookingTime(
                                  slot
                                )}
                                {booked
                                  ? " (Booked)"
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </label>
                  </div>

                  {/* PLAYERS / HOURS */}

                  <div className="booking-field-title mt-8 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      3
                    </span>

                    Group size & duration
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Number of Players
                      </span>

                      <input
                        type="number"
                        min={1}
                        value={bookingPlayers}
                        onChange={(event) =>
                          setBookingPlayers(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Number of Hours *
                      </span>

                      <input
                        type="number"
                        min={1}
                        value={bookingHours}
                        onChange={(event) =>
                          setBookingHours(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>
                  </div>

                  {/* CONFIRM */}

                  <div className="booking-field-title mt-8 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      4
                    </span>

                    Confirm & pay
                  </div>

                  {hourlyError && (
                    <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                      {hourlyError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={
                      proceedToPayment
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-turf px-6 py-4 text-sm font-semibold text-night shadow-[0_0_30px_rgba(60,235,120,0.4)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Proceed to Pay
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBookingStage("details")
                    }
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-6 py-3 text-sm font-semibold text-turf transition hover:bg-turf/20"
                  >
                    Back to details
                  </button>
                </>
              ) : (
                <>
                  {/* DETAILS (NAME + PHONE ONLY) */}

                  <div className="booking-field-title flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      1
                    </span>

                    Your details
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Your Name *
                      </span>

                      <input
                        type="text"
                        value={bookingName}
                        onChange={(event) =>
                          setBookingName(
                            event.target.value
                          )
                        }
                        placeholder="Enter your name"
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Phone Number *
                      </span>

                      <input
                        type="tel"
                        value={bookingPhone}
                        onChange={(event) =>
                          setBookingPhone(
                            event.target.value
                          )
                        }
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>
                  </div>

                  {hourlyError && (
                    <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                      {hourlyError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={proceedToOtp}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-turf px-6 py-4 text-sm font-semibold text-night shadow-[0_0_30px_rgba(60,235,120,0.4)] transition hover:scale-[1.02]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          )}

          {/* =================================================
              EXTENDED
          ================================================= */}

          {bookingType === "extended" && (
            <>
              {extSubmitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-turf/30 bg-turf/10 shadow-[0_0_40px_rgba(60,235,120,0.25)]">
                    <BadgeCheck className="h-10 w-10 text-turf" />
                  </span>

                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
                    Enquiry Sent
                    Successfully
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Thank you, our team will
                    contact you shortly about
                    your booking enquiry.
                    <span className="block pt-2">
                      Enquiry for{" "}
                    <span className="font-semibold text-white">
                      {extName.trim()}
                    </span>
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetExtendedEnquiry
                    }
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-6 py-3 text-sm font-semibold text-turf transition hover:bg-turf/20"
                  >
                    Back to Booking
                  </button>
                </div>
              ) : (
                <>
                  {/* DETAILS */}

                  <div className="booking-field-title flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      1
                    </span>

                    Your details
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Full Name *
                      </span>

                      <input
                        type="text"
                        value={extName}
                        onChange={(event) =>
                          setExtName(
                            event.target.value
                          )
                        }
                        placeholder="Enter your name"
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Phone Number *
                      </span>

                      <input
                        type="tel"
                        value={extPhone}
                        onChange={(event) =>
                          setExtPhone(
                            event.target.value
                          )
                        }
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>
                  </div>

                  {/* DATES */}

                  <div className="booking-field-title mt-8 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      2
                    </span>

                    Preferred schedule
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred Start Date *
                      </span>

                      <input
                        type="date"
                        value={extStartDate}
                        onChange={(event) =>
                          setExtStartDate(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred End Date *
                      </span>

                      <input
                        type="date"
                        value={extEndDate}
                        onChange={(event) =>
                          setExtEndDate(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred Start Time *
                      </span>

                      <select
                        value={extStartTime}
                        onChange={(event) =>
                          setExtStartTime(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      >
                        {pitchTimeSlots.map(
                          (slot) => {
                            const booked =
                              extStartDate
                                ? isSlotBooked(
                                    extStartDate,
                                    slot
                                  )
                                : false;

                            return (
                              <option
                                key={slot}
                                value={slot}
                                disabled={booked}
                              >
                                {formatBookingTime(
                                  slot
                                )}
                                {booked
                                  ? " (Booked)"
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Preferred End Time *
                      </span>

                      <select
                        value={extEndTime}
                        onChange={(event) =>
                          setExtEndTime(
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      >
                        {pitchTimeSlots.map(
                          (slot) => {
                            const anchorDate =
                              extEndDate ||
                              extStartDate;

                            const booked =
                              anchorDate
                                ? isSlotBooked(
                                    anchorDate,
                                    slot
                                  )
                                : false;

                            return (
                              <option
                                key={slot}
                                value={slot}
                                disabled={booked}
                              >
                                {formatBookingTime(
                                  slot
                                )}
                                {booked
                                  ? " (Booked)"
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </label>
                  </div>

                  {/* ADDITIONAL DETAILS */}

                  <div className="booking-field-title mt-8 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-turf/10 text-[0.7rem] font-bold text-turf">
                      3
                    </span>

                    Additional details
                  </div>

                  <div className="mt-4">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Number of Players
                      </span>

                      <input
                        type="number"
                        min={1}
                        value={extPlayers}
                        onChange={(event) =>
                          setExtPlayers(
                            event.target.value
                          )
                        }
                        placeholder="Enter number of players"
                        className="w-full rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="space-y-2 text-sm text-foreground/80">
                      <span>
                        Message / Requirements
                      </span>

                      <textarea
                        rows={4}
                        value={extMessage}
                        onChange={(event) =>
                          setExtMessage(
                            event.target.value
                          )
                        }
                        placeholder="Tell us about your requirements, event, number of days, preferred timing, etc."
                        className="w-full resize-none rounded-2xl border border-turf/20 bg-night/80 px-4 py-3 text-sm text-foreground outline-none focus:border-turf"
                      />
                    </label>
                  </div>

                  {extError && (
                    <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                      {extError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={
                      submitExtendedEnquiry
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-turf px-6 py-4 text-sm font-semibold text-night shadow-[0_0_30px_rgba(60,235,120,0.4)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Enquiry...
                      </>
                    ) : (
                      <>
                        Send Booking Enquiry
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        {bookingType === "hourly" ? (
          <div className="booking-summary relative rounded-3xl border border-turf/15 bg-black/35 p-6 shadow-[0_0_45px_-18px_rgba(60,235,120,0.4)] backdrop-blur-xl sm:p-7">
            <div className="absolute inset-x-0 top-0 h-40 rounded-t-3xl bg-[radial-gradient(circle_at_top,rgba(96,240,120,0.14),transparent_70%)] opacity-80" />

            <div className="relative z-10">
              <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-turf">
                <span className="h-2 w-2 rounded-full bg-turf" />
                Booking summary
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Type
                  </span>

                  <span className="font-semibold text-white">
                    Hourly
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Date
                  </span>

                  <span className="font-semibold text-white">
                    {bookingDate ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Time
                  </span>

                  <span className="font-semibold text-white">
                    {formatBookingTime(
                      bookingTime
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Players
                  </span>

                  <span className="font-semibold text-white">
                    {bookingPlayers > 0
                      ? bookingPlayers
                      : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Duration
                  </span>

                  <span className="font-semibold text-white">
                    {bookingHours > 0
                      ? `${bookingHours} hour${bookingHours === 1 ? "" : "s"}`
                      : "Not selected"}
                  </span>
                </div>
              </div>

              {bookingHours >= 1 && (
                <div className="mt-6 rounded-2xl border border-turf/20 bg-night/60 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-turf">
                    Estimated total
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-white">
                    ₹{animatedBookingTotal}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    for {bookingHours} hour
                    {bookingHours === 1
                      ? ""
                      : "s"}{" "}
                    at ₹700/hour
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3 text-sm text-foreground/85">
                <p>
                  <span className="text-turf">
                    ✓
                  </span>{" "}
                  Instant confirmation
                </p>

                <p>
                  <span className="text-turf">
                    ✓
                  </span>{" "}
                  Floodlights included
                </p>

                <p>
                  <span className="text-turf">
                    ✓
                  </span>{" "}
                  Full turf access
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="booking-summary relative rounded-3xl border border-turf/15 bg-black/35 p-6 shadow-[0_0_45px_-18px_rgba(60,235,120,0.4)] backdrop-blur-xl sm:p-7">
            <div className="relative z-10">
              <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-turf">
                <span className="h-2 w-2 rounded-full bg-turf" />
                Prefer to talk directly?
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Contact our team for extended
                bookings and event enquiries.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
                    <Phone className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Phone
                    </p>

                    <p className="font-semibold text-white">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
                    <Mail className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Email
                    </p>

                    <p className="font-semibold text-white">
                      play@turfon24.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-turf/20 bg-night/60 p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  For full-day and multi-day
                  bookings, our team will
                  confirm availability and
                  share a custom quote based
                  on your dates and
                  requirements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}