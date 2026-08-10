import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  Eye,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Pencil,
  Search,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const navItems: Array<{ id: ViewKey; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

type StatDef = {
  label: string;
  value: number;
  prefix?: string;
  delta: string;
  icon: LucideIcon;
  pad?: boolean;
};

const stats: StatDef[] = [
  { label: "Today's Bookings", value: 24, delta: "+12.5%", icon: CalendarCheck },
  { label: "Total Revenue", value: 48500, prefix: "₹", delta: "+18.2%", icon: Wallet },
  { label: "Active Turfs", value: 8, pad: true, delta: "+2", icon: MapPin },
  { label: "Total Customers", value: 1284, delta: "+8.4%", icon: Users },
];

type RangeKey = "Today" | "Week" | "Month";

const chartRanges: Record<RangeKey, { label: string; bookings: number }[]> = {
  Today: [
    { label: "12 AM", bookings: 2 },
    { label: "6 AM", bookings: 5 },
    { label: "12 PM", bookings: 14 },
    { label: "3 PM", bookings: 22 },
    { label: "6 PM", bookings: 24 },
    { label: "9 PM", bookings: 18 },
    { label: "11 PM", bookings: 9 },
  ],
  Week: [
    { label: "Mon", bookings: 18 },
    { label: "Tue", bookings: 24 },
    { label: "Wed", bookings: 16 },
    { label: "Thu", bookings: 28 },
    { label: "Fri", bookings: 35 },
    { label: "Sat", bookings: 42 },
    { label: "Sun", bookings: 31 },
  ],
  Month: [
    { label: "W1", bookings: 96 },
    { label: "W2", bookings: 118 },
    { label: "W3", bookings: 104 },
    { label: "W4", bookings: 142 },
  ],
};

type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

type Booking = {
  id: string;
  customer: string;
  turf: string;
  date: string;
  time: string;
  amount: string;
  status: BookingStatus;
};

const recentBookings: Booking[] = [
  { id: "#TF1024", customer: "Rahul Kumar", turf: "Turf A", date: "08 Aug", time: "06:00 PM", amount: "₹1,200", status: "Confirmed" },
  { id: "#TF1023", customer: "Priya Sharma", turf: "Turf C", date: "08 Aug", time: "04:00 PM", amount: "₹1,500", status: "Pending" },
  { id: "#TF1022", customer: "Arjun Mehta", turf: "Turf B", date: "08 Aug", time: "02:00 PM", amount: "₹1,100", status: "Completed" },
  { id: "#TF1021", customer: "Sneha Iyer", turf: "Turf D", date: "07 Aug", time: "09:00 PM", amount: "₹900", status: "Cancelled" },
  { id: "#TF1020", customer: "Vikram Singh", turf: "Turf A", date: "07 Aug", time: "08:00 PM", amount: "₹1,200", status: "Confirmed" },
  { id: "#TF1019", customer: "Neha Patel", turf: "Turf C", date: "07 Aug", time: "06:00 PM", amount: "₹1,500", status: "Completed" },
];

type CustomerStatus = "Active" | "VIP" | "Inactive";

type Customer = {
  name: string;
  email: string;
  phone: string;
  bookings: number;
  spent: string;
  status: CustomerStatus;
};

const customers: Customer[] = [
  { name: "Rahul Kumar", email: "rahul@mail.com", phone: "+91 98765 43210", bookings: 6, spent: "₹7,400", status: "Active" },
  { name: "Priya Sharma", email: "priya@mail.com", phone: "+91 91234 56780", bookings: 3, spent: "₹3,900", status: "Active" },
  { name: "Arjun Mehta", email: "arjun@mail.com", phone: "+91 90000 11111", bookings: 11, spent: "₹14,200", status: "VIP" },
  { name: "Sneha Iyer", email: "sneha@mail.com", phone: "+91 81111 22222", bookings: 2, spent: "₹2,100", status: "Active" },
  { name: "Vikram Singh", email: "vikram@mail.com", phone: "+91 73333 44444", bookings: 5, spent: "₹6,800", status: "Inactive" },
];

type Tone = "green" | "amber" | "sky" | "rose" | "zinc";

const toneClasses: Record<Tone, string> = {
  green: "border-turf/25 bg-turf/10 text-turf",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  zinc: "border-white/15 bg-white/5 text-zinc-400",
};

const bookingTone: Record<BookingStatus, Tone> = {
  Confirmed: "green",
  Pending: "amber",
  Completed: "sky",
  Cancelled: "rose",
};

const customerTone: Record<CustomerStatus, Tone> = {
  Active: "green",
  VIP: "amber",
  Inactive: "zinc",
};

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
        {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function RowAction({ icon: Icon, label, tone = "zinc" }: { icon: LucideIcon; label: string; tone?: Tone }) {
  const hover =
    tone === "rose"
      ? "hover:border-rose-400/40 hover:text-rose-300"
      : "hover:border-turf/40 hover:text-turf";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors ${hover}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return value;
}

function StatCard({ stat, index }: { stat: StatDef; index: number }) {
  const count = useCountUp(stat.value);
  const display = stat.pad
    ? String(count).padStart(2, "0")
    : count.toLocaleString("en-IN");
  return (
    <div
      className="admin-fade-up group rounded-2xl border border-turf/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-turf/25 hover:bg-white/[0.05] hover:shadow-[0_12px_40px_rgba(60,235,120,0.08)]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-zinc-400">{stat.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {stat.prefix}
            {display}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-turf/20 bg-turf/10 text-turf">
          <stat.icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-turf/25 bg-turf/10 px-2 py-0.5 font-semibold text-turf">
          <TrendingUp className="h-3.5 w-3.5" />
          {stat.delta}
        </span>
        <span className="text-zinc-500">vs last week</span>
      </div>
    </div>
  );
}

function ChartPanel() {
  const [range, setRange] = useState<RangeKey>("Week");
  const data = chartRanges[range];
  const total = data.reduce((acc, d) => acc + d.bookings, 0);

  return (
    <div className="admin-fade-up rounded-2xl border border-turf/10 bg-white/[0.03] p-5" style={{ animationDelay: "160ms" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Booking Overview</h3>
          <p className="mt-0.5 text-sm text-zinc-400">{range} bookings across all turfs</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-turf/15 bg-night-soft/60 p-1">
          {(Object.keys(chartRanges) as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r ? "bg-turf/20 text-turf" : "text-zinc-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <p className="text-4xl font-bold tracking-tight text-white">{total}</p>
        <span className="mb-1 text-sm text-turf">bookings</span>
      </div>

      <div key={range} className="admin-chart-in mt-2 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ceb78" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3ceb78" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: "rgba(60,235,120,0.4)", strokeDasharray: "4 4" }}
              contentStyle={{
                background: "#0b0f0e",
                border: "1px solid rgba(60,235,120,0.3)",
                borderRadius: 12,
                color: "#ffffff",
              }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#3ceb78"
              strokeWidth={2.5}
              fill="url(#adminChartFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#3ceb78", stroke: "#0b0f0e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-turf/15 bg-turf/[0.05] px-3 py-2.5 text-xs text-zinc-300">
        <Activity className="h-4 w-4 shrink-0 text-turf" />
        <span>Weekday evening slots are the most booked. Peak demand is between 6 PM – 9 PM.</span>
      </div>
    </div>
  );
}

function QuickActionsPanel({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const actions: Array<{ label: string; desc: string; icon: LucideIcon; view: ViewKey }> = [
    { label: "View Bookings", desc: "Manage today's bookings", icon: CalendarCheck, view: "bookings" },
    { label: "Manage Customers", desc: "Search customer profiles", icon: Users, view: "customers" },
  ];

  return (
    <div className="admin-fade-up flex flex-col rounded-2xl border border-turf/10 bg-white/[0.03] p-5" style={{ animationDelay: "220ms" }}>
      <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      <p className="mt-0.5 text-sm text-zinc-400">Shortcuts to common tasks</p>
      <div className="mt-4 grid flex-1 gap-2.5">
        {actions.map((a, i) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onNavigate(a.view)}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-turf/30 hover:bg-turf/[0.06]"
            style={{ animationDelay: `${240 + i * 60}ms` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-turf/20 bg-turf/10 text-turf transition-transform group-hover:scale-110">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">{a.label}</span>
              <span className="block truncate text-xs text-zinc-500">{a.desc}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-turf" />
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentBookingsTable() {
  return (
    <div className="admin-fade-up rounded-2xl border border-turf/10 bg-white/[0.03] p-5" style={{ animationDelay: "280ms" }}>
      <PanelHeader
        title="Recent Bookings"
        subtitle="Latest booking activity across all turfs"
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Booking ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Turf</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentBookings.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-4">
                  <span className="font-semibold text-turf">{b.id}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Avatar name={b.customer} />
                    <span className="font-medium text-white">{b.customer}</span>
                  </span>
                </td>
                <td className="px-4 py-4 text-zinc-300">{b.turf}</td>
                <td className="px-4 py-4 text-zinc-400">{b.date}</td>
                <td className="px-4 py-4 text-zinc-400">{b.time}</td>
                <td className="px-4 py-4 font-medium text-white">{b.amount}</td>
                <td className="px-4 py-4">
                  <StatusBadge label={b.status} tone={bookingTone[b.status]} />
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center justify-end gap-2">
                    <RowAction icon={Eye} label="View booking" />
                    <RowAction icon={Pencil} label="Edit booking" />
                    <RowAction icon={X} label="Cancel booking" tone="rose" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerManagementTable() {
  return (
    <div className="admin-fade-up rounded-2xl border border-turf/10 bg-white/[0.03] p-5" style={{ animationDelay: "400ms" }}>
      <PanelHeader
        title="Customer Management"
        subtitle="Browse, search and manage customer profiles"
        action={
          <span className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-turf/15 bg-white/[0.03] px-3 py-2 text-sm text-zinc-400 sm:inline-flex">
              <Search className="h-4 w-4" />
              <input
                type="search"
                placeholder="Search customers..."
                className="w-36 bg-transparent text-sm outline-none placeholder:text-zinc-600"
              />
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-4 py-2 text-sm font-medium text-turf transition-colors hover:bg-turf/20"
            >
              Filter
            </button>
          </span>
        }
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-turf/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Bookings</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c) => (
              <tr key={c.email} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Avatar name={c.name} />
                    <span className="font-medium text-white">{c.name}</span>
                  </span>
                </td>
                <td className="px-4 py-4 text-zinc-400">{c.email}</td>
                <td className="px-4 py-4 text-zinc-400">{c.phone}</td>
                <td className="px-4 py-4 text-zinc-300">{c.bookings}</td>
                <td className="px-4 py-4 font-medium text-white">{c.spent}</td>
                <td className="px-4 py-4">
                  <StatusBadge label={c.status} tone={customerTone[c.status]} />
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-turf/25 bg-turf/10 px-3 py-1.5 text-xs font-medium text-turf transition-colors hover:bg-turf/20"
                  >
                    View Customer
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlaceholderPanel({ title, icon: Icon, desc }: { title: string; icon: LucideIcon; desc: string }) {
  return (
    <div className="admin-fade-up relative overflow-hidden rounded-2xl border border-turf/10 bg-white/[0.03] p-10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-turf/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-turf/5 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center justify-center py-12 text-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-turf/20 blur-2xl" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-turf/25 bg-turf/10 text-turf">
            <Icon className="h-7 w-7" />
          </span>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-zinc-400">{desc}</p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/10 px-5 py-2.5 text-sm font-medium text-turf transition-colors hover:bg-turf/20"
        >
          Coming soon
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <div className="space-y-5">
      <div className="admin-fade-up">
        <p className="text-sm text-turf">Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Good Morning, Admin</h2>
        <p className="mt-1 text-sm text-zinc-400">Here's what's happening with TurfOn24 today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartPanel />
        </div>
        <QuickActionsPanel onNavigate={onNavigate} />
      </div>

      <RecentBookingsTable />
      <CustomerManagementTable />
    </div>
  );
}

function SidebarContent({
  view,
  onNavigate,
}: {
  view: ViewKey;
  onNavigate: (v: ViewKey) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <a href="/" className="flex items-center gap-3 px-4 pt-6 lg:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-turf/30 bg-turf/10 text-lg font-bold text-turf">
          T
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block truncate text-sm font-bold text-white">TurfOn24</span>
          <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-turf/70">Admin Panel</span>
        </span>
      </a>

      <nav className="mt-8 flex flex-1 flex-col gap-1 px-3 lg:px-4">
        {navItems.map((item) => {
          const active = view === item.id;
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
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-turf" />
              )}
              <item.icon className="h-5 w-5 shrink-0" />
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
            <p className="truncate text-sm font-semibold text-white">Admin</p>
            <p className="truncate text-xs text-zinc-500">admin@turfon24.com</p>
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

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigate = (v: ViewKey) => {
    setView(v);
    setMobileOpen(false);
  };

  const viewTitle: Record<ViewKey, string> = {
    dashboard: "Dashboard",
    bookings: "Bookings",
    customers: "Customers",
    messages: "Messages",
    settings: "Settings",
  };

  return (
    <div className="min-h-screen bg-night-soft text-zinc-200">
      {/* Desktop / tablet sidebar */}
      <aside className="admin-sidebar-in fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col border-r border-turf/10 bg-white/[0.03] backdrop-blur-xl transition-[width] duration-300 md:flex lg:w-[268px]">
        <SidebarContent view={view} onNavigate={navigate} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="admin-drawer-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="admin-drawer absolute left-0 top-0 h-full w-[280px] border-r border-turf/10 bg-night-soft/95 backdrop-blur-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-turf/40 hover:text-turf"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent view={view} onNavigate={navigate} />
          </aside>
        </div>
      )}

      {/* Main column */}
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

          <span className="flex items-center gap-2 rounded-full border border-turf/15 bg-white/[0.03] px-3 py-2 text-sm text-zinc-500 sm:flex">
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
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-white/[0.03] text-zinc-300 transition-colors hover:border-turf/40 hover:text-turf"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-turf ring-2 ring-night-soft" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-turf/20 bg-white/[0.03] py-1 pl-1 pr-3 transition-colors hover:border-turf/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-turf/15 text-xs font-bold text-turf">
                A
              </span>
              <span className="hidden text-sm font-medium text-white sm:block">Admin</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {view === "dashboard" && <DashboardView onNavigate={navigate} />}

          {view === "bookings" && (
            <div className="space-y-5">
              <div className="admin-fade-up">
                <p className="text-sm text-turf">Bookings</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">All Bookings</h2>
                <p className="mt-1 text-sm text-zinc-400">Manage, reschedule and cancel bookings across all turfs.</p>
              </div>
              <RecentBookingsTable />
            </div>
          )}

          {view === "customers" && (
            <div className="space-y-5">
              <div className="admin-fade-up">
                <p className="text-sm text-turf">Customers</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Customer Management</h2>
                <p className="mt-1 text-sm text-zinc-400">Search profiles, track spending and view booking history.</p>
              </div>
              <CustomerManagementTable />
            </div>
          )}

          {view === "messages" && (
            <div className="space-y-5">
              <div className="admin-fade-up">
                <p className="text-sm text-turf">Messages</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Messages</h2>
                <p className="mt-1 text-sm text-zinc-400">Respond to customer enquiries and booking requests.</p>
              </div>
              <PlaceholderPanel
                title="Messages Module"
                icon={MessageSquare}
                desc="Respond to customer enquiries and booking requests from one inbox."
              />
            </div>
          )}

          {view === "settings" && (
            <div className="space-y-5">
              <div className="admin-fade-up">
                <p className="text-sm text-turf">Settings</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Settings</h2>
                <p className="mt-1 text-sm text-zinc-400">Manage your account, notifications and business details.</p>
              </div>
              <PlaceholderPanel
                title="Settings Module"
                icon={Settings}
                desc="Manage account preferences, notifications and business details."
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
