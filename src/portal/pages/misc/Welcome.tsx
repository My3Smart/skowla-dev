import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMetronic } from "@/portal/useMetronic";
import heroImg from "@/assets/landing/student-smile.png";
import aduanImg from "@/assets/landing/aduan.jpg";
import devicesImg from "@/assets/landing/devices.jpg";
import { Users, CalendarCheck, Wallet, Store, BarChart3, ShieldCheck, Cloud, Star, Clock, Headphones, RefreshCw, UsersRound, Play, ArrowRight, Check as CheckIco } from "lucide-react";
import owlImg from "@/assets/landing/owl.png";
import trustBg from "@/assets/landing/trustbg.jpg";
import av1 from "@/assets/landing/av1.jpg";
import av2 from "@/assets/landing/av2.jpg";
import av3 from "@/assets/landing/av3.jpg";
import skowlaLogo from "@/assets/landing/skowla-logo.png";

const SKOOLA_LOGO = "/assets/landing/skowla-logo.png";
const COMPANY_LOGO = "/assets/landing/My3SmartDigital-logo.png";

const BLUE = "#1570EF";
const NAVY = "#0B1B4D";
const PURPLE = "#7C3AED";

const NAV = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["How It Works", "#app"],
  ["Pricing", "#pricing"],
  ["About Us", "#team"],
  ["Contact", "#contact"],
];

const SOLUTIONS = [
  { icon: Users, color: "#16A34A", bg: "#DCFCE7", title: "School Management", desc: "Manage students, classes, parents and staff with ease." },
  { icon: CalendarCheck, color: "#1570EF", bg: "#DBEAFE", title: "Attendance System", desc: "Track attendance with cards or PIN." },
  { icon: Wallet, color: "#EA580C", bg: "#FFEDD5", title: "Cashless Payment", desc: "Safe, fast and convenient student wallet & POS." },
  { icon: Store, color: "#7C3AED", bg: "#F3E8FF", title: "POS System", desc: "Pre-order, cafeteria and retail payments." },
  { icon: BarChart3, color: "#0891B2", bg: "#CFFAFE", title: "Reports & Analytics", desc: "Get real-time insights and detailed reports." },
];

const ADUAN = [
  ["Anonymous Reporting", "Safe and confidential"],
  ["Quick Response", "Your report gets attention"],
  ["Support & Follow Up", "We're here to help"],
  ["A Safer School", "For every student"],
];

const APP_POINTS = [
  "Real-time updates & notifications",
  "Easy access to school services",
  "Secure and role-based access",
  "Available on iOS and Android",
];

const PLAN = ["All core features included", "Unlimited students & staff", "Lifetime updates & support", "No recurring fees"];

const STATS = [
  [ShieldCheck, "100%", "Data Security"],
  [Clock, "99.9%", "System Uptime"],
  [Headphones, "24/7", "Support"],
  [UsersRound, "Growing", "School Community"],
] as const;

const TEAM = [
  { name: "Puan Nuradiana Kamarudin", role: "Managing Director & Business Development", image: "/assets/media/team/nuradiana-kamarudin.jpeg" },
  { name: "En Shyful Izzudeen", role: "Managing Director & Creative Director", image: "/assets/media/team/en-shyful.jpeg" },
  { name: "En Muhamad Danieal Azim", role: "Head Programmer", image: "/assets/media/team/danieal-azim.jpeg" },
  { name: "Cik Nurhanisa Hanim", role: "Junior Programmer", image: "/assets/media/team/nurhanisa-hanim.jpeg" },
];

const TESTIMONIALS = [
  ["Skowla has made our school operations so much easier. The attendance and payment system is simple and reliable.", "Pn. Siti Aishah", "Principal, SK Seri Murni"],
  ["The parent portal keeps us connected and informed. It's user-friendly and very helpful for our school.", "En. Rahim", "Teacher, SMK Taman Jaya"],
  ["My child loves using the card for payment and attendance. It's fast, safe and very convenient!", "Pn. Farhana", "Parent, Selangor"],
];

const Check = ({ color = "#16A34A" }: { color?: string }) => (
  <span className="d-inline-flex flex-center rounded-circle me-3 flex-shrink-0" style={{ width: 20, height: 20, background: color, color: "#fff" }}><CheckIco size={12} strokeWidth={3} /></span>
);

const Eyebrow = ({ children, color = BLUE }: { children: React.ReactNode; color?: string }) => (
  <div className="fw-bold fs-8 text-uppercase mb-2" style={{ color, letterSpacing: 1.2 }}>{children}</div>
);

const MY: Record<string, string> = {
  "Home": "Utama",
  "Features": "Ciri-ciri",
  "How It Works": "Cara Ia Berfungsi",
  "Pricing": "Harga",
  "About Us": "Tentang Kami",
  "Contact": "Hubungi",
  "School Management": "Pengurusan Sekolah",
  "Manage students, classes, parents and staff with ease.": "Urus murid, kelas, ibu bapa dan kakitangan dengan mudah.",
  "Attendance System": "Sistem Kehadiran",
  "Track attendance with cards or PIN.": "Rekod kehadiran menggunakan kad atau PIN.",
  "Cashless Payment": "Pembayaran Tanpa Tunai",
  "Safe, fast and convenient student wallet & POS.": "Dompet murid & POS yang selamat, pantas dan mudah.",
  "POS System": "Sistem POS",
  "Pre-order, cafeteria and retail payments.": "Pra-tempahan, kantin dan pembayaran runcit.",
  "Reports & Analytics": "Laporan & Analitik",
  "Get real-time insights and detailed reports.": "Dapatkan maklumat masa nyata dan laporan terperinci.",
  "Anonymous Reporting": "Laporan Tanpa Nama",
  "Safe and confidential": "Selamat dan sulit",
  "Quick Response": "Tindakan Pantas",
  "Your report gets attention": "Laporan anda diberi perhatian",
  "Support & Follow Up": "Sokongan & Susulan",
  "We're here to help": "Kami sedia membantu",
  "A Safer School": "Sekolah Lebih Selamat",
  "For every student": "Untuk setiap murid",
  "Real-time updates & notifications": "Kemas kini & notifikasi masa nyata",
  "Easy access to school services": "Akses mudah ke perkhidmatan sekolah",
  "Secure and role-based access": "Akses selamat mengikut peranan",
  "Available on iOS and Android": "Tersedia di iOS dan Android",
  "All core features included": "Semua ciri utama disertakan",
  "Unlimited students & staff": "Murid & kakitangan tanpa had",
  "Lifetime updates & support": "Kemas kini & sokongan seumur hidup",
  "No recurring fees": "Tiada yuran berulang",
  "Data Security": "Keselamatan Data",
  "System Uptime": "Masa Operasi Sistem",
  "Support": "Sokongan",
  "Growing": "Berkembang",
  "School Community": "Komuniti Sekolah",
  "Managing Director & Business Development": "Pengarah Urusan & Pembangunan Perniagaan",
  "Managing Director & Creative Director": "Pengarah Urusan & Pengarah Kreatif",
  "Head Programmer": "Ketua Pengaturcara",
  "Junior Programmer": "Pengaturcara Junior",
  "Skowla has made our school operations so much easier. The attendance and payment system is simple and reliable.": "Skowla menjadikan operasi sekolah kami jauh lebih mudah. Sistem kehadiran dan pembayarannya ringkas dan boleh dipercayai.",
  "The parent portal keeps us connected and informed. It's user-friendly and very helpful for our school.": "Portal ibu bapa memastikan kami sentiasa berhubung dan dimaklumkan. Mudah digunakan dan sangat membantu sekolah kami.",
  "My child loves using the card for payment and attendance. It's fast, safe and very convenient!": "Anak saya suka menggunakan kad untuk pembayaran dan kehadiran. Pantas, selamat dan sangat mudah!",
  "Principal, SK Seri Murni": "Guru Besar, SK Seri Murni",
  "Teacher, SMK Taman Jaya": "Guru, SMK Taman Jaya",
  "Parent, Selangor": "Ibu Bapa, Selangor",
  "Login": "Log Masuk",
  "Get Started": "Mulakan",
  "Smart School Management System": "Sistem Pengurusan Sekolah Pintar",
  "Smarter Schools.": "Sekolah Lebih Pintar.",
  "Brighter Futures.": "Masa Depan Lebih Cerah.",
  "Skowla brings together school management, attendance, cashless payments and more all in one simple, powerful platform.": "Skowla menghimpunkan pengurusan sekolah, kehadiran, pembayaran tanpa tunai dan banyak lagi — dalam satu platform yang ringkas dan berkuasa.",
  "Get Started →": "Mulakan Percuma →",
  "Watch Demo": "Tonton Demo",
  "Secure": "Selamat",
  "& Reliable": "& Boleh Dipercayai",
  "Cloud + Local": "Awan + Tempatan",
  "(Offline Ready)": "(Sedia Luar Talian)",
  "Trusted by": "Dipercayai oleh",
  "Schools": "Sekolah",
  "Our Solutions": "Penyelesaian Kami",
  "Everything Your School Needs": "Semua Keperluan Sekolah Anda",
  "From student management to cashless payments, Skowla makes school operations simpler, faster and more efficient.": "Daripada pengurusan murid hingga pembayaran tanpa tunai, Skowla menjadikan operasi sekolah lebih mudah, pantas dan cekap.",
  "Report incidents, bullying, or concerns anonymously. Help us keep your school safe, supportive and caring for everyone.": "Laporkan insiden, buli atau kebimbangan secara tanpa nama. Bantu kami memastikan sekolah anda selamat, menyokong dan prihatin untuk semua.",
  "Report Now →": "Lapor Sekarang →",
  "Speak Up.": "Bersuara.",
  "Make a": "Lakukan",
  "Difference": "Perubahan",
  "Skowla App": "Aplikasi Skowla",
  "Simple. Connected.": "Mudah. Berhubung.",
  "Built for Schools.": "Dibina untuk Sekolah.",
  "The Skowla mobile app keeps your school community connected anytime, anywhere.": "Aplikasi mudah alih Skowla memastikan komuniti sekolah anda sentiasa berhubung — bila-bila masa, di mana sahaja.",
  "Download on App Store →": "Muat Turun di App Store →",
  "Flexible Plans, Maximum Value": "Pelan Fleksibel, Nilai Maksimum",
  "Everything you need for a smarter, safer and more connected school at a price that works.": "Semua yang anda perlukan untuk sekolah yang lebih pintar, selamat dan berhubung — pada harga yang berpatutan.",
  "★ Most Popular": "★ Paling Popular",
  "Lifetime Plan": "Pelan Seumur Hidup",
  " / Lifetime": " / Seumur Hidup",
  "Get Started Now →": "Mulakan Sekarang →",
  "One Time Payment,": "Bayaran Sekali,",
  "Lifetime Access!": "Akses Seumur Hidup!",
  "(One-time payment)": "(Bayaran sekali sahaja)",
  "Full features": "Ciri penuh",
  "(For life)": "(Seumur hidup)",
  "Regular updates": "Kemas kini berkala",
  "(Always improving)": "(Sentiasa ditambah baik)",
  "Trusted by Schools": "Dipercayai oleh Sekolah",
  "A Platform You Can Rely On": "Platform Yang Boleh Anda Harapkan",
  "Skowla is built with security, stability and scalability in mind. Helping schools manage their daily operations with confidence.": "Skowla dibina dengan mengutamakan keselamatan, kestabilan dan kebolehskalaan. Membantu sekolah mengurus operasi harian dengan yakin.",
  "The Team Behind Skowla": "Pasukan di Sebalik Skowla",
  "Built by Educators, Developers and Dreamers": "Dibina oleh Pendidik, Pembangun dan Pemimpi",
  "A passionate team with a shared vision — to create a safer, smarter and brighter future for every school.": "Pasukan yang bersemangat dengan visi bersama — mencipta masa depan yang lebih selamat, pintar dan cerah untuk setiap sekolah.",
  "What Schools Say": "Kata Sekolah",
  "Trusted by Educators Across Malaysia": "Dipercayai oleh Pendidik di Seluruh Malaysia",
  "Together for a": "Bersama untuk",
  "brighter future": "masa depan cerah",
  "Ready to Build a Smarter School?": "Sedia Membina Sekolah Lebih Pintar?",
  "Join thousands of schools already using Skowla.": "Sertai ribuan sekolah yang sudah menggunakan Skowla.",
  "Smarter Schools. Brighter Futures.": "Sekolah Lebih Pintar. Masa Depan Lebih Cerah.",
  "Products": "Produk",
  "Mobile App": "Aplikasi Mudah Alih",
  "Blog": "Blog",
  "Company": "Syarikat",
  "Careers": "Kerjaya",
  "Privacy": "Privasi",
  "Help Center": "Pusat Bantuan",
  "Documentation": "Dokumentasi",
  "FAQs": "Soalan Lazim",
  "Terms of Service": "Terma Perkhidmatan",
  "All rights reserved.": "Hak cipta terpelihara."
};
let LANG: "en" | "my" = "en";
const T = (s: string) => (LANG === "my" ? MY[s] ?? s : s);

// const LOGIN_URL = (() => { const h = typeof window !== "undefined" ? window.location.hostname : ""; return h === "skowla.com" || h.endsWith(".skowla.com") || h === "skoola.my" || h.endsWith(".skoola.my") ? "https://login.skowla.com/" : "/login"; })();
const LOGIN_URL = "/login";
export default function Welcome() {
  const ready = useMetronic();
  const [lang, setLang] = useState<"en" | "my">(() => (localStorage.getItem("landing_lang") === "my" ? "my" : "en"));
  LANG = lang;
  const toggleLang = () => { const n = lang === "en" ? "my" : "en"; localStorage.setItem("landing_lang", n); setLang(n); };
  useEffect(() => { document.documentElement.lang = lang === "my" ? "ms" : "en"; }, [lang]);

  useEffect(() => {
    document.title = "Skowla — Smarter Schools. Brighter Futures.";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Skowla brings together school management, attendance, cashless payments and more all in one simple, powerful platform.",
    );
  }, []);

  if (!ready) return <div className="min-vh-100 d-flex flex-center text-muted">Memuatkan…</div>;

  const pill = { borderRadius: 999 } as const;
  const script = { fontFamily: "'Caveat', cursive", fontWeight: 700, lineHeight: 1.1 } as const;

  return (
    <div className="d-flex flex-column flex-root" style={{ background: "#fff", color: NAVY }} id="kt_app_root">
      {/* Header */}
      <header className="w-100 bg-white shadow-sm" style={{ position: "sticky", top: 0, zIndex: 30 }}>
        <div className="container d-flex align-items-center justify-content-between py-2">
          <a href="#home"><img src={skowlaLogo} alt="Skowla" style={{ height: 34, width: "auto" }} /></a>
          <nav className="d-none d-lg-flex gap-7">
            {NAV.map(([l, h]) => (
              <a key={l} href={h} className="fw-semibold fs-7 text-decoration-none" style={{ color: l === "Home" ? BLUE : NAVY }}>{T(l)}</a>
            ))}
          </nav>
          <div className="d-flex align-items-center gap-3">
            <button type="button" onClick={toggleLang} aria-label="Tukar bahasa / Switch language" className="btn btn-sm fw-bold p-0 d-flex overflow-hidden" style={{ ...pill, border: `1.5px solid ${BLUE}`, fontSize: 12, lineHeight: 1 }}>
              <span className="px-3 py-2" style={{ background: lang === "my" ? BLUE : "transparent", color: lang === "my" ? "#fff" : BLUE }}>MY</span>
              <span className="px-3 py-2" style={{ background: lang === "en" ? BLUE : "transparent", color: lang === "en" ? "#fff" : BLUE }}>EN</span>
            </button>
            <a href={LOGIN_URL} className="fw-semibold fs-7 text-decoration-none px-3" style={{ color: BLUE }}>{T("Login")}</a>
            <Link to="/register" className="btn btn-sm fw-bold text-white px-5 text-nowrap" style={{ ...pill, background: BLUE }}>{T("Get Started")} <ArrowRight size={14} /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="position-relative overflow-hidden" style={{ background: "linear-gradient(90deg,#F3F8FF 45%,#E6F0FF)" }}>
        <img src={heroImg} alt="Students using Skowla" className="d-none d-lg-block position-absolute top-0 end-0 h-100" style={{ width: "51%", objectFit: "cover", objectPosition: "left center" }} />
        <div className="container py-12 position-relative">
          <div className="row align-items-center g-10" style={{ minHeight: 420 }}>
            <div className="col-lg-6">
              <Eyebrow>{T("Smart School Management System")}</Eyebrow>
              <h1 className="fw-bolder mb-5" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.1, color: NAVY }}>
                {T("Smarter Schools.")}<br />{T("Brighter Futures.")}
              </h1>
              <p className="fs-5 text-gray-700 mb-8" style={{ maxWidth: 460 }}>
                {T("Skowla brings together school management, attendance, cashless payments and more all in one simple, powerful platform.")}
              </p>
              <div className="d-flex flex-wrap gap-3 mb-10">
                <Link to="/register" className="btn fw-bold text-white px-7 text-nowrap" style={{ ...pill, background: BLUE }}>{T("Get Started →")}</Link>
                <a href="#app" className="btn fw-bold px-7 text-nowrap" style={{ ...pill, border: `1.5px solid ${BLUE}`, color: BLUE }}><Play size={13} className="me-1" fill="currentColor" /> {T("Watch Demo")}</a>
              </div>
              <div className="d-flex flex-wrap gap-8">
                {([[ShieldCheck, "Secure", "& Reliable"], [Cloud, "Cloud + Local", "(Offline Ready)"], [Star, "Trusted by", "Schools"]] as const).map(([I, a, b]) => (
                  <div key={a} className="d-flex align-items-center gap-2">
                    <span className="d-flex flex-center rounded-circle" style={{ width: 38, height: 38, background: "#E0F2FE", color: BLUE }}><I size={18} /></span>
                    <span className="fs-8 text-gray-700 lh-sm">{T(a)}<br />{T(b)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 d-lg-none"><img src={heroImg} alt="Students using Skowla" className="w-100 rounded-3" /></div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="features" className="py-10">
        <div className="container text-center">
          <Eyebrow>{T("Our Solutions")}</Eyebrow>
          <h2 className="fw-bolder fs-2hx mb-3" style={{ color: NAVY }}>{T("Everything Your School Needs")}</h2>
          <p className="text-gray-600 fs-6 mx-auto mb-12" style={{ maxWidth: 560 }}>
            {T("From student management to cashless payments, Skowla makes school operations simpler, faster and more efficient.")}
          </p>
          <div className="row g-6 justify-content-center">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="col-6 col-md-4 col-lg" style={{ borderRight: "1px solid #EEF2F7" }}>
                <div className="d-flex flex-center rounded-circle mx-auto mb-4" style={{ width: 72, height: 72 }}><span className="d-flex flex-center rounded-circle" style={{ width: 72, height: 72, background: s.bg, color: s.color }}><s.icon size={32} strokeWidth={1.8} /></span></div>
                <div className="fw-bold fs-6 mb-2">{T(s.title)}</div>
                <div className="fs-7 text-gray-600">{T(s.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
{/* Aduan */}
<section className="pb-10">
  <div className="container">
    <div
      className="rounded-4 p-8 p-lg-8"
      style={{
        background: "linear-gradient(90deg,#F3EEFF,#EDE9FE)",
      }}
    >
      <div className="row align-items-center g-6">

        {/* Left - Aduan Information */}
        <div className="col-12 col-lg-5">
          <div
            className="fw-bolder fs-3 mb-2"
            style={{
              color: PURPLE,
              letterSpacing: 1,
            }}
          >
            <ShieldCheck
              size={26}
              className="me-2"
              style={{ verticalAlign: "-4px" }}
            />
            ADUAN
          </div>

          <h2
            className="fw-bolder fs-2x mb-4"
            style={{ color: "#3B2A8C" }}
          >
            A Safer School Starts with a Voice
          </h2>

          <p className="text-gray-700 fs-6 mb-6">
            {T(
              "Report incidents, bullying, or concerns anonymously. Help us keep your school safe, supportive and caring for everyone."
            )}
          </p>

          <a
            href={LOGIN_URL}
            className="btn fw-bold text-white px-7 text-nowrap"
            style={{
              ...pill,
              background: PURPLE,
            }}
          >
            {T("Report Now →")}
          </a>
        </div>

        {/* Middle - Schoolgirl Image */}
        <div className="col-12 col-md-5 col-lg-3 text-center">
          <img
            src="/assets/media/auth/school-girl.png"
            alt="Skowla student"
            loading="lazy"
            className="img-fluid"
            style={{
              width: "100%",
              maxWidth: 280,
              height: "auto",
              objectFit: "contain",
              borderRadius: 16,
              maskImage:
                "linear-gradient(to bottom, black 80%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 80%, transparent 100%)",
            }}
          />
        </div>

        {/* Right - Features and Decorative Text */}
        <div className="col-12 col-md-7 col-lg-4">

          {/* Aduan Features */}
          <div className="d-flex flex-column gap-3">
            {ADUAN.map(([t, d]) => (
              <div
                key={t}
                className="d-flex align-items-start gap-3"
              >
                <Check
                  size={22}
                  color={PURPLE}
                  className="flex-shrink-0"
                />

                <div>
                  <div className="fw-bold fs-6">
                    {T(t)}
                  </div>

                  <div className="fs-7 text-gray-600">
                    {T(d)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Speak Up Text */}
          <div
            className="d-none d-lg-block mt-5"
            style={{
              ...script,
              color: PURPLE,
              fontSize: 27,
              lineHeight: 1.25,
              transform: "rotate(-4deg)",
              transformOrigin: "left center",
            }}
          >
            {T("Speak Up.")}{" "}
            {T("Make a Difference")}
            <span style={{ color: "#EC4899" }}>
              {" "}♡
            </span>
          </div>

        </div>

      </div>
    </div>
  </div>
</section>


      
{/* App */}
<section
  id="app"
  className="py-10"
  style={{ background: "#F8FBFF" }}
>
  <div className="container">
    <div className="row align-items-center g-10">

      {/* Left - App Information */}
      <div className="col-lg-5">
        <Eyebrow>{T("Skowla App")}</Eyebrow>

        <h2 className="fw-bolder fs-2x mb-4">
          {T("Simple. Connected.")}
          <br />
          {T("Built for Schools.")}
        </h2>

        <p className="text-gray-700 fs-6 mb-6">
          {T(
            "The Skowla mobile app keeps your school community connected anytime, anywhere."
          )}
        </p>

        {APP_POINTS.map((p) => (
          <div
            key={p}
            className="d-flex align-items-center gap-2 mb-3 fs-6"
          >
            <Check color={BLUE} />
            {T(p)}
          </div>
        ))}

        <Link
          to="/register"
          className="btn fw-bold text-white px-7 mt-5"
          style={{
            ...pill,
            background: BLUE,
          }}
        >
          {T("Download on App Store →")}
        </Link>
      </div>

      
{/* Right - Dashboard Image */}
<div className="col-lg-7 text-center">
  <img
    src="/assets/media/auth/dashboard-dummy.png"
    alt="Skowla dashboard on phone and laptop"
    loading="lazy"
    className="img-fluid"
    style={{
      width: "100%",
      maxWidth: 550,
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>


    </div>
  </div>
</section>


      
{/* Pricing */}
<section
  id="pricing"
  className="py-10"
  style={{ background: "#F5F9FF" }}
>
  <div className="container">

    {/* Section Header */}
    <div className="text-center">
      <Eyebrow>{T("Pricing")}</Eyebrow>

      <h2 className="fw-bolder fs-2x mb-2">
        {T("Flexible Plans, Maximum Value")}
      </h2>

      <p className="text-gray-600 fs-7 mb-10">
        {T(
          "Everything you need for a smarter, safer and more connected school at a price that works."
        )}
      </p>
    </div>

    <div className="row align-items-center g-4">

      {/* Left - Pricing Card */}
      <div className="col-lg-5">
        <div
          className="rounded-4 p-8 bg-white"
          style={{
            border: "1.5px solid #BFDBFE",
            boxShadow: "0 10px 30px rgba(21,112,239,.08)",
          }}
        >
          {/* Most Popular Badge */}
          <span
            className="badge text-white fw-bold mb-4 px-3 py-2"
            style={{
              ...pill,
              background: BLUE,
            }}
          >
            {T("★ Most Popular")}
          </span>

          {/* Plan Name */}
          <div className="fw-bold fs-4 mb-1">
            {T("Lifetime Plan")}
          </div>

          {/* Price */}
          <div className="mb-5">
            <span
              className="fw-bolder"
              style={{
                fontSize: 40,
                color: "#1E293B",
              }}
            >
              RM 30
            </span>

            <span className="fs-5 text-gray-600">
              {T(" / Lifetime")}
            </span>
          </div>

          {/* Plan Features */}
          {PLAN.map((p) => (
            <div
              key={p}
              className="d-flex align-items-center gap-2 mb-3 fs-6"
            >
              <Check
                size={20}
                color={BLUE}
                className="flex-shrink-0"
              />
              <span>{T(p)}</span>
            </div>
          ))}

          {/* Register Button */}
          <Link
            to="/register"
            className="btn w-100 fw-bold text-white mt-5"
            style={{
              ...pill,
              background: BLUE,
            }}
          >
            {T("Get Started Now →")}
          </Link>
        </div>
      </div>

      {/* Right - Payment Message & Benefits */}
      <div className="col-lg-7">

        {/* Payment Message - Outside Card */}
        <div
          className="d-flex align-items-center justify-content-start gap-2 mb-8"
          style={{
            paddingLeft: 0,
          }}
        >
          {/* Curved Arrow Pointing to Price Card */}
          <svg
            width="65"
            height="60"
            viewBox="0 0 90 60"
            fill="none"
            stroke={BLUE}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              flexShrink: 0,
              transform: "rotate(10deg)",
            }}
          >
            <path d="M85 12 C55 0,25 15,10 45" />
            <path d="M4 34 L10 46 L22 40" />
          </svg>

          {/* Handwritten Text */}
          <div
            style={{
              ...script,
              color: BLUE,
              fontSize: 30,
              lineHeight: 1.2,
              transform: "rotate(-4deg)",
            }}
          >
            {T("One Time Payment,")}
            <br />
            {T("Lifetime Access!")}
          </div>
        </div>

        {/* Benefits */}
        <div className="row g-6 text-center">
          {([
            [
              ShieldCheck,
              "No recurring fees",
              "(One-time payment)",
            ],
            [
              Headphones,
              "Full features",
              "(For life)",
            ],
            [
              RefreshCw,
              "Regular updates",
              "(Always improving)",
            ],
          ] as const).map(([I, a, b]) => (
            <div key={a} className="col-4">

              {/* Icon Circle */}
              <div
                className="d-flex flex-center rounded-circle mx-auto mb-3"
                style={{
                  width: 60,
                  height: 60,
                  background: "#E0F2FE",
                  color: BLUE,
                }}
              >
                <I size={26} />
              </div>

              {/* Benefit Text */}
              <div className="fs-7 text-gray-700">
                {T(a)}
                <br />
                {T(b)}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  </div>
</section>


      
{/* Trust bar */}
<section
  className="py-10 text-white position-relative overflow-hidden"
  style={{
    background: "linear-gradient(90deg,#0B2A6B,#123B8C)",
    minHeight: 320,
  }}
>
  {/* Background */}
  <img
    src={trustBg}
    alt=""
    className="d-none d-lg-block position-absolute top-0 end-0 h-100"
    style={{
      width: "45%",
      objectFit: "cover",
      opacity: 0.55,
      maskImage: "linear-gradient(90deg,transparent,#000 40%)",
      WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)",
    }}
  />

  {/* Owl - full body visible */}
  <img
    src={owlImg}
    alt="Skowla owl"
    className="d-none d-lg-block position-absolute"
    style={{
      right: "4%",
      bottom: 10,
      height: "85%",
      width: "auto",
      maxWidth: 230,
      objectFit: "contain",
      objectPosition: "bottom center",
      zIndex: 1,
    }}
  />

  {/* Content */}
  <div
    className="container position-relative"
    style={{ zIndex: 2 }}
  >
    <Eyebrow color="#93C5FD">
      {T("Trusted by Schools")}
    </Eyebrow>

    <h2 className="fw-bolder fs-2x text-white mb-3">
      {T("A Platform You Can Rely On")}
    </h2>

    <p
      className="fs-6 mb-8"
      style={{
        color: "#CBD5E1",
        maxWidth: 520,
      }}
    >
      {T(
        "Skowla is built with security, stability and scalability in mind. Helping schools manage their daily operations with confidence."
      )}
    </p>

    {/* Statistics */}
    <div className="row g-6">
      {STATS.map(([I, a, b]) => (
        <div
          key={b}
          className="col-6 col-md-2 d-flex align-items-center gap-3"
        >
          <I size={28} color="#93C5FD" />

          <div>
            <div className="fw-bolder fs-4 text-white">
              {T(a)}
            </div>

            <div
              className="fs-8"
              style={{ color: "#CBD5E1" }}
            >
              {T(b)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Team */}
      <section id="team" className="py-10">
        <div className="container text-center">
          <Eyebrow>{T("The Team Behind Skowla")}</Eyebrow>
          <h2 className="fw-bolder fs-2x mb-2">{T("Built by Developers and Dreamers")}</h2>
          <p className="text-gray-600 fs-7 mb-10">{T("A passionate team with a shared vision to create a safer, smarter and brighter future for every school.")}</p>
          <div className="row g-6">
            {TEAM.map((m) => (
              <div key={m.name} className="col-6 col-lg-3">
                <div className="bg-white rounded-4 shadow-sm overflow-hidden h-100">
                  <img src={m.image} alt={m.name} loading="lazy" className="w-100" style={{ aspectRatio: "1/1", objectFit: "cover" }} />
                  <div className="p-4">
                    <div className="fw-bold fs-6">{m.name}</div>
                    <div className="fs-8 text-gray-600">{T(m.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pb-10 d-none">
        <div className="container text-center position-relative">
          <span className="position-absolute start-0 fs-1 text-gray-500" style={{ top: "55%" }}>‹</span>
          <span className="position-absolute end-0 fs-1 text-gray-500" style={{ top: "55%" }}>›</span>
          <Eyebrow>{T("What Schools Say")}</Eyebrow>
          <h2 className="fw-bolder fs-2 mb-10">{T("Trusted by Educators Across Malaysia")}</h2>
          <div className="row g-6 text-start px-6">
            {TESTIMONIALS.map(([q, n, r], idx) => (
              <div key={n} className="col-md-4">
                <div className="bg-white rounded-4 shadow-sm p-6 h-100">
                  <div className="fs-1 fw-bolder" style={{ color: BLUE }}>“</div>
                  <p className="fs-7 text-gray-700 mb-5">{T(q)}</p>
                  <div className="d-flex align-items-center gap-3">
                    <img src={[av1, av2, av3][idx]} alt={n} className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
                    <div><div className="fw-bold fs-7">{n}</div><div className="fs-8 text-gray-600">{T(r)}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
{/* CTA */}
<section className="pb-10">
  <div className="container">
    <div
      className="rounded-4 p-8 text-center text-white position-relative overflow-hidden"
      style={{
        background: `linear-gradient(90deg,${BLUE},#38BDF8)`,
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Owl - Full body visible */}
      <img
        src={owlImg}
        alt="Skowla owl"
        className="d-none d-lg-block position-absolute"
        style={{
          left: "4%",
          bottom: 10,
          height: "75%",
          width: "auto",
          maxWidth: 160,
          objectFit: "contain",
          objectPosition: "bottom center",
          zIndex: 1,
        }}
      />

      {/* Decorative text */}
      <div
        className="d-none d-lg-block position-absolute text-white"
        style={{
          ...script,
          right: "4%",
          top: "22%",
          fontSize: 28,
          transform: "rotate(-6deg)",
          zIndex: 1,
        }}
      >
        {T("Together for a")}
        <br />
        {T("brighter future")}
        <span style={{ color: "#FDE68A" }}> ♡</span>
      </div>

      {/* Main Content */}
      <div
        className="position-relative mx-auto"
        style={{
          zIndex: 2,
          maxWidth: 650,
        }}
      >
        <h2 className="fw-bolder fs-2x text-white mb-3">
          {T("Ready to Build a Smarter School?")}
        </h2>

        <p
          className="fs-6 mb-6"
          style={{ color: "#E0F2FE" }}
        >
          {T("Join thousands of schools already using Skowla.")}
        </p>

        {/* Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link
            to="/register"
            className="btn bg-white fw-bold px-7"
            style={{
              ...pill,
              color: BLUE,
            }}
          >
            {T("Get Started →")}
          </Link>

          <a
            href="#app"
            className="btn fw-bold text-white px-7 text-nowrap"
            style={{
              ...pill,
              border: "1.5px solid #fff",
            }}
          >
            <Play
              size={13}
              className="me-1"
              fill="currentColor"
            />
            {T("Watch Demo")}
          </a>
        </div>
      </div>
    </div>
  </div>
</section>



      

{/* Footer */}
<footer
  id="contact"
  className="pt-10 pb-6 text-white"
  style={{ background: "#0A1A47" }}
>
  <div className="container">

    <div className="row gy-8 gx-5 align-items-start">

      {/* Company Logo */}
      <div className="col-12 col-md-6 col-lg-3">
        <div className="text-center text-md-start">

          <img
            src="/assets/media/auth/companylogo.png"
            alt="My3Smart Digital"
            className="mb-3"
            style={{
              width: 140,
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <p
            className="fs-7 mb-0 mx-auto mx-md-0"
            style={{
              color: "#CBD5E1",
              lineHeight: 1.7,
              maxWidth: 230,
            }}
          >
            Dikuasakan oleh My3Smart Digital Sdn Bhd
          </p>

        </div>
      </div>

      {/* Footer Navigation */}
      {([
        [
          "Products",
          [
            ["Features", "#features"],
            ["Pricing", "#pricing"],
            ["Mobile App", "#app"],
            ["Blog", "#"],
          ],
        ],
        [
          "Company",
          [
            ["About Us", "#team"],
            ["Careers", "#"],
            ["Contact", "#contact"],
            ["Privacy", "/policy"],
          ],
        ],
      ] as [string, string[][]][]).map(([heading, links]) => (

        <div
          key={heading}
          className="col-6 col-md-3 col-lg-2"
        >
          <div className="fw-bold fs-6 text-white mb-4">
            {T(heading)}
          </div>

          <div className="d-flex flex-column gap-3">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="fs-7 text-decoration-none"
                style={{ color: "#CBD5E1" }}
              >
                {T(label)}
              </a>
            ))}
          </div>
        </div>

      ))}

      {/* Contact & Social Media */}
      <div className="col-12 col-md-6 col-lg-5">

        <div className="text-center text-md-start text-lg-end">

          <div className="fw-bold fs-6 text-white mb-4">
            Hubungi Kami
          </div>

          {/* Contact Details */}
          <div className="d-flex flex-column gap-2">

            <a
              href="tel:013-5341977"
              className="fs-7 text-decoration-none"
              style={{ color: "#E2E8F0" }}
            >
              013-534 1977
            </a>

            <a
              href="mailto:my3sssofficial@gmail.com"
              className="fs-7 text-decoration-none"
              style={{ color: "#E2E8F0" }}
            >
              my3sssofficial@gmail.com
            </a>

            <a
              href="mailto:skoolamy3sss@gmail.com"
              className="fs-7 text-decoration-none"
              style={{ color: "#E2E8F0" }}
            >
              skoolamy3sss@gmail.com
            </a>

          </div>

          {/* Social Media Icons */}
          <div className="d-flex flex-nowrap align-items-center justify-content-center justify-content-md-start justify-content-lg-end gap-3 mt-5 mb-6">

            {([
              [
                "Instagram",
                "https://www.instagram.com/my3sssofficial",
                "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
              ],
              [
                "Threads",
                "https://www.threads.com/@my3sssofficial",
                "M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z",
              ],
              [
                "TikTok",
                "https://www.tiktok.com/@my3sssofficial",
                "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
              ],
              [
                "Facebook",
                "https://www.facebook.com/my3sssofficial",
                "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
              ],
            ] as [string, string, string][]).map(
              ([name, href, d]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="d-flex align-items-center justify-content-center text-white text-decoration-none"
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,.12)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={d} />
                  </svg>
                </a>
              )
            )}
          </div>

        </div>
      </div>

    </div>

    {/* Copyright */}
    <div
      className="mt-6 pt-5 text-center text-md-end fs-8"
      style={{
        color: "#94A3B8",
        borderTop: "1px solid rgba(255,255,255,.12)",
      }}
    >
      &copy; 2026 Skowla. {T("All rights reserved.")}
    </div>

  </div>
</footer>


    </div>
  );
}
