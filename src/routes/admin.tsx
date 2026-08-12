import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { API_URL, apiUrl } from "@/lib/api";

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
  | "messages"
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
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
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

function HourlyBookingsTable({
  bookings,
  onRefresh,
  onUpdateStatus,
  updatingId,
  loading,
}: {
  bookings: HourlyBooking[];
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  updatingId: number | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
      <PanelHeader
        title="Hourly Bookings"
        subtitle={`${bookings.length} hourly booking${bookings.length === 1 ? "" : "s"} found`}
        action={
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-4 py-2 text-sm font-medium text-turf transition-colors hover:bg-turf/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-zinc-600" />

          <p className="mt-3 text-sm font-medium text-zinc-300">
            No hourly bookings yet
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            New hourly bookings will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Players</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <span className="font-semibold text-turf">
                      #{booking.id}
                    </span>
                  </td>

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

                  <td className="px-4 py-4 text-zinc-300">
                    {booking.hours || "-"}
                  </td>

                  <td className="px-4 py-4 font-medium text-white">
                    ₹{booking.totalPrice.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4">
                    <BookingActions
                      status={booking.status}
                      busy={updatingId === booking.id}
                      onApprove={() =>
                        onUpdateStatus(booking.id, "confirmed")
                      }
                      onReject={() =>
                        onUpdateStatus(booking.id, "cancelled")
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
  );
}

function ExtendedBookingsTable({
  enquiries,
  onRefresh,
  onUpdateStatus,
  updatingId,
  loading,
}: {
  enquiries: ExtendedBooking[];
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  updatingId: number | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5">
      <PanelHeader
        title="Extended Bookings"
        subtitle={`${enquiries.length} extended booking${enquiries.length === 1 ? "" : "s"} / enquir${enquiries.length === 1 ? "y" : "ies"} found`}
        action={
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-4 py-2 text-sm font-medium text-turf transition-colors hover:bg-turf/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {enquiries.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-zinc-600" />

          <p className="mt-3 text-sm font-medium text-zinc-300">
            No extended bookings yet
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Extended booking enquiries will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">End Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Players</th>
                <th className="px-4 py-3 font-medium">Customer Message</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {enquiries.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <span className="font-semibold text-turf">
                      #{enquiry.id}
                    </span>
                  </td>

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
                    {formatDate(enquiry.startDate)}
                  </td>

                  <td className="px-4 py-4 text-zinc-400">
                    {formatDate(enquiry.endDate)}
                  </td>

                  <td className="px-4 py-4 text-zinc-400">
                    {formatTime(enquiry.startTime)} -{" "}
                    {formatTime(enquiry.endTime)}
                  </td>

                  <td className="px-4 py-4 text-zinc-300">
                    {enquiry.players || "-"}
                  </td>

                  <td className="max-w-[320px] px-4 py-4">
                    <div className="rounded-lg border border-turf/10 bg-turf/[0.04] p-3">
                      <p className="whitespace-normal break-words text-sm leading-5 text-zinc-300">
                        {enquiry.message || "No message provided"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <BookingActions
                      status={enquiry.status}
                      busy={updatingId === enquiry.id}
                      onApprove={() =>
                        onUpdateStatus(enquiry.id, "confirmed")
                      }
                      onReject={() =>
                        onUpdateStatus(enquiry.id, "cancelled")
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
  );
}

function DashboardView({
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
  const totalBookings = hourlyBookings.length;
  const totalExtended = enquiries.length;

  const totalRevenue = hourlyBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0,
  );

  const totalCustomers = new Set([
    ...hourlyBookings.map((booking) => booking.phone).filter(Boolean),
    ...enquiries.map((enquiry) => enquiry.phone).filter(Boolean),
  ]).size;

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
        />

        <StatCard
          label="Extended Bookings"
          value={totalExtended}
          icon={MessageSquare}
        />

        <StatCard
          label="Total Revenue"
          value={totalRevenue}
          prefix="₹"
          icon={Wallet}
        />

        <StatCard
          label="Customers"
          value={totalCustomers}
          icon={Users}
        />
      </div>

      <HourlyBookingsTable
        bookings={hourlyBookings}
        onRefresh={onRefresh}
        onUpdateStatus={onUpdateStatus}
        updatingId={updatingId}
        loading={loading}
      />

      <ExtendedBookingsTable
        enquiries={enquiries}
        onRefresh={onRefresh}
        onUpdateStatus={onUpdateStatus}
        updatingId={updatingId}
        loading={loading}
      />
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

      <HourlyBookingsTable
        bookings={hourlyBookings}
        onRefresh={onRefresh}
        onUpdateStatus={onUpdateStatus}
        updatingId={updatingId}
        loading={loading}
      />

      <ExtendedBookingsTable
        enquiries={enquiries}
        onRefresh={onRefresh}
        onUpdateStatus={onUpdateStatus}
        updatingId={updatingId}
        loading={loading}
      />
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

function MessagesView({
  enquiries,
}: {
  enquiries: ExtendedBooking[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-turf">Messages</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Customer Messages
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Messages submitted through booking enquiries.
        </p>
      </div>

      <div className="grid gap-4">
        {enquiries.length === 0 ? (
          <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-10 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-zinc-600" />

            <p className="mt-3 text-zinc-400">
              No customer messages yet.
            </p>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="rounded-2xl border border-turf/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={enquiry.fullName} />

                  <div>
                    <h3 className="font-semibold text-white">
                      {enquiry.fullName}
                    </h3>

                    <p className="text-sm text-zinc-500">
                      {enquiry.phone || "-"}
                    </p>
                  </div>
                </div>

                <StatusBadge
                  label={capitalize(enquiry.status)}
                  tone={getStatusTone(enquiry.status)}
                />
              </div>

              <div className="mt-4 rounded-xl border border-turf/10 bg-turf/[0.04] p-4">
                <p className="text-xs uppercase tracking-wider text-turf">
                  Customer Message
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {enquiry.message || "No message provided"}
                </p>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-zinc-600">Start Date</p>

                  <p className="mt-1 text-zinc-300">
                    {formatDate(enquiry.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-600">End Date</p>

                  <p className="mt-1 text-zinc-300">
                    {formatDate(enquiry.endDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-600">Time</p>

                  <p className="mt-1 text-zinc-300">
                    {formatTime(enquiry.startTime)} -{" "}
                    {formatTime(enquiry.endTime)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SidebarContent({
  view,
  onNavigate,
}: {
  view: ViewKey;
  onNavigate: (view: ViewKey) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <a
        href="/"
        className="flex items-center gap-3 px-4 pt-6 lg:px-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-turf/30 bg-turf/10 text-lg font-bold text-turf">
          T
        </span>

        <span className="hidden min-w-0 lg:block">
          <span className="block truncate text-sm font-bold text-white">
            TurfOn24
          </span>

          <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-turf/70">
            Admin Panel
          </span>
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

              <span className="hidden lg:block">{item.label}</span>
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

  const [hourlyBookings, setHourlyBookings] = useState<HourlyBooking[]>(
    [],
  );

  const [enquiries, setEnquiries] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAdminData = useCallback(async () => {
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

  return (
    <div className="min-h-screen bg-night-soft text-zinc-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col border-r border-turf/10 bg-white/[0.03] backdrop-blur-xl md:flex lg:w-[268px]">
        <SidebarContent
          view={view}
          onNavigate={navigate}
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

          {view === "messages" ? (
            <MessagesView enquiries={enquiries} />
          ) : null}

          {view === "settings" ? (
            <div className="rounded-2xl border border-turf/10 bg-white/[0.03] p-10 text-center">
              <Settings className="mx-auto h-10 w-10 text-turf" />

              <h2 className="mt-4 text-xl font-semibold text-white">
                Settings
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Settings module coming soon.
              </p>
            </div>
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
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
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

        <span className="text-zinc-500">From database</span>
      </div>
    </div>
  );
}