import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-turf/15 bg-night-soft/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">
            Turf<span className="text-turf">On</span>24
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Floodlit football turfs available round the clock. Book by the hour or take the whole
            ground for a full day.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li><a href="#features" className="hover:text-turf">Features</a></li>
            <li><a href="#pricing" className="hover:text-turf">Pricing</a></li>
            <li><a href="#about" className="hover:text-turf">About Us</a></li>
            <li><a href="#contact" className="hover:text-turf">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Hours</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>Mon – Fri · 24 hours</li>
            <li>Sat – Sun · 24 hours</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Reach Us</p>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-turf" /> Sector 12, Sports City
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-turf" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-turf" /> play@turfon24.com
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-turf/10 px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TurfOn24. All rights reserved.
      </div>
    </footer>
  );
}
