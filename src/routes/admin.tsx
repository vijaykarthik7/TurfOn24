import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sun,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { API_URL, apiUrl } from "@/lib/api";
import turfLoginImage from "@/assets/login-stadium-green.jpg";
import turfBlackImage from "@/assets/turf black.jpg";
import logoImg from "@/assets/Logo.png";
import taglineImg from "@/assets/Tagline.png";
import { ShaderBackground } from "@/components/ui/waves-header-green";

const ADMIN_USERNAME = "demo123";
const ADMIN_PASSWORD = "demo123";
const AUTH_STORAGE_KEY = "turfon24_admin_auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TurfOn24" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type ViewKey =
  | "dashboard"
  | "bookings"
  | "customers"
  | "settings";

type Tone = "green" | "amber" | "sky" | "rose" | "zinc";

type HourlyBooking = {
  id: number;
  fullName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  players: number;
  hours: number;
  totalPrice: number;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type ExtendedBooking = {
  id: number;
  fullName: string;
  phone: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  players: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ApiObject = Record<string, unknown>;

type ApiResponse = {
  success?: boolean;
  message?: string;
  bookings?: unknown;
  enquiries?: unknown;
  data?: unknown;
  results?: unknown;
};

const navItems: Array<{
  id: ViewKey;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

/*
 * TEMPORARY DEMO MODE
 * When true the Admin Dashboard runs entirely on mock data so the UI can be
 * presented without the backend running. Set back to false to restore the
 * real API behavior (live fetch + error state).
 */
const DEMO_MODE = true;

type DemoStats = {
  hourly: number;
  extended: number;
  revenue: number;
  customers: number;
};

const DEMO_STATS: DemoStats = {
  hourly: 24,
  extended: 12,
  revenue: 18450,
  customers: 31,
};

const DEMO_HOURLY_BOOKINGS: HourlyBooking[] = [
  {
    id: 1,
    fullName: "Arjun Mehta",
    phone: "+91 98200 12345",
    preferredDate: "2026-08-13",
    preferredTime: "19:00",
    players: 14,
    hours: 2,
    totalPrice: 1400,
    status: "confirmed",
    message: "",
    createdAt: "2026-08-13T10:15:00.000Z",
    updatedAt: "2026-08-13T10:15:00.000Z",
  },
  {
    id: 2,
    fullName: "Priya Nair",
    phone: "+91 98100 23456",
    preferredDate: "2026-08-13",
    preferredTime: "20:00",
    players: 10,
    hours: 1,
    totalPrice: 700,
    status: "pending",
    message: "",
    createdAt: "2026-08-13T09:40:00.000Z",
    updatedAt: "2026-08-13T09:40:00.000Z",
  },
  {
    id: 3,
    fullName: "Rohit Das",
    phone: "+91 99000 34567",
    preferredDate: "2026-08-12",
    preferredTime: "21:00",
    players: 12,
    hours: 1,
    totalPrice: 700,
    status: "confirmed",
    message: "",
    createdAt: "2026-08-12T18:05:00.000Z",
    updatedAt: "2026-08-12T18:05:00.000Z",
  },
  {
    id: 4,
    fullName: "Sneha Kulkarni",
    phone: "+91 97600 45678",
    preferredDate: "2026-08-12",
    preferredTime: "18:00",
    players: 14,
    hours: 2,
    totalPrice: 1400,
    status: "completed",
    message: "",
    createdAt: "2026-08-12T08:30:00.000Z",
    updatedAt: "2026-08-13T08:00:00.000Z",
  },
  {
    id: 5,
    fullName: "Vikram Singh",
    phone: "+91 98765 56789",
    preferredDate: "2026-08-11",
    preferredTime: "22:00",
    players: 8,
    hours: 1,
    totalPrice: 700,
    status: "pending",
    message: "",
    createdAt: "2026-08-11T16:45:00.000Z",
    updatedAt: "2026-08-11T16:45:00.000Z",
  },
  {
    id: 6,
    fullName: "Ananya Iyer",
    phone: "+91 95400 67890",
    preferredDate: "2026-08-11",
    preferredTime: "19:30",
    players: 11,
    hours: 1,
    totalPrice: 700,
    status: "confirmed",
    message: "",
    createdAt: "2026-08-11T12:20:00.000Z",
    updatedAt: "2026-08-11T12:20:00.000Z",
  },
  {
    id: 7,
    fullName: "Karan Malhotra",
    phone: "+91 90000 78901",
    preferredDate: "2026-08-10",
    preferredTime: "20:30",
    players: 14,
    hours: 1,
    totalPrice: 700,
    status: "cancelled",
    message: "",
    createdAt: "2026-08-10T11:10:00.000Z",
    updatedAt: "2026-08-10T14:25:00.000Z",
  },
  {
    id: 8,
    fullName: "Divya Sharma",
    phone: "+91 88800 89012",
    preferredDate: "2026-08-10",
    preferredTime: "18:30",
    players: 13,
    hours: 1,
    totalPrice: 700,
    status: "confirmed",
    message: "",
    createdAt: "2026-08-10T09:55:00.000Z",
    updatedAt: "2026-08-10T09:55:00.000Z",
  },
];

const DEMO_EXTENDED_BOOKINGS: ExtendedBooking[] = [
  {
    id: 101,
    fullName: "Arjun Mehta",
    phone: "+91 98200 12345",
    startDate: "2026-08-20",
    endDate: "2026-08-21",
    startTime: "09:00",
    endTime: "18:00",
    players: 14,
    message: "Team finals — full-day exclusive booking with floodlights.",
    status: "confirmed",
    createdAt: "2026-08-13T08:00:00.000Z",
    updatedAt: "2026-08-13T08:00:00.000Z",
  },
  {
    id: 102,
    fullName: "Rohan Verma",
    phone: "+91 97900 90123",
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    startTime: "10:00",
    endTime: "17:00",
    players: 14,
    message: "Corporate sports day — need music and seating setup as well.",
    status: "pending",
    createdAt: "2026-08-12T14:30:00.000Z",
    updatedAt: "2026-08-12T14:30:00.000Z",
  },
  {
    id: 103,
    fullName: "Meera Pillai",
    phone: "+91 97000 01234",
    startDate: "2026-08-25",
    endDate: "2026-08-26",
    startTime: "16:00",
    endTime: "22:00",
    players: 12,
    message: "Night sessions for our Sunday league.",
    status: "confirmed",
    createdAt: "2026-08-12T09:15:00.000Z",
    updatedAt: "2026-08-12T09:15:00.000Z",
  },
  {
    id: 104,
    fullName: "Aditya Rao",
    phone: "+91 96000 12345",
    startDate: "2026-08-27",
    endDate: "2026-08-27",
    startTime: "08:00",
    endTime: "14:00",
    players: 10,
    message: "Morning tournament trials.",
    status: "pending",
    createdAt: "2026-08-11T17:40:00.000Z",
    updatedAt: "2026-08-11T17:40:00.000Z",
  },
  {
    id: 105,
    fullName: "Nisha Gupta",
    phone: "+91 95000 23456",
    startDate: "2026-08-29",
    endDate: "2026-08-30",
    startTime: "09:00",
    endTime: "18:00",
    players: 14,
    message: "Weekend football camp for kids.",
    status: "confirmed",
    createdAt: "2026-08-10T15:50:00.000Z",
    updatedAt: "2026-08-10T15:50:00.000Z",
  },
];

const toneClasses: Record<Tone, string> = {
  green: "border-turf/25 bg-turf/10 text-turf",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  zinc: "border-white/15 bg-white/5 text-zinc-400",
};

function isObject(value: unknown): value is ApiObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function firstString(
  object: ApiObject,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function firstNumber(
  object: ApiObject,
  keys: string[],
  fallback = 0,
): number {
  for (const key of keys) {
    if (key in object) {
      const value = asNumber(object[key], Number.NaN);

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return fallback;
}

function getStatusTone(status: string): Tone {
  const value = status.toLowerCase();

  if (value === "confirmed") return "green";
  if (value === "pending") return "amber";
  if (value === "completed") return "sky";
  if (value === "cancelled" || value === "canceled") return "rose";

  return "zinc";
}

function capitalize(value: string): string {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string): string {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  if (!value) return "-";

  const trimmed = value.trim();

  /*
   * Keep values such as "19:00" exactly as supplied by the API.
   * Also safely handle a full ISO date/time if the backend sends one.
   */
  if (trimmed.includes("T")) {
    const parsed = new Date(trimmed);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  return trimmed;
}

function getArrayFromPayload(
  payload: unknown,
  preferredKeys: string[],
): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isObject(payload)) {
    return [];
  }

  for (const key of preferredKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  /*
   * Some APIs return:
   * { success: true, data: { bookings: [...] } }
   * or
   * { success: true, data: { enquiries: [...] } }
   */
  const data = payload["data"];

  if (Array.isArray(data)) {
    return data;
  }

  if (isObject(data)) {
    for (const key of preferredKeys) {
      const value = data[key];

      if (Array.isArray(value)) {
        return value;
      }
    }

    const nestedResults = data["results"];

    if (Array.isArray(nestedResults)) {
      return nestedResults;
    }
  }

  const results = payload["results"];

  if (Array.isArray(results)) {
    return results;
  }

  return [];
}

function normalizeHourlyBooking(value: unknown): HourlyBooking | null {
  if (!isObject(value)) {
    return null;
  }

  const id = firstNumber(value, ["id", "bookingId"], 0);

  if (!id) {
    return null;
  }

  /*
   * Supports both the older hourly shape:
   * preferredDate / preferredTime / hours / totalPrice
   *
   * and the newer shape:
   * startDate / startTime / endDate / endTime
   */
  const preferredDate = firstString(value, [
    "preferredDate",
    "date",
    "startDate",
  ]);

  const preferredTime = firstString(value, [
    "preferredTime",
    "time",
    "startTime",
  ]);

  const hours = firstNumber(
    value,
    ["hours", "duration", "durationHours"],
    1,
  );

  const totalPrice = firstNumber(
    value,
    ["totalPrice", "amount", "price", "totalAmount"],
    0,
  );

  return {
    id,
    fullName: firstString(value, [
      "fullName",
      "customerName",
      "name",
      "customer",
    ], "Unknown Customer"),
    phone: firstString(value, ["phone", "mobile", "phoneNumber"]),
    preferredDate,
    preferredTime,
    players: firstNumber(value, ["players", "numberOfPlayers", "playerCount"], 0),
    hours,
    totalPrice,
    status: firstString(value, ["status"], "pending"),
    message: firstString(value, ["message", "customerMessage"]),
    createdAt: firstString(value, ["createdAt", "created_at"]),
    updatedAt: firstString(value, ["updatedAt", "updated_at"]),
  };
}

function normalizeExtendedBooking(value: unknown): ExtendedBooking | null {
  if (!isObject(value)) {
    return null;
  }

  const id = firstNumber(value, ["id", "bookingId"], 0);

  if (!id) {
    return null;
  }

  return {
    id,
    fullName: firstString(value, [
      "fullName",
      "customerName",
      "name",
      "customer",
    ], "Unknown Customer"),
    phone: firstString(value, ["phone", "mobile", "phoneNumber"]),
    startDate: firstString(value, [
      "startDate",
      "preferredDate",
      "date",
    ]),
    endDate: firstString(value, [
      "endDate",
      "preferredEndDate",
      "date",
    ]),
    startTime: firstString(value, [
      "startTime",
      "preferredTime",
      "time",
    ]),
    endTime: firstString(value, [
      "endTime",
      "preferredEndTime",
      "time",
    ]),
    players: firstNumber(value, ["players", "numberOfPlayers", "playerCount"], 0),
    message: firstString(value, [
      "message",
      "customerMessage",
      "notes",
      "description",
    ]),
    status: firstString(value, ["status"], "pending"),
    createdAt: firstString(value, ["createdAt", "created_at"]),
    updatedAt: firstString(value, ["updatedAt", "updated_at"]),
  };
}

async function fetchJson(url: string): Promise<ApiResponse | unknown[]> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `Network error reaching the backend at ${url} (${detail}). ` +
        "Make sure the backend is running and reachable.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else {
    const text = await response.text();

    throw new Error(
      `Backend returned a non-JSON response (HTTP ${response.status}) from ${url}. ` +
        (text.trim() ? `Response: ${text.trim().slice(0, 200)}` : ""),
    );
  }

  if (!response.ok) {
    const message =
      isObject(payload) && typeof payload["message"] === "string"
        ? payload["message"]
        : `Request failed with status ${response.status}`;

    throw new Error(`${message} (HTTP ${response.status})`);
  }

  return payload as ApiResponse | unknown[];
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/*
 * Per-row booking status + approval actions.
 * Pending bookings get Approve / Reject buttons; everything else just
 * shows its status badge. Approving ("confirmed") is what books the slot.
 */
function BookingActions({
  status,
  busy,
  onApprove,
  onReject,
}: {
  status: string;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const value = status.toLowerCase();

  if (value === "confirmed") {
    return <StatusBadge label="Confirmed" tone="green" />;
  }

  if (value === "completed") {
    return <StatusBadge label="Completed" tone="sky" />;
  }

  if (value === "cancelled" || value === "canceled") {
    return <StatusBadge label="Cancelled" tone="rose" />;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-turf/30 bg-turf/10 px-3 py-1.5 text-xs font-medium text-turf transition-colors hover:bg-turf/20 disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approve
      </button>

      <button
        type="button"
        onClick={onReject}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-400/20 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </button>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "C";

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-turf/20 bg-turf/10 text-xs font-bold text-turf">
      {initials}
    </span>
  );
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {subtitle ? (
          <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

function DashboardView({
  hourlyBookings,
  enquiries,
  loading,
  onRefresh,
  onUpdateStatus,
  updatingId,
  demoStats,
}: {
  hourlyBookings: HourlyBooking[];
  enquiries: ExtendedBooking[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  updatingId: number | null;
  demoStats?: DemoStats | null;
}) {
  const totalBookings = demoStats
    ? demoStats.hourly
    : hourlyBookings.length;
  const totalExtended = demoStats
    ? demoStats.extended
    : enquiries.length;

  const totalRevenue = demoStats
    ? demoStats.revenue
    : hourlyBookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0,
      );

  const totalCustomers = demoStats
    ? demoStats.customers
    : new Set([
        ...hourlyBookings.map((booking) => booking.phone).filter(Boolean),
        ...enquiries.map((enquiry) => enquiry.phone).filter(Boolean),
      ]).size;

  const statSource = demoStats ? "Demo data" : "From database";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-turf">Dashboard</p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Good Morning, Admin
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Here&apos;s what&apos;s happening with TurfOn24 today.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-4 py-2.5 text-sm font-medium text-turf hover:bg-turf/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hourly Bookings"
          value={totalBookings}
          icon={CalendarCheck}
          source={statSource}
        />

        <StatCard
          label="Extended Bookings"
          value={totalExtended}
          icon={MessageSquare}
          source={statSource}
        />

        <StatCard
          label="Total Revenue"
          value={totalRevenue}
          prefix="₹"
          icon={Wallet}
          source={statSource}
        />

        <StatCard
          label="Customers"
          value={totalCustomers}
          icon={Users}
          source={statSource}
        />
      </div>

      <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
        <PanelHeader
          title="Recent Hourly Bookings"
          subtitle={`${hourlyBookings.length} hourly booking${hourlyBookings.length === 1 ? "" : "s"} total`}
        />

        {hourlyBookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-300">
              No hourly bookings yet
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hourlyBookings.slice(0, 5).map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-3">
                        <Avatar name={booking.fullName} />
                        <span className="font-medium text-white">
                          {booking.fullName}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {booking.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {formatTime(booking.preferredTime)}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">
                      ₹{booking.totalPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        label={capitalize(booking.status)}
                        tone={getStatusTone(booking.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsView({
  hourlyBookings,
  enquiries,
  loading,
  onRefresh,
  onUpdateStatus,
  updatingId,
}: {
  hourlyBookings: HourlyBooking[];
  enquiries: ExtendedBooking[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  updatingId: number | null;
}) {
  const [bookingType, setBookingType] = useState<"hourly" | "extended">(
    "hourly",
  );
  const [bookingTab, setBookingTab] = useState<"current" | "history">(
    "current",
  );
  const [showFilter, setShowFilter] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [messageModal, setMessageModal] = useState<{
    message: string;
    customer: string;
  } | null>(null);

  const filteredHourly = useMemo(() => {
    let result = hourlyBookings;
    if (bookingTab === "current") {
      result = result.filter(
        (b) =>
          !["completed", "cancelled", "canceled"].includes(
            b.status.toLowerCase(),
          ),
      );
    } else {
      result = result.filter((b) =>
        ["completed", "cancelled", "canceled"].includes(
          b.status.toLowerCase(),
        ),
      );
    }
    if (filterDate)
      result = result.filter((b) => b.preferredDate === filterDate);
    if (filterStatus)
      result = result.filter(
        (b) => b.status.toLowerCase() === filterStatus.toLowerCase(),
      );
    if (filterCustomer)
      result = result.filter((b) =>
        b.fullName.toLowerCase().includes(filterCustomer.toLowerCase()),
      );
    return result;
  }, [hourlyBookings, bookingTab, filterDate, filterStatus, filterCustomer]);

  const filteredExtended = useMemo(() => {
    let result = enquiries;
    if (bookingTab === "current") {
      result = result.filter(
        (b) =>
          !["completed", "cancelled", "canceled"].includes(
            b.status.toLowerCase(),
          ),
      );
    } else {
      result = result.filter((b) =>
        ["completed", "cancelled", "canceled"].includes(
          b.status.toLowerCase(),
        ),
      );
    }
    if (filterDate)
      result = result.filter((b) => b.startDate === filterDate);
    if (filterStatus)
      result = result.filter(
        (b) => b.status.toLowerCase() === filterStatus.toLowerCase(),
      );
    if (filterCustomer)
      result = result.filter((b) =>
        b.fullName.toLowerCase().includes(filterCustomer.toLowerCase()),
      );
    return result;
  }, [enquiries, bookingTab, filterDate, filterStatus, filterCustomer]);

  const hasActiveFilters = filterDate || filterStatus || filterCustomer;

  const exportCSV = () => {
    const escapeCSV = (value: string) => {
      if (
        value.includes(",") ||
        value.includes('"') ||
        value.includes("\n")
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const today = new Date().toISOString().slice(0, 10);

    if (bookingType === "hourly") {
      const headers = [
        "Customer Name",
        "Phone Number",
        "Booking Date",
        "Time Slot",
        "Players",
        "Amount",
        "Status",
      ];
      const rows = filteredHourly.map((b) => [
        escapeCSV(b.fullName),
        escapeCSV(b.phone),
        escapeCSV(formatDate(b.preferredDate)),
        escapeCSV(formatTime(b.preferredTime)),
        String(b.players),
        String(b.totalPrice),
        escapeCSV(b.status),
      ]);
      const csv = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `turfon24-hourly-bookings-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        "Customer Name",
        "Phone Number",
        "Start Date & Time",
        "End Date & Time",
        "Players",
        "Enquiry Message",
        "Status",
      ];
      const rows = filteredExtended.map((b) => [
        escapeCSV(b.fullName),
        escapeCSV(b.phone),
        escapeCSV(
          `${formatDate(b.startDate)} ${formatTime(b.startTime)}`,
        ),
        escapeCSV(
          `${formatDate(b.endDate)} ${formatTime(b.endTime)}`,
        ),
        String(b.players),
        escapeCSV(b.message),
        escapeCSV(b.status),
      ]);
      const csv = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `turfon24-extended-bookings-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterStatus("");
    setFilterCustomer("");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-turf">Bookings</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Booking Management
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Manage hourly bookings and extended booking enquiries.
        </p>
      </div>

      {/* ─── SEGMENTED TOGGLE ─── */}

      <div className="booking-toggle-track w-fit">
        <div
          className="booking-toggle-pill"
          data-state={bookingType}
        />

        <button
          type="button"
          className="booking-toggle-btn"
          data-active={bookingType === "hourly"}
          onClick={() => {
            setBookingType("hourly");
            setBookingTab("current");
            clearFilters();
          }}
        >
          <CalendarCheck className="h-4 w-4" />
          Hourly Bookings
        </button>

        <button
          type="button"
          className="booking-toggle-btn"
          data-active={bookingType === "extended"}
          onClick={() => {
            setBookingType("extended");
            setBookingTab("current");
            clearFilters();
          }}
        >
          <Clock className="h-4 w-4" />
          Extended Bookings
        </button>
      </div>

      {/* ─── ACTION BAR ─── */}

      <div className="booking-actions-bar">
        <button
          type="button"
          className="booking-action-btn"
          data-active={bookingTab === "current"}
          onClick={() => setBookingTab("current")}
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          Current Bookings
        </button>

        <button
          type="button"
          className="booking-action-btn"
          data-active={bookingTab === "history"}
          onClick={() => setBookingTab("history")}
        >
          <Clock className="h-3.5 w-3.5" />
          Booking History
        </button>

        <button
          type="button"
          className="booking-action-btn"
          data-active={showFilter}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
          {hasActiveFilters ? (
            <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-turf/20 text-[0.6rem] font-bold text-turf">
              {(filterDate ? 1 : 0) +
                (filterStatus ? 1 : 0) +
                (filterCustomer ? 1 : 0)}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className="booking-action-btn"
          data-variant="export"
          onClick={exportCSV}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-4 py-2 text-sm font-medium text-turf transition-colors hover:bg-turf/20 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── FILTER PANEL ─── */}

      {showFilter ? (
        <div className="booking-filter-panel">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Filter Bookings
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-turf hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Date</label>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="booking-filter-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Status</label>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="booking-filter-select"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">
                Customer
              </label>

              <input
                type="text"
                value={filterCustomer}
                onChange={(e) =>
                  setFilterCustomer(e.target.value)
                }
                placeholder="Search by name..."
                className="booking-filter-input"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── HOURLY TABLE (visible only when hourly is selected) ─── */}

      {bookingType === "hourly" ? (
        <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
          <PanelHeader
            title={`${bookingTab === "current" ? "Current" : "History"} Hourly Bookings`}
            subtitle={`${filteredHourly.length} booking${filteredHourly.length === 1 ? "" : "s"} found`}
          />

          {filteredHourly.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <CalendarCheck className="mx-auto h-10 w-10 text-zinc-600" />

              <p className="mt-3 text-sm font-medium text-zinc-300">
                No hourly bookings found
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {bookingTab === "current"
                  ? "All hourly bookings are completed or cancelled."
                  : "No booking history yet."}
              </p>
            </div>
          ) : (
            <div className="mt-4 booking-table-wrapper">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 font-medium">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Booking Date
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Time Slot
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Players
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredHourly.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-3">
                          <Avatar name={booking.fullName} />

                          <span className="font-medium text-white">
                            {booking.fullName}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {booking.phone || "-"}
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {formatDate(booking.preferredDate)}
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {formatTime(booking.preferredTime)}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {booking.players || "-"}
                      </td>

                      <td className="px-4 py-4 font-medium text-white">
                        ₹
                        {booking.totalPrice.toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <BookingActions
                          status={booking.status}
                          busy={updatingId === booking.id}
                          onApprove={() =>
                            onUpdateStatus(
                              booking.id,
                              "confirmed",
                            )
                          }
                          onReject={() =>
                            onUpdateStatus(
                              booking.id,
                              "cancelled",
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* ─── EXTENDED TABLE (visible only when extended is selected) ─── */}

      {bookingType === "extended" ? (
        <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
          <PanelHeader
            title={`${bookingTab === "current" ? "Current" : "History"} Extended Bookings`}
            subtitle={`${filteredExtended.length} booking${filteredExtended.length === 1 ? "" : "s"} found`}
          />

          {filteredExtended.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <Clock className="mx-auto h-10 w-10 text-zinc-600" />

              <p className="mt-3 text-sm font-medium text-zinc-300">
                No extended bookings found
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {bookingTab === "current"
                  ? "All extended bookings are completed or cancelled."
                  : "No booking history yet."}
              </p>
            </div>
          ) : (
            <div className="mt-4 booking-table-wrapper">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 font-medium">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Start Date & Time
                    </th>
                    <th className="px-4 py-3 font-medium">
                      End Date & Time
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Players
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Enquiry Message
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredExtended.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-3">
                          <Avatar name={enquiry.fullName} />

                          <span className="font-medium text-white">
                            {enquiry.fullName}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {enquiry.phone || "-"}
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {formatDate(enquiry.startDate)}{" "}
                        {formatTime(enquiry.startTime)}
                      </td>

                      <td className="px-4 py-4 text-zinc-400">
                        {formatDate(enquiry.endDate)}{" "}
                        {formatTime(enquiry.endTime)}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {enquiry.players || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="booking-message-truncate text-sm text-zinc-300"
                          onClick={() =>
                            setMessageModal({
                              message:
                                enquiry.message ||
                                "No message provided",
                              customer: enquiry.fullName,
                            })
                          }
                        >
                          {enquiry.message ||
                            "No message provided"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <BookingActions
                          status={enquiry.status}
                          busy={updatingId === enquiry.id}
                          onApprove={() =>
                            onUpdateStatus(
                              enquiry.id,
                              "confirmed",
                            )
                          }
                          onReject={() =>
                            onUpdateStatus(
                              enquiry.id,
                              "cancelled",
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* ─── MESSAGE MODAL ─── */}

      {messageModal ? (
        <div
          className="booking-modal-backdrop"
          onClick={() => setMessageModal(null)}
        >
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <Avatar name={messageModal.customer} />

                <div>
                  <h3 className="font-semibold text-white">
                    {messageModal.customer}
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Enquiry Message
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMessageModal(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:border-turf/40 hover:text-turf"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-turf/10 bg-turf/[0.04] p-4">
                <p className="text-sm leading-6 text-zinc-300">
                  {messageModal.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CustomersView({
  hourlyBookings,
  enquiries,
}: {
  hourlyBookings: HourlyBooking[];
  enquiries: ExtendedBooking[];
}) {
  const customers = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        name: string;
        phone: string;
        bookings: number;
      }
    >();

    for (const booking of hourlyBookings) {
      const key = booking.phone || `hourly-${booking.id}`;
      const existing = customerMap.get(key);

      customerMap.set(key, {
        name: booking.fullName,
        phone: booking.phone,
        bookings: (existing?.bookings ?? 0) + 1,
      });
    }

    for (const enquiry of enquiries) {
      const key = enquiry.phone || `extended-${enquiry.id}`;
      const existing = customerMap.get(key);

      customerMap.set(key, {
        name: enquiry.fullName,
        phone: enquiry.phone,
        bookings: (existing?.bookings ?? 0) + 1,
      });
    }

    return Array.from(customerMap.values());
  }, [hourlyBookings, enquiries]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-turf">Customers</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Customer Management
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Customers are automatically collected from bookings.
        </p>
      </div>

      <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
        <PanelHeader
          title="Customers"
          subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"} found`}
        />

        {customers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/10 p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-zinc-600" />

            <p className="mt-3 text-sm text-zinc-400">
              No customers yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {customers.map((customer) => (
                  <tr key={customer.phone || customer.name}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={customer.name} />

                        <span className="font-medium text-white">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-4 py-4 text-zinc-300">
                      {customer.bookings}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge label="Active" tone="green" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credSuccess, setCredSuccess] = useState("");
  const [credError, setCredError] = useState("");
  const [credBusy, setCredBusy] = useState(false);

  const [bookingsEnabled, setBookingsEnabled] = useState(true);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [toggleSuccess, setToggleSuccess] = useState("");
  const [toggleError, setToggleError] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("turfon24_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("turfon24_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (DEMO_MODE) {
      const saved = window.localStorage.getItem("turfon24_bookings_enabled");
      setBookingsEnabled(saved !== "off");
      setSettingsLoaded(true);
      return;
    }

    let cancelled = false;

    fetch(apiUrl("/api/admin/settings/online_bookings_enabled"), {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (data.setting && data.setting.value === "false") {
          setBookingsEnabled(false);
        } else {
          setBookingsEnabled(true);
        }

        setSettingsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSettingsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangeCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCredError("");
    setCredSuccess("");

    if (!currentPassword.trim()) {
      setCredError("Current password is required");
      return;
    }

    if (!newUsername.trim() && !newPassword.trim()) {
      setCredError("Provide a new username or new password");
      return;
    }

    if (newPassword.trim() && newPassword !== confirmPassword) {
      setCredError("New password and confirmation do not match");
      return;
    }

    if (newPassword.trim() && newPassword.trim().length < 4) {
      setCredError("New password must be at least 4 characters");
      return;
    }

    if (newUsername.trim() && newUsername.trim().length < 3) {
      setCredError("Username must be at least 3 characters");
      return;
    }

    setCredBusy(true);

    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => window.setTimeout(resolve, 600));
        setCredSuccess("Admin credentials updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNewUsername("");
        setCredBusy(false);
        return;
      }

      const response = await fetch(apiUrl("/api/admin/change-credentials"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data: ApiResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (typeof data["message"] === "string" ? data["message"] : null) ||
            "Failed to update credentials"
        );
      }

      setCredSuccess("Admin credentials updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewUsername("");
    } catch (error) {
      setCredError(
        error instanceof Error ? error.message : "Failed to update credentials"
      );
    } finally {
      setCredBusy(false);
    }
  };

  const handleToggleBookings = async (enabled: boolean) => {
    setToggleError("");
    setToggleSuccess("");
    setToggleBusy(true);

    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        setBookingsEnabled(enabled);
        window.localStorage.setItem(
          "turfon24_bookings_enabled",
          enabled ? "on" : "off"
        );
        setToggleSuccess(
          enabled
            ? "Online bookings are currently enabled"
            : "Online bookings are currently disabled"
        );
        setToggleBusy(false);
        return;
      }

      const response = await fetch(apiUrl("/api/admin/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "online_bookings_enabled",
          value: String(enabled),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (typeof data["message"] === "string" ? data["message"] : null) ||
            "Failed to update booking status"
        );
      }

      setBookingsEnabled(enabled);
      setToggleSuccess(
        enabled
          ? "Online bookings are currently enabled"
          : "Online bookings are currently disabled"
      );
    } catch (error) {
      setToggleError(
        error instanceof Error
          ? error.message
          : "Failed to update booking status"
      );
    } finally {
      setToggleBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-turf">Settings</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admin Settings
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Manage your account, data, and booking preferences.
        </p>
      </div>

      {/* ─── ACCOUNT SECURITY ─── */}

      <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
        <PanelHeader
          title="Account Security"
          subtitle="Change your admin ID and password"
          action={
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
              <Shield className="h-5 w-5" />
            </span>
          }
        />

        <form
          onSubmit={(event) => void handleChangeCredentials(event)}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-400">
              New Admin ID
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-turf/70" />

              <input
                type="text"
                autoComplete="username"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                placeholder="Leave unchanged to keep current"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-turf/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-400">
              Current Password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-turf/70" />

              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Required to confirm changes"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-turf/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-400">
              New Password
            </label>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-turf/70" />

              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Leave unchanged to keep current"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-turf/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-zinc-400">
              Confirm New Password
            </label>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-turf/70" />

              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-turf/40"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            {credError ? (
              <p className="mb-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                {credError}
              </p>
            ) : null}

            {credSuccess ? (
              <p className="mb-3 rounded-xl border border-turf/25 bg-turf/10 px-4 py-3 text-sm text-turf">
                {credSuccess}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={credBusy}
              className="inline-flex items-center gap-2 rounded-full bg-turf px-6 py-3 text-sm font-semibold text-night shadow-[0_0_35px_rgba(60,235,120,0.35)] transition hover:brightness-110 disabled:opacity-60"
            >
              {credBusy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-night/30 border-t-night" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── APPEARANCE ─── */}

      <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
        <PanelHeader
          title="Appearance"
          subtitle="Switch between light and dark theme"
          action={
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </span>
          }
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {theme === "dark"
                ? "Currently using the dark theme"
                : "Currently using the light theme"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Switch to Light
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Switch to Dark
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── BOOKING CONTROLS ─── */}

      <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
        <PanelHeader
          title="Booking Controls"
          subtitle="Manage online booking availability"
          action={
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
              <Settings className="h-5 w-5" />
            </span>
          }
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Online Bookings</p>

            <p className="mt-1 text-sm text-zinc-400">
              {bookingsEnabled
                ? "Online bookings are currently enabled"
                : "Online bookings are currently disabled"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                bookingsEnabled
                  ? "border-turf/25 bg-turf/10 text-turf"
                  : "border-rose-400/25 bg-rose-400/10 text-rose-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {bookingsEnabled ? "Active" : "Disabled"}
            </span>

            <button
              type="button"
              disabled={toggleBusy}
              onClick={() => {
                if (bookingsEnabled) {
                  setShowDisableConfirm(true);
                } else {
                  void handleToggleBookings(true);
                }
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                bookingsEnabled ? "bg-turf" : "bg-zinc-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  bookingsEnabled
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {toggleError ? (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {toggleError}
          </p>
        ) : null}

        {toggleSuccess ? (
          <p className="mt-4 rounded-xl border border-turf/25 bg-turf/10 px-4 py-3 text-sm text-turf">
            {toggleSuccess}
          </p>
        ) : null}
      </div>

      {/* ─── DISABLE CONFIRMATION DIALOG ─── */}

      {showDisableConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDisableConfirm(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-turf/15 bg-night-soft/95 p-6 shadow-[0_0_80px_rgba(16,221,86,0.12)] backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              </span>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Disable Online Bookings?
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  When disabled, customers will see a message that online
                  bookings are unavailable and will not be able to create new
                  bookings. Existing bookings will not be affected.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={toggleBusy}
                onClick={() => setShowDisableConfirm(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={toggleBusy}
                onClick={() => {
                  setShowDisableConfirm(false);
                  void handleToggleBookings(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-400/20 disabled:opacity-60"
              >
                {toggleBusy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300/30 border-t-rose-300" />
                    Disabling...
                  </>
                ) : (
                  "Yes, Disable"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminLoginPage({
  username,
  password,
  error,
  busy,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: {
  username: string;
  password: string;
  error: string;
  busy: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030607] px-4 py-10 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${turfLoginImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(3,6,7,0.75), rgba(3,6,7,0.75))",
        }}
      />
      <div className="admin-login-card relative z-10 w-full max-w-[620px] overflow-hidden rounded-2xl border border-[#000000] bg-transparent shadow-[0_0_30px_rgba(57,255,122,0.2)] backdrop-blur-md sm:min-h-[600px]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[30%] z-0 overflow-hidden bg-transparent">
          <ShaderBackground className="h-full w-full" />
        </div>
        <div
          className="login-header pointer-events-none absolute inset-x-0 top-0 z-20 h-[30%] overflow-visible bg-[#000000] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${turfBlackImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-x-0 top-7 flex justify-center">
            <div className="text-center">
              <img src={taglineImg} alt="TurfOn24 - Your Turf. Your Time. Your Game." className="h-auto w-48 object-contain" />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 pb-10 pt-[190px] sm:px-12 sm:pb-12 sm:pt-[200px]">
          <div className="mx-auto max-w-md">
            <div>
              <h1 className="text-center text-3xl font-black uppercase tracking-tight text-[#000000]">
                LOGIN
              </h1>

              <p className="mt-2 text-center text-sm text-[#030607]/75">
                Sign in to manage bookings and enquiries.
              </p>

              <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            <div>
              <label
                htmlFor="admin-username"
                className="text-xs uppercase tracking-wider text-[#000000]"
              >
                Username
              </label>

              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan" />

                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => onUsernameChange(event.target.value)}
                  placeholder="demo123"
                  className="w-full border-0 border-b border-[#000000]/60 bg-transparent py-3 pl-10 pr-4 text-sm text-[#000000] outline-none transition-colors placeholder:text-[#030607]/60 focus:border-[#000000]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="text-xs uppercase tracking-wider text-[#000000]"
              >
                Password
              </label>

              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan" />

                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="••••••"
                  className="w-full border-0 border-b border-[#000000]/60 bg-transparent py-3 pl-10 pr-4 text-sm text-[#000000] outline-none transition-colors placeholder:text-[#030607]/60 focus:border-[#000000]"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#000000] px-6 py-3 text-sm font-semibold text-[#39FF7A] shadow-[0_0_16px_rgba(0,0,0,0.2)] transition hover:bg-[#0FA857] hover:text-[#000000] hover:shadow-[0_0_18px_rgba(57,255,122,0.2)] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {busy ? "Signing in..." : "Sign In"}
            </button>
              </form>

              <p className="mt-5 text-center text-xs text-[#030607]/75">
            Demo credentials:{" "}
            <span className="text-[#000000]/80">demo123 / demo123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  view,
  onNavigate,
  onLogout,
}: {
  view: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <a
        href="/"
        className="flex items-center gap-3 px-4 pt-6 lg:px-5"
      >
        <img src={logoImg} alt="TurfOn24" className="h-10 w-10 shrink-0 rounded-full object-cover" />

        <span className="hidden min-w-0 lg:block">
          <img src={taglineImg} alt="TurfOn24 - Your Turf. Your Time. Your Game." className="h-auto w-36 object-contain" />
        </span>
      </a>

      <nav className="mt-8 flex flex-1 flex-col gap-1 px-3 lg:px-4">
        {navItems.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-turf/15 text-turf"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-turf" />
              ) : null}

              <Icon className="h-5 w-5 shrink-0" />

              <span className="block md:hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-turf/10 p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-turf/25 bg-turf/10 text-sm font-bold text-turf">
            A
          </span>

          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-white">
              Admin
            </p>

            <p className="truncate text-xs text-zinc-500">
              admin@turfon24.com
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-rose-400/40 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />

          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

function AdminPage() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "1";
  });

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [hourlyBookings, setHourlyBookings] = useState<HourlyBooking[]>(
    [],
  );

  const [enquiries, setEnquiries] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (DEMO_MODE) {
      setLoading(true);
      setErrorMessage("");
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setHourlyBookings(DEMO_HOURLY_BOOKINGS);
      setEnquiries(DEMO_EXTENDED_BOOKINGS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const hourlyUrl = apiUrl("/api/bookings/hourly");
      const enquiriesUrl = apiUrl("/api/bookings/enquiries");

      console.log("[Admin] API URL:", API_URL);
      console.log("[Admin] Fetching:", hourlyUrl);
      console.log("[Admin] Fetching:", enquiriesUrl);

      const [hourlyPayload, enquiriesPayload] = await Promise.all([
        fetchJson(hourlyUrl),
        fetchJson(enquiriesUrl),
      ]);

      const hourlyRaw = getArrayFromPayload(hourlyPayload, [
        "bookings",
        "hourlyBookings",
        "data",
        "results",
      ]);

      const enquiriesRaw = getArrayFromPayload(enquiriesPayload, [
        "enquiries",
        "inquiries",
        "extendedBookings",
        "bookings",
        "data",
        "results",
      ]);

      /*
       * Normalize the backend response before putting it into React state.
       * This is the important part that prevents the dashboard from showing
       * "0 bookings" simply because the API used a different response key.
       */
      const normalizedHourly = hourlyRaw
        .map(normalizeHourlyBooking)
        .filter((booking): booking is HourlyBooking => booking !== null);

      const normalizedEnquiries = enquiriesRaw
        .map(normalizeExtendedBooking)
        .filter(
          (booking): booking is ExtendedBooking => booking !== null,
        );

      console.log("[Admin] Hourly raw records:", hourlyRaw.length);
      console.log("[Admin] Hourly normalized records:", normalizedHourly.length);
      console.log("[Admin] Enquiry raw records:", enquiriesRaw.length);
      console.log(
        "[Admin] Enquiry normalized records:",
        normalizedEnquiries.length,
      );

      setHourlyBookings(normalizedHourly);
      setEnquiries(normalizedEnquiries);
    } catch (error) {
      console.error("[Admin] Failed to load admin data:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to load booking data.";

      setErrorMessage(message);
      setHourlyBookings([]);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const updateBookingStatus = useCallback(
    async (id: number, status: string) => {
      if (DEMO_MODE) {
        setUpdatingId(id);
        setErrorMessage("");
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        setHourlyBookings((current) =>
          current.map((booking) =>
            booking.id === id ? { ...booking, status } : booking,
          ),
        );
        setEnquiries((current) =>
          current.map((enquiry) =>
            enquiry.id === id ? { ...enquiry, status } : enquiry,
          ),
        );
        setUpdatingId(null);
        return;
      }

      try {
        setUpdatingId(id);
        setErrorMessage("");

        const response = await fetch(apiUrl(`/api/bookings/${id}`), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const contentType = response.headers.get("content-type") || "";
        let data: ApiResponse | null = null;

        if (contentType.includes("application/json")) {
          try {
            data = (await response.json()) as ApiResponse;
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          const message =
            data && isObject(data) && typeof data["message"] === "string"
              ? data["message"]
              : `Failed to update booking status (HTTP ${response.status})`;

          throw new Error(message);
        }

        await fetchAdminData();
      } catch (error) {
        console.error("[Admin] Failed to update booking status:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Failed to update booking status.";

        setErrorMessage(message);
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchAdminData],
  );

  useEffect(() => {
    void fetchAdminData();

    if (DEMO_MODE) return;

    const interval = window.setInterval(() => {
      void fetchAdminData();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchAdminData]);

  useEffect(() => {
    if (!mobileOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigate = (nextView: ViewKey) => {
    setView(nextView);
    setMobileOpen(false);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setLoginBusy(true);

    try {
      if (!DEMO_MODE) {
        const response = await fetch(apiUrl("/api/admin/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginUsername.trim(),
            password: loginPassword,
          }),
        });

        const data: ApiResponse = await response.json().catch(() => ({}));

        if (response.ok) {
          window.sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
          setAuthenticated(true);
          setLoginPassword("");
          setLoginBusy(false);
          return;
        }

        setLoginError(
          (typeof data["message"] === "string" ? data["message"] : null) ||
            "Invalid username or password"
        );
        setLoginBusy(false);
        return;
      }
    } catch {
      /* Backend unavailable, fall through to demo credentials */
    }

    if (loginUsername !== ADMIN_USERNAME || loginPassword !== ADMIN_PASSWORD) {
      setLoginError("Invalid username or password. Try demo123 / demo123.");
      setLoginBusy(false);
      return;
    }

    window.setTimeout(() => {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
      setAuthenticated(true);
      setLoginPassword("");
      setLoginBusy(false);
    }, 350);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthenticated(false);
    setView("dashboard");
    setMobileOpen(false);
  };

  if (!authenticated) {
    return (
      <AdminLoginPage
        username={loginUsername}
        password={loginPassword}
        error={loginError}
        busy={loginBusy}
        onUsernameChange={setLoginUsername}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-night-soft text-zinc-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col border-r border-turf/10 bg-white/[0.03] backdrop-blur-xl md:flex lg:w-[268px]">
        <SidebarContent
          view={view}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-turf/10 bg-night-soft/95 backdrop-blur-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:border-turf/40 hover:text-turf"
            >
              <X className="h-4 w-4" />
            </button>

            <SidebarContent
              view={view}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col md:pl-[76px] lg:pl-[268px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-turf/10 bg-night-soft/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-turf/20 text-turf md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="flex items-center gap-2 rounded-full border border-turf/15 bg-white/[0.03] px-3 py-2 text-sm text-zinc-500">
            <Search className="h-4 w-4" />

            <input
              type="search"
              placeholder="Search..."
              className="w-40 bg-transparent text-sm outline-none placeholder:text-zinc-600"
            />
          </span>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-white/[0.03] text-zinc-300 hover:border-turf/40 hover:text-turf"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-turf ring-2 ring-night-soft" />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-turf/20 bg-white/[0.03] py-1 pl-1 pr-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-turf/15 text-xs font-bold text-turf">
                A
              </span>

              <span className="hidden text-sm font-medium text-white sm:block">
                Admin
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {errorMessage ? (
            <div className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4">
              <p className="text-sm font-semibold text-rose-300">
                Could not load booking data
              </p>

              <p className="mt-1 text-sm text-rose-200/80">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void fetchAdminData()}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-400/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/10"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : null}

          {view === "dashboard" ? (
            <DashboardView
              hourlyBookings={hourlyBookings}
              enquiries={enquiries}
              loading={loading}
              onRefresh={() => void fetchAdminData()}
              onUpdateStatus={(id, status) =>
                void updateBookingStatus(id, status)
              }
              updatingId={updatingId}
              demoStats={DEMO_MODE ? DEMO_STATS : null}
            />
          ) : null}

          {view === "bookings" ? (
            <BookingsView
              hourlyBookings={hourlyBookings}
              enquiries={enquiries}
              loading={loading}
              onRefresh={() => void fetchAdminData()}
              onUpdateStatus={(id, status) =>
                void updateBookingStatus(id, status)
              }
              updatingId={updatingId}
            />
          ) : null}

          {view === "customers" ? (
            <CustomersView
              hourlyBookings={hourlyBookings}
              enquiries={enquiries}
            />
          ) : null}

          {view === "settings" ? (
            <SettingsView />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  prefix,
  icon: Icon,
  source = "From database",
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
  source?: string;
}) {
  return (
    <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5 transition-all hover:border-turf/25 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {prefix}
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-turf/25 bg-turf/10 px-2 py-0.5 font-semibold text-turf">
          <TrendingUp className="h-3.5 w-3.5" />
          Live
        </span>

        <span className="text-zinc-500">{source}</span>
      </div>
    </div>
  );
}