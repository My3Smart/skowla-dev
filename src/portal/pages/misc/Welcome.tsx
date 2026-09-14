import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMetronic } from "@/portal/useMetronic";
import logoAsset from "@/assets/my3smart-logo.png.asset.json";

const HIGHLIGHTS = [
  { value: "1 saat", label: "Imbasan kad RFID untuk merekod kehadiran" },
  { value: "80%", label: "Masa pentadbiran guru dijimatkan" },
  { value: "24/7", label: "Ibu bapa boleh semak rekod anak bila-bila masa" },
];

const PROBLEMS = [
  {
    title: "Ibu bapa",
    text: "Tidak tahu sama ada anak selamat sampai ke sekolah, dan risau wang saku disalah guna.",
  },
  {
    title: "Guru",
    text: "Terbeban dengan rekod kehadiran manual yang mengambil masa mengajar.",
  },
  {
    title: "Pentadbir",
    text: "Sukar memantau ponteng dan menyediakan laporan kehadiran yang tepat.",
  },
];

const SOLUTIONS = [
  {
    title: "Kehadiran automatik",
    text: "Notifikasi serta-merta kepada ibu bapa sebaik anak masuk atau keluar kawasan sekolah.",
  },
  {
    title: "Kantin tanpa tunai",
    text: "Ibu bapa memantau perbelanjaan dan tabiat pemakanan anak melalui satu akaun.",
  },
  {
    title: "Automasi tugas guru",
    text: "Rekod kelas, laporan dan analisis kehadiran dijana secara automatik.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Daftar & terima kad RFID",
    desc: "Setiap pelajar menerima kad pintar Skoola yang terikat pada profil mereka.",
  },
  {
    step: "2",
    title: "Imbas di sekolah",
    desc: "Imbasan di pintu masuk merekod kehadiran; imbasan di kantin merekod pembelian.",
  },
  {
    step: "3",
    title: "Pantau secara langsung",
    desc: "Ibu bapa, guru dan pentadbir melihat kemas kini yang sama pada masa sebenar.",
  },
];

const TEAM = [
  {
    name: "Puan Nuradiana Kamarudin",
    role: "Managing Director & Business Development",
    image: "/assets/media/team/nuradiana-kamarudin.jpeg",
  },
  {
    name: "En Shyful Izzudeen",
    role: "Managing Director & Creative Director",
    image: "/assets/media/team/en-shyful.jpeg",
  },
  {
    name: "En Muhamad Danieal Azim",
    role: "Head Programmer",
    image: "/assets/media/team/danieal-azim.jpeg",
  },
  {
    name: "Cik Nurhanisa Hanim",
    role: "Junior Programmer",
    image: "/assets/media/team/nurhanisa-hanim.jpeg",
  },
];

const PACKAGE_ITEMS = [
  "Kad pintar RFID untuk pelajar",
  "Akses penuh portal ibu bapa",
  "Notifikasi kehadiran masa sebenar",
  "Rekod perbelanjaan kantin & koperasi",
  "Sokongan teknikal sepanjang persekolahan",
];

export default function Welcome() {
  const ready = useMetronic();

  useEffect(() => {
    document.title = "Skoola — Sistem Kehadiran & Pengurusan Sekolah Pintar";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "Skoola menggunakan kad RFID untuk merekod kehadiran pelajar secara automatik, memaklumkan ibu bapa serta-merta dan mengurangkan kerja pentadbiran guru.",
      );
    }
  }, []);

  if (!ready) {
    return <div className="min-vh-100 d-flex flex-center text-muted">Memuatkan…</div>;
  }

  return (
    <div className="d-flex flex-column flex-root bg-body" id="kt_app_root">
      {/* Navigasi */}
      <header
        className="w-100 py-5"
        style={{ background: "#111827", position: "sticky", top: 0, zIndex: 30 }}
      >
        <div className="container">
          <nav className="d-flex align-items-center justify-content-between">
            <Link to="/" className="d-flex align-items-center gap-4 text-decoration-none">
              <img
                src="/assets/media/auth/skoolahd.png"
                alt="Skoola"
                style={{ height: 56, width: "auto" }}
              />
              <span style={{ width: 1, height: 34, background: "rgba(255,255,255,.25)" }} />
              <img
                src={logoAsset.url}
                alt="My3Smart Digital"
                style={{ height: 52, width: "auto" }}
              />
            </Link>

            <div className="d-flex align-items-center gap-4">
              <a
                href="tel:013-5341977"
                className="d-none d-md-flex align-items-center text-gray-300 text-hover-success fs-6 fw-semibold text-decoration-none"
              >
                <span className="svg-icon svg-icon-2x svg-icon-white me-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4H9L11 9L8 11C10.5 15.5 14.5 18 17 19L19 16L24 18V22C24 22.5304 23.7893 23.0391 23.4142 23.4142C23.0391 23.7893 22.5304 24 22 24C17.261 23.6438 12.9133 21.6145 9.73223 18.2678C6.38549 15.0867 4.35624 10.739 4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H5Z" fill="currentColor"/>
                  </svg>
                </span>
                013-534 1977
              </a>
              <Link to="/register" className="btn btn-sm btn-color-white btn-active-color-success fw-semibold">
                Daftar
              </Link>
              <Link to="/login" className="btn btn-sm btn-success fw-bold px-6">
                Log Masuk
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "#111827" }} className="pt-10 pb-16">
        <div className="container">
          <div className="row align-items-center g-10">
            <div className="col-lg-7">
              <span className="badge badge-light-success fw-semibold fs-7 mb-5 px-4 py-2">
                Teknologi RFID untuk sekolah Malaysia
              </span>
              <h1 className="text-white fw-bolder mb-5" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.2 }}>
                Kehadiran pelajar direkod automatik.
                <br />
                Ibu bapa tahu dalam masa beberapa saat.
              </h1>
              <p className="fs-4 text-gray-400 lh-lg mb-8" style={{ maxWidth: 620 }}>
                Skoola menyatukan kehadiran, kantin tanpa tunai dan laporan sekolah dalam satu sistem
                yang mudah digunakan oleh ibu bapa, guru dan pentadbir.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-success btn-lg fw-bold px-8">
                  Mula Sekarang
                </Link>
                <a href="mailto:my3sssofficial@gmail.com,skoolamy3sss@gmail.com" className="btn btn-lg btn-outline btn-outline-dashed btn-color-white fw-semibold px-8">
                  Minta Demo Percuma
                </a>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-8">
                  <h3 className="fw-bold fs-3 mb-6">Apa yang anda dapat</h3>
                  {HIGHLIGHTS.map((h) => (
                    <div className="d-flex align-items-start mb-6" key={h.label}>
                      <div className="fw-bolder fs-2 text-success me-4" style={{ minWidth: 90 }}>
                        {h.value}
                      </div>
                      <div className="text-gray-700 fs-6 lh-lg">{h.label}</div>
                    </div>
                  ))}
                  <Link to="/login" className="btn btn-light-success w-100 fw-bold mt-2">
                    Log masuk ke portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Masalah & penyelesaian */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="fs-2hx fw-bolder mb-3">Masalah harian, satu penyelesaian</h2>
            <p className="fs-5 text-gray-600 mb-0">
              Setiap pihak dalam sekolah menghadapi cabaran berbeza. Skoola menangani ketiga-tiganya.
            </p>
          </div>

          <div className="row g-6 mb-12">
            {PROBLEMS.map((p) => (
              <div className="col-md-4" key={p.title}>
                <div className="card h-100 border border-gray-200 shadow-sm">
                  <div className="card-body p-8">
                    <h4 className="fw-bold mb-3">{p.title}</h4>
                    <p className="text-gray-600 fs-6 lh-lg mb-0">{p.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-6">
            {SOLUTIONS.map((s) => (
              <div className="col-md-4" key={s.title}>
                <div className="card h-100 bg-light-success border-0">
                  <div className="card-body p-8">
                    <h4 className="fw-bold mb-3 text-success">{s.title}</h4>
                    <p className="text-gray-700 fs-6 lh-lg mb-0">{s.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara berfungsi */}
      <section style={{ background: "#111827" }} className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="fs-2hx fw-bolder text-white mb-3">Tiga langkah sahaja</h2>
            <p className="fs-5 text-gray-400 mb-0">Sekolah boleh mula menggunakan Skoola dalam masa seminggu.</p>
          </div>
          <div className="row g-8">
            {STEPS.map((s) => (
              <div className="col-md-4" key={s.step}>
                <div className="h-100 p-8 rounded" style={{ background: "rgba(255,255,255,.05)" }}>
                  <div
                    className="d-inline-flex flex-center rounded-circle mb-5 fw-bolder fs-3"
                    style={{ width: 52, height: 52, background: "#12CE5D", color: "#111827" }}
                  >
                    {s.step}
                  </div>
                  <h3 className="text-white fw-bold fs-4 mb-3">{s.title}</h3>
                  <p className="text-gray-400 fs-6 lh-lg mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kisah */}
      <section className="py-16">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <h2 className="fs-2hx fw-bolder mb-6 text-center">Kenapa kami bina Skoola</h2>
              <p className="fs-4 text-gray-800 lh-lg">
                Setiap pagi, ribuan ibu bapa menghantar anak ke sekolah tanpa kepastian: adakah anak
                sampai dengan selamat, dan ke mana perginya wang saku hari itu?
              </p>
              <p className="fs-5 text-gray-600 lh-lg">
                Jawapan biasanya hanya diketahui selepas waktu balik. Pada masa yang sama, guru
                menghabiskan berjam-jam sehari untuk rekod kehadiran dan dokumentasi yang sepatutnya
                boleh diautomasikan.
              </p>
              <p className="fs-5 fw-semibold text-dark lh-lg mb-0">
                Skoola menghubungkan ibu bapa, guru dan pentadbir dalam satu sistem yang selamat dan
                telus — supaya masa boleh dikembalikan kepada pengajaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section className="py-16 bg-light">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="fs-2hx fw-bolder mb-3">Satu bayaran sahaja</h2>
            <p className="fs-5 text-gray-600 mb-0">Tiada yuran bulanan, tiada kos tersembunyi.</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-10 text-center">
                  <h3 className="fw-bold fs-2 mb-2">Skoola Lifetime Pass</h3>
                  <div className="fw-bolder text-success mb-1" style={{ fontSize: "3rem" }}>
                    RM25
                  </div>
                  <p className="text-gray-600 fs-6 mb-8">
                    seorang pelajar, sepanjang tempoh persekolahan
                  </p>
                  <ul className="text-start fs-6 text-gray-700 lh-lg ps-0 mb-8" style={{ listStyle: "none" }}>
                    {PACKAGE_ITEMS.map((item) => (
                      <li className="d-flex align-items-start mb-3" key={item}>
                        <span className="text-success fw-bolder me-3">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="btn btn-success btn-lg w-100 fw-bold">
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pasukan */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="fs-2hx fw-bolder mb-3">Pasukan di sebalik Skoola</h2>
            <p className="fs-5 text-gray-600 mb-0">My3Smart Digital Sdn Bhd</p>
          </div>
          <div className="row g-6 justify-content-center">
            {TEAM.map((m) => (
              <div className="col-md-6 col-lg-3" key={m.name}>
                <div className="card h-100 border border-gray-200 overflow-hidden shadow-sm">
                  <img
                    src={m.image}
                    alt={`Potret ${m.name}`}
                    className="skoola-team-portrait"
                    loading="lazy"
                  />
                  <div className="card-body p-7 text-center">
                    <h4 className="fw-bold fs-5 mb-2">{m.name}</h4>
                    <p className="text-gray-600 fs-7 mb-0">{m.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#12CE5D" }} className="py-14">
        <div className="container text-center">
          <h2 className="fs-2hx fw-bolder mb-4" style={{ color: "#0b3d22" }}>
            Sedia untuk digitalkan sekolah anda?
          </h2>
          <p className="fs-5 mb-8" style={{ color: "#0b3d22", opacity: 0.85 }}>
            Dapatkan demonstrasi percuma dan rundingan pelaksanaan untuk sekolah anda.
          </p>
          <a href="mailto:my3sssofficial@gmail.com,skoolamy3sss@gmail.com" className="btn btn-lg btn-dark fw-bold px-10">
            Hubungi Kami
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827" }} className="py-10">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-md-4">

              <div className="d-flex align-items-center gap-4 mb-4">
                <img
                  src="/assets/media/auth/skoolahd.png"
                  alt="Skoola"
                  style={{ height: 60, width: "auto" }}
                />
                <img
                  src={logoAsset.url}
                  alt="My3Smart Digital"
                  style={{ height: 56, width: "auto" }}
                />
              </div>
              <p className="text-gray-500 fs-7 mb-0">
                Dikuasakan oleh My3Smart Digital Sdn Bhd
              </p>
            </div>

            <div className="col-md-4 text-md-center">
              <h5 className="text-white fw-bold fs-6 mb-3">Hubungi Kami</h5>
              <a
                href="tel:013-5341977"
                className="d-inline-flex align-items-center text-gray-400 text-hover-success fs-6 text-decoration-none mb-2"
              >
                <span className="svg-icon svg-icon-2x svg-icon-gray-400 me-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4H9L11 9L8 11C10.5 15.5 14.5 18 17 19L19 16L24 18V22C24 22.5304 23.7893 23.0391 23.4142 23.4142C23.0391 23.7893 22.5304 24 22 24C17.261 23.6438 12.9133 21.6145 9.73223 18.2678C6.38549 15.0867 4.35624 10.739 4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H5Z" fill="currentColor"/>
                  </svg>
                </span>
                013-534 1977
              </a>
              <a
                href="mailto:my3sssofficial@gmail.com"
                className="d-inline-flex align-items-center text-gray-400 text-hover-success fs-6 text-decoration-none mb-2"
              >
                <span className="svg-icon svg-icon-2x svg-icon-gray-400 me-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6L12 11L20 6H4ZM4 8V18H20V8L12 13L4 8Z" fill="currentColor"/>
                  </svg>
                </span>
                my3sssofficial@gmail.com
              </a>
              <a
                href="mailto:skoolamy3sss@gmail.com"
                className="d-inline-flex align-items-center text-gray-400 text-hover-success fs-6 text-decoration-none"
              >
                <span className="svg-icon svg-icon-2x svg-icon-gray-400 me-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6L12 11L20 6H4ZM4 8V18H20V8L12 13L4 8Z" fill="currentColor"/>
                  </svg>
                </span>
                skoolamy3sss@gmail.com
              </a>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex flex-column gap-2">
                <Link to="/terms" className="fs-7 text-gray-400 text-hover-success text-decoration-none">
                  Terma
                </Link>
                <Link to="/policy" className="fs-7 text-gray-400 text-hover-success text-decoration-none">
                  Polisi Privasi
                </Link>
                <Link to="/login" className="fs-7 text-gray-400 text-hover-success text-decoration-none">
                  Log Masuk
                </Link>
              </div>
            </div>
          </div>
          <div className="border-top border-gray-700 mt-8 pt-6 text-center">
            <span className="fs-7 text-gray-500">
              &copy; {new Date().getFullYear()} My3Smart Digital Sdn Bhd. Hak cipta terpelihara.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
