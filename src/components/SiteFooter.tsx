import {
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import taglineImg from "@/assets/Tagline.png";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-turf/15 bg-night-soft/30 backdrop-blur-xl">
      <div className="mx-0 grid w-full gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1.4fr_0.8fr] lg:gap-x-6 lg:pr-48">
        <div className="flex max-w-[180px] flex-col items-start">
          <img
            src={taglineImg}
            alt="TurfOn24 - Your Turf. Your Time. Your Game."
            className="h-auto w-36 object-contain"
          />
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            24/7 Football Turf
            <span className="mt-1 block normal-case tracking-normal text-foreground/60">
              Cuddalore
            </span>
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li><a href="#features" className="!text-white hover:!text-turf">Features</a></li>
            <li><a href="#pricing" className="!text-white hover:!text-turf">Pricing</a></li>
            <li><a href="#about" className="!text-white hover:!text-turf">About Us</a></li>
            <li><a href="#contact" className="!text-white hover:!text-turf">Contact</a></li>
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
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
              <span>
                Periya Kanganankuppam
                <span className="block">Behind KUN Hyundai</span>
                <span className="block">Cuddalore - 607002</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan" /> 89399 89366
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan" /> play@turfon24.com
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-turf">Follow Us</p>
          <div className="mt-4 flex flex-nowrap gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-turf/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-turf/60 hover:bg-turf/15 hover:text-turf hover:shadow-[0_0_18px_rgba(57,255,122,0.25)]"
            >
              <Instagram className="h-4 w-4 text-cyan transition-transform duration-300 group-hover:scale-110" />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-turf/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-turf/60 hover:bg-turf/15 hover:text-turf hover:shadow-[0_0_18px_rgba(57,255,122,0.25)]"
            >
              <Youtube className="h-4 w-4 text-cyan transition-transform duration-300 group-hover:scale-110" />
            </a>
            <a
              href="https://wa.me/918939989366"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-turf/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-turf/60 hover:bg-turf/15 hover:text-turf hover:shadow-[0_0_18px_rgba(57,255,122,0.25)]"
            >
              <MessageCircle className="h-4 w-4 text-cyan transition-transform duration-300 group-hover:scale-110" />
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Periya+Kanganankuppam+Cuddalore"
              target="_blank"
              rel="noreferrer"
              aria-label="Google Maps"
              title="Google Maps"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-turf/20 bg-turf/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-turf/60 hover:bg-turf/15 hover:text-turf hover:shadow-[0_0_18px_rgba(57,255,122,0.25)]"
            >
              <MapPin className="h-4 w-4 text-cyan transition-transform duration-300 group-hover:scale-110" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-turf/10 px-6 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TurfOn24. All rights reserved.
      </div>
    </footer>
  );
}
