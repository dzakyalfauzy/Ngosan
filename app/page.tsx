import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-sm">
              N
            </div>
            <span className="text-lg font-bold text-white">Ngosan</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-20">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Platform Belajar Coding Indonesia
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Belajar Coding</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Secara Terstruktur
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-center text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Kurikulum bootcamp premium dengan materi mendalam, kuis interaktif,
            sistem tugas, dan tracking progress real-time. Dari pemula hingga
            siap kerja.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-center transition shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
            >
              Mulai Belajar Gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold text-center transition"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">3+</p>
              <p className="text-sm text-slate-500 mt-1">Kelas Premium</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">15+</p>
              <p className="text-sm text-slate-500 mt-1">Modul Materi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-500 mt-1">Gratis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Fitur yang Dirancang untuk
              <br />
              <span className="text-emerald-400">Belajar Efektif</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Bukan sekadar baca materi. Ngosan menghadirkan pengalaman belajar
              coding yang interaktif dan terukur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="👥"
              title="Multi-Role Akses"
              description="Sistem role Admin, Pengajar, dan Peserta dengan dashboard dan izin akses yang berbeda."
            />
            <FeatureCard
              icon="💻"
              title="Code Block Interaktif"
              description="Materi dengan syntax highlighting dan blok kode yang rapi, nyaman dibaca seperti IDE."
            />
            <FeatureCard
              icon="🧪"
              title="Kuis & Evaluasi"
              description="Validasi pemahaman melalui kuis password per modul dan sistem penilaian tugas oleh pengajar."
            />
            <FeatureCard
              icon="📊"
              title="Progress Tracking"
              description="Pantau kemajuan belajar secara real-time dengan progress bar dan statistik detail."
            />
            <FeatureCard
              icon="📝"
              title="Tugas Praktik"
              description="Setiap modul punya tugas coding yang bisa dikumpulkan dan dinilai langsung oleh pengajar."
            />
            <FeatureCard
              icon="🎯"
              title="Kurikulum Terstruktur"
              description="Materi disusun berurutan dari dasar hingga mahir dengan pendekatan pedagogi pemula."
            />
            <FeatureCard
              icon="🔐"
              title="Autentikasi Aman"
              description="Sistem login JWT dengan HTTP-only cookie, password ter-hash, dan proteksi route."
            />
            <FeatureCard
              icon="🌙"
              title="Dark Mode Premium"
              description="Tampilan gelap modern yang nyaman di mata, cocok untuk belajar coding di malam hari."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-t border-white/5 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Dibangun dengan
              <span className="text-emerald-400"> Teknologi Modern</span>
            </h2>
            <p className="text-slate-400 mt-4">
              Stack yang digunakan di industri profesional
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Next.js 16", sub: "App Router" },
              { name: "React 19", sub: "Server Components" },
              { name: "Tailwind v4", sub: "Utility-first CSS" },
              { name: "Prisma v7", sub: "ORM" },
              { name: "PostgreSQL", sub: "Neon Database" },
              { name: "TypeScript", sub: "Type Safety" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="text-center p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:border-emerald-500/20 transition"
              >
                <p className="font-semibold text-white text-sm">{tech.name}</p>
                <p className="text-xs text-slate-500 mt-1">{tech.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Siap Mulai Belajar Coding?
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            Bergabung sekarang dan akses semua materi premium secara gratis.
            Tidak perlu kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold transition"
            >
              Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold">
              N
            </div>
            <span className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Ngosan. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="hover:text-slate-300 transition cursor-pointer">
              Tentang
            </span>
            <span className="hover:text-slate-300 transition cursor-pointer">
              Kontak
            </span>
            <span className="hover:text-slate-300 transition cursor-pointer">
              Kebijakan Privasi
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-emerald-500/20 hover:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-semibold text-white mt-4 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
