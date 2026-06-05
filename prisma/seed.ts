import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Memulai seeding kurikulum premium...");

  const pengajar = await prisma.user.findFirst({ where: { role: "PENGAJAR" } });
  if (!pengajar) {
    console.error("❌ Tidak ditemukan user dengan role PENGAJAR.");
    process.exit(1);
  }
  console.log(`👨‍🏫 Pengajar: ${pengajar.nama} (${pengajar.email})`);

  await prisma.taskSubmission.deleteMany({});
  await prisma.moduleProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  console.log("🗑️  Data lama dihapus.");

  // ============================================================
  // KELAS: Mastering React.js & Tailwind CSS v4 untuk Pemula
  // ============================================================
  const course = await prisma.course.create({
    data: {
      judul: "Mastering React.js & Tailwind CSS v4 untuk Pemula",
      deskripsi: "Kurikulum lengkap membangun UI modern dengan React 19 dan Tailwind CSS v4. Dirancang khusus untuk pemula dengan pendekatan pedagogi: analogi dunia nyata, studi kasus nyata, dan tugas praktik yang menantang. Dari nol hingga mampu membangun komponen interaktif profesional.",
      pengajarId: pengajar.id,
      isPublished: true,
    },
  });

  // ============================================================
  // MODUL 1: Fondasi Komponen & JSX
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "Fondasi Komponen & JSX",
      urutan: 1,
      courseId: course.id,
      quizPassword: "react_mula",
      taskInstruction: `## 🎯 Tugas Praktik: Membuat UI Kartu Nama Keren

Buatlah komponen React bernama \`BusinessCard\` yang menampilkan kartu nama profesional menggunakan Tailwind CSS v4.

### Spesifikasi Wajib:
1. **Foto profil** bulat dengan border emas/gradien
2. **Nama lengkap** dengan font bold dan ukuran besar
3. **Jabatan/Profesi** dengan warna berbeda dari nama
4. **Bio singkat** maksimal 2 baris dengan ellipsis
5. **Tombol aksi**: "Hubungi" (biru) dan "Portfolio" (outline)
6. **Ikon media sosial** minimal 2 (GitHub, LinkedIn)
7. **Efek hover**: card sedikit terangkat dengan shadow lebih besar
8. **Responsif**: tampil baik di mobile (1 kolom) dan desktop (3 kartu sejajar)

### Kriteria Penilaian (100):
- **Struktur JSX (25)**: Semantic, rapi, tidak ada tag yang tidak perlu
- **Penggunaan Props (25)**: Data kartu dikirim via props, bukan hardcode
- **Tailwind Styling (25)**: Konsisten, responsif, menggunakan utility yang tepat
- **Kreativitas (25)**: Ada sentuhan personal (gradien, animasi, tema unik)

### Contoh Penggunaan:
\`\`\`jsx
<BusinessCard
  nama="Budi Santoso"
  jabatan="Full-stack Developer"
  bio="Passionate tentang React dan Node.js. Suka membangun produk yang bermanfaat."
  avatar="https://i.pravatar.cc/300?img=11"
  github="https://github.com/budi"
  linkedin="https://linkedin.com/in/budi"
/>
\`\`\``,
      konten: `## 🏗️ Fondasi Komponen & JSX: Membangun Blok UI dari Nol

---

### 1. Analogi Dunia Nyata: LEGO dan Komponen React

Bayangkan kamu punya **kotak LEGO** yang sangat besar. Di dalam kotak itu ada ratusan jenis balok: balok persegi, balok roda, balok jendela, balok pintu. Setiap balok punya bentuk dan fungsi masing-masing. Kamu bisa menyusun balok-balok itu menjadi rumah, mobil, atau pesawat.

**React bekerja persis seperti LEGO.**

Setiap "balok" di React disebut **Component**. Sebuah tombol adalah component. Sebuah kartu produk adalah component. Seluruh halaman web adalah susunan dari banyak component kecil yang saling terhubung.

Mengapa harus dibagi jadi component kecil? Bayangkan kamu sedang membangun sebuah website e-commerce. Di halaman utama ada:
- Navbar di atas
- Banner promo
- Grid produk (setiap produk punya foto, nama, harga, tombol beli)
- Footer

Jika kamu menulis semua itu dalam satu file \`index.html\` yang panjang, maka:
- **Sulit dicari**: Kalau ada error di bagian harga, kamu harus scroll ratusan baris
- **Sulit dipakai ulang**: Komponen "Produk Card" muncul 20 kali. Kalau mau mengubah desainnya, kamu harus mengubah 20 tempat
- **Sulit dikerjakan tim**: Tidak bisa bagi-bagi tugas karena semua tercampur jadi satu

Dengan React, kamu memecah UI jadi potongan-potongan kecil:

\`\`\`
App
├── Navbar          ← Component sendiri
├── PromoBanner     ← Component sendiri
├── ProductGrid     ← Component yang berisi...
│   ├── ProductCard ← Component yang dipakai 20 kali
│   ├── ProductCard
│   └── ProductCard
└── Footer          ← Component sendiri
\`\`\`

Setiap component punya file sendiri, bisa dikerjakan oleh orang berbeda, dan bisa dipakai ulang di mana saja.

---

### 2. The "Why": Mengapa Kita Butuh JSX?

#### Masalah Tanpa JSX

Bayangkan kamu ingin menampilkan elemen HTML sederhana ini:

\`\`\`html
<div class="card">
  <h2>Judul</h2>
  <p>Deskripsi</p>
</div>
\`\`\`

Di JavaScript murni (tanpa React), kamu harus menulis:

\`\`\`javascript
const element = React.createElement(
  "div",
  { className: "card" },
  React.createElement("h2", null, "Judul"),
  React.createElement("p", null, "Deskripsi")
);
\`\`\`

Sekarang bayangkan kamu punya komponen dengan 50 baris HTML nested. Kode JavaScript kamu akan menjadi sangat panjang, tidak terbaca, dan rawan error. Ini seperti menulis surat dengan kode Morse — bisa, tapi sangat menyiksa.

#### Solusi: JSX

JSX (JavaScript XML) memungkinkanmu menulis **HTML langsung di dalam JavaScript**:

\`\`\`jsx
const element = (
  <div className="card">
    <h2>Judul</h2>
    <p>Deskripsi</p>
  </div>
);
\`\`\`

JSX bukan string. JSX bukan HTML. JSX adalah **sintaks yang di-compile** oleh tool bernama Babel menjadi \`React.createElement()\` di balik layar. Kamu menulis kode yang indah, komputer yang mengubahnya jadi kode yang bisa dieksekusi.

**Perbedaan penting JSX vs HTML:**

| HTML Biasa | JSX |
|---|---|
| \`class="card"\` | \`className="card"\` |
| \`for="input"\` | \`htmlFor="input"\` |
| \`<img src="...">\` | \`<img src="..." />\` (harus self-close) |
| \`<!-- komentar -->\` | \`{/* komentar */}\` |
| inline: \`onclick\` | inline: \`onClick\` (camelCase) |

Mengapa \`className\` bukan \`class\`? Karena \`class\` adalah kata kunci yang sudah dipakai di JavaScript untuk mendefinisikan class. React menggunakan \`className\` untuk menghindari konflik.

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Membuat Component Pertama

Buat file baru bernama \`Greeting.tsx\`:

\`\`\`tsx
// components/Greeting.tsx

/**
 * Component Greeting — menampilkan sapaan sederhana.
 * Nama component HARUS diawali huruf kapital (PascalCase).
 * Jika dimulai huruf kecil, React akan menganggapnya sebagai HTML tag biasa.
 */
function Greeting() {
  // Kita bisa menulis JavaScript biasa di sini sebelum return
  const nama = "Budi";
  const jam = new Date().getHours();

  // Tentukan sapaan berdasarkan waktu
  let ucapan: string;
  if (jam < 11) {
    ucapan = "Selamat Pagi";
  } else if (jam < 15) {
    ucapan = "Selamat Siang";
  } else if (jam < 18) {
    ucapan = "Selamat Sore";
  } else {
    ucapan = "Selamat Malam";
  }

  // return mengembalikan JSX — hanya BISA SATU root element
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      {/* Gunakan {} untuk memasukkan variabel JavaScript ke dalam JSX */}
      <h1 className="text-2xl font-bold">{ucapan}, {nama}!</h1>
      <p className="text-gray-600">Sekarang pukul {jam}:00</p>
    </div>
  );
}

// WAJIB export agar bisa diimport di tempat lain
export default Greeting;
\`\`\`

#### Langkah 2: Menggunakan Component di Halaman

\`\`\`tsx
// app/page.tsx
import Greeting from "@/components/Greeting";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      {/* Menggunakan component seperti menggunakan tag HTML */}
      <Greeting />

      {/* Bisa dipakai berkali-kali */}
      <Greeting />
      <Greeting />
    </main>
  );
}
\`\`\`

#### Langkah 3: Mengirim Data dengan Props

Props (properties) adalah **parameter** yang dikirim dari parent ke child component. Seperti argumen pada fungsi.

\`\`\`tsx
// components/ProductCard.tsx

// Props didefinisikan sebagai parameter dengan tipe TypeScript
interface ProductCardProps {
  nama: string;        // Nama produk (wajib)
  harga: number;       // Harga produk (wajib)
  gambar: string;      // URL gambar (wajib)
  diskon?: number;     // Diskon dalam persen (opsional, ditandai ?)
  isBaru?: boolean;    // Apakah produk baru (opsional)
}

function ProductCard({ nama, harga, gambar, diskon, isBaru }: ProductCardProps) {
  // Hitung harga setelah diskon (jika ada)
  const hargaFinal = diskon ? harga - (harga * diskon) / 100 : harga;

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Gambar produk */}
      <img
        src={gambar}
        alt={nama}
        className="w-full h-48 object-cover rounded-lg"
      />

      {/* Badge "Baru" jika produk baru */}
      {isBaru && (
        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          🆕 Baru
        </span>
      )}

      {/* Nama dan harga */}
      <h3 className="font-semibold text-lg mt-2">{nama}</h3>

      {diskon ? (
        <div className="flex items-center gap-2">
          {/* Harga asli yang dicoret */}
          <span className="text-gray-400 line-through text-sm">
            Rp {harga.toLocaleString("id-ID")}
          </span>
          {/* Harga setelah diskon */}
          <span className="text-red-600 font-bold">
            Rp {hargaFinal.toLocaleString("id-ID")}
          </span>
          {/* Badge diskon */}
          <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded">
            -{diskon}%
          </span>
        </div>
      ) : (
        <span className="text-gray-800 font-bold">
          Rp {harga.toLocaleString("id-ID")}
        </span>
      )}
    </div>
  );
}

export default ProductCard;
\`\`\`

Penggunaan:

\`\`\`tsx
// app/page.tsx
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {/* Kirim data sebagai props */}
      <ProductCard
        nama="Laptop ASUS ROG"
        harga={15000000}
        gambar="/images/laptop.jpg"
        diskon={10}
        isBaru={true}
      />

      {/* Props diskon tidak diisi, jadi undefined */}
      <ProductCard
        nama="Keyboard Mechanical"
        harga={850000}
        gambar="/images/keyboard.jpg"
      />
    </div>
  );
}
\`\`\`

#### Langkah 4: Conditional Rendering

Menampilkan UI yang berbeda berdasarkan kondisi.

\`\`\`tsx
// components/UserStatus.tsx
interface UserStatusProps {
  user: {
    nama: string;
    isLoggedIn: boolean;
    role: "admin" | "user";
  } | null;
}

function UserStatus({ user }: UserStatusProps) {
  // Pola 1: Early return jika data tidak ada
  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <p>Silakan login terlebih dahulu.</p>
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded">
      {/* Pola 2: Ternary untuk 2 kondisi */}
      <p className="text-sm">
        Status: {user.isLoggedIn ? "🟢 Online" : "🔴 Offline"}
      </p>

      <h2 className="text-xl font-bold mt-1">{user.nama}</h2>

      {/* Pola 3: Logical AND untuk conditional render */}
      {user.role === "admin" && (
        <button className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded">
          ⚙️ Panel Admin
        </button>
      )}
    </div>
  );
}

export default UserStatus;
\`\`\`

#### Langkah 5: Rendering List dengan map()

\`\`\`tsx
// components/StudentList.tsx
interface Student {
  id: string;
  nama: string;
  kelas: string;
  nilai: number;
}

interface StudentListProps {
  students: Student[];
}

function StudentList({ students }: StudentListProps) {
  // Handle kasus list kosong
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-4xl mb-2">📚</p>
        <p>Belum ada data siswa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        // key HARUS unik dan stabil. Gunakan id, BUKAN index array.
        <div
          key={student.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <p className="font-medium">{student.nama}</p>
            <p className="text-sm text-gray-500">Kelas {student.kelas}</p>
          </div>

          {/* Warna nilai berdasarkan angka */}
          <span
            className={\`px-3 py-1 rounded-full text-sm font-medium \${
              student.nilai >= 80
                ? "bg-green-100 text-green-700"
                : student.nilai >= 60
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }\`}
          >
            {student.nilai}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StudentList;
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Lupa \`"use client"\` pada Component yang Pakai State/Event

**Gejala:**
\`\`\`
Error: useState is not defined
Error: Expected a client component but got a server component
\`\`\`

**Penyebab:** Di Next.js App Router, semua component secara default adalah **Server Component**. Server Component TIDAK BISA menggunakan hooks (\`useState\`, \`useEffect\`) atau event handler (\`onClick\`, \`onChange\`).

**Solusi:** Tambahkan directive \`"use client"\` di baris PERTAMA file:

\`\`\`tsx
// ❌ SALAH — Server Component tidak bisa pakai useState
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // ERROR!
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ BENAR — Tambahkan "use client" di baris pertama
"use client";

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // Berhasil!
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

---

#### ❌ Error #2: Return Banyak Root Element Tanpa Fragment

**Gejala:**
\`\`\`
Error: Adjacent JSX elements must be wrapped in an enclosing tag
\`\`\`

**Penyebab:** JSX hanya bisa mengembalikan **satu root element**. Jika ada 2 element sejajar, error.

**Solusi:** Bungkus dengan Fragment (\`<></>\`):

\`\`\`tsx
// ❌ SALAH — ada 2 root element sejajar
function Profile() {
  return (
    <h1>Nama</h1>
    <p>Bio</p>
  );
}

// ✅ BENAR — bungkus dengan Fragment
function Profile() {
  return (
    <>
      <h1>Nama</h1>
      <p>Bio</p>
    </>
  );
}

// Alternatif: gunakan div sebagai wrapper
function Profile() {
  return (
    <div>
      <h1>Nama</h1>
      <p>Bio</p>
    </div>
  );
}
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan Singkat |
|---|---|
| Component | Fungsi yang mengembalikan JSX. Blok bangunan UI React. |
| JSX | Sintaks "HTML di JavaScript" yang di-compile jadi React.createElement |
| Props | Data yang dikirim dari parent ke child, seperti argumen fungsi |
| className | Versi JSX dari atribut \`class\` di HTML |
| Conditional Rendering | Menampilkan UI berbeda berdasarkan kondisi (\`if\`, ternary, \`&&\`) |
| Rendering List | Menggunakan \`.map()\` untuk merender array menjadi elemen JSX |
| key | Atribut wajib saat merender list, harus unik dan stabil |

> **PASSWORD_KUIS: \`react_mula\`**
> Temukan password ini, masukkan di kolom kuis di bawah, dan buktikan kamu sudah memahami fondasi Komponen & JSX!`,
    },
  });

  // ============================================================
  // MODUL 2: State & Rentetan Perubahan Data
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "State & Rentetan Perubahan Data",
      urutan: 2,
      courseId: course.id,
      quizPassword: "state_paham",
      taskInstruction: `## 🎯 Tugas Praktik: Aplikasi To-Do List Interaktif

Buatlah aplikasi To-Do List lengkap menggunakan React dan Tailwind CSS v4.

### Spesifikasi Wajib:
1. **Tambah tugas**: Input + tombol "Tambah", tekan Enter juga bisa
2. **Tandai selesai**: Klik teks tugas → coret (line-through) dan warna berubah
3. **Hapus tugas**: Tombol ✕ di setiap item
4. **Filter**: 3 tombol filter — Semua, Aktif, Selesai
5. **Counter**: Tampilkan "X dari Y tugas selesai"
6. **Empty state**: Tampilan lucu jika belum ada tugas
7. **Responsif**: Nyaman di mobile dan desktop

### Kriteria Penilaian (100):
- **Penggunaan State (30)**: useState untuk list, input, dan filter aktif
- **Fungsionalitas CRUD (25)**: Create, Read (tampilkan), Update (toggle), Delete berfungsi
- **Event Handling (20)**: onClick, onChange, onKeyDown (Enter) ditangani dengan benar
- **UI/UX (15)**: Animasi hover, warna konsisten, layout rapi
- **Clean Code (10)**: Nama variabel jelas, komponen dipecah jika perlu

### Bonus (tidak wajib):
- Simpan data ke localStorage agar persist setelah refresh
- Tambahkan animasi saat item ditambah/dihapus
- Tambahkan drag & drop untuk mengubah urutan`,
      konten: `## 🔄 State & Rentetan Perubahan Data: Membuat UI yang Hidup

---

### 1. Analogi Dunia Nyata: Buku Catatan vs Papan Tulis

Bayangkan kamu seorang guru. Kamu punya **papan tulis** di depan kelas dan **buku catatan** di meja.

**Papan tulis** itu seperti **tampilan UI** (yang dilihat murid). Informasi di papan tulis terlihat oleh semua orang.

**Buku catatan** itu seperti **state**. Kamu mencatat data di buku, lalu menuliskannya ke papan tulis. Jika ada perubahan (misal: nilai siswa berubah), kamu:
1. Mengubah catatan di buku (mengubah state)
2. Menulis ulang ke papan tulis (UI di-render ulang)

**Tanpa state**, papan tulismu akan statis. Kamu tulis sekali, selesai. Tidak bisa diubah. Murid harus melihat informasi yang sama selamanya.

**Dengan state**, papan tulismu hidup. Kamu bisa mengubah informasi kapan saja, dan murid selalu melihat data terbaru.

Inilah mengapa state sangat penting: **tanpa state, UI kamu adalah poster mati. Dengan state, UI kamu adalah papan tulis hidup yang bisa berubah sewaktu-waktu.**

---

### 2. The "Why": Masalah Tanpa State

#### Kasus: Membuat Counter Sederhana

Tanpa React, untuk membuat tombol yang bisa menghitung klik, kamu harus:

\`\`\`javascript
// JavaScript murni — manual dan rentan error
let count = 0; // Variabel biasa

const button = document.getElementById("counter-btn");
const display = document.getElementById("counter-display");

button.addEventListener("click", () => {
  count++; // Ubah variabel
  display.textContent = count; // Update DOM manual
});
\`\`\`

Masalahnya:
1. **Desync**: Variabel \`count\` dan tampilan \`display\` bisa tidak sinkron kalau kamu lupa mengupdate salah satu
2. **Complexity**: Semakin banyak data yang berubah, semakin banyak \`document.getElementById\` dan \`textContent = ...\` yang harus kamu tulis
3. **Debugging**: Kalau tampilan salah, kamu harus cek manual: apakah variabelnya yang salah? Atau DOM update-nya yang salah?

#### React State: Satu Sumber Kebenaran

Di React, kamu hanya perlu **mendeskripsikan tampilan berdasarkan data**. React yang akan mengurus kapan dan bagaimana UI di-update.

\`\`\`tsx
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // State: satu sumber kebenaran

  return (
    <div>
      {/* Tampilan SELALU sinkron dengan state */}
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
\`\`\`

Kamu hanya bilang: "Tampilkan \`count\`". React yang akan meng-update DOM setiap kali \`count\` berubah. Tidak ada \`document.getElementById\`, tidak ada \`textContent = ...\`.

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Memahami useState

\`\`\`tsx
"use client";
import { useState } from "react";

function Sederhana() {
  // useState mengembalikan ARRAY dengan 2 elemen:
  // [nilai_saat_ini, fungsi_untuk_mengubah]
  const [count, setCount] = useState(0);
  //   ↑            ↑              ↑
  //   Nama         Fungsi         Nilai awal
  //   variabel     setter         (hanya dipakai
  //                               saat render pertama)

  return (
    <div>
      <p>Count: {count}</p>
      {/* Panggil setter untuk mengubah state */}
      <button onClick={() => setCount(count + 1)}>Tambah</button>
      <button onClick={() => setCount(count - 1)}>Kurang</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
\`\`\`

**Penting:** Saat kamu memanggil \`setCount(count + 1)\`, React akan:
1. Mengubah nilai \`count\` menjadi \`count + 1\`
2. Menjadwalkan render ulang component
3. Component di-render ulang dengan nilai \`count\` yang baru
4. Tampilan otomatis berubah

#### Langkah 2: State dengan Object

\`\`\`tsx
"use client";
import { useState } from "react";

function UserForm() {
  // State berbentuk object
  const [form, setForm] = useState({
    nama: "",
    email: "",
    role: "PESERTA" as string,
  });

  // Fungsi helper untuk mengubah satu field tertentu
  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,        // ← Salin SEMUA field yang ada (spread operator)
      [field]: value, // ← Timpa HANYA field yang berubah
    }));
  }

  return (
    <form className="space-y-3 max-w-sm">
      <input
        value={form.nama}
        onChange={(e) => updateField("nama", e.target.value)}
        placeholder="Nama"
        className="w-full p-2 border rounded"
      />
      <input
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="Email"
        className="w-full p-2 border rounded"
      />
      <select
        value={form.role}
        onChange={(e) => updateField("role", e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="PESERTA">Peserta</option>
        <option value="PENGAJAR">Pengajar</option>
      </select>

      {/* Preview data */}
      <pre className="bg-gray-100 p-3 rounded text-sm">
        {JSON.stringify(form, null, 2)}
      </pre>
    </form>
  );
}
\`\`\`

#### Langkah 3: State dengan Array (CRUD Lengkap)

\`\`\`tsx
"use client";
import { useState } from "react";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // CREATE — Tambah tugas baru
  function addTask() {
    if (!input.trim()) return; // Jangan tambah jika kosong

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: input, done: false },
    ]);
    setInput(""); // Kosongkan input setelah tambah
  }

  // UPDATE — Toggle selesai/belum
  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  // DELETE — Hapus tugas
  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📝 To-Do List</h1>

      {/* Input area */}
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Tambah tugas baru..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Tambah
        </button>
      </div>

      {/* Daftar tugas */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />
            <span
              className={\`flex-1 \${task.done ? "line-through text-gray-400" : ""}\`}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Counter */}
      {tasks.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          {tasks.filter((t) => t.done).length} dari {tasks.length} selesai
        </p>
      )}
    </div>
  );
}
\`\`\`

#### Langkah 4: Lifting State Up

Ketika dua komponen perlu mengakses data yang sama, **angkat state ke parent**.

\`\`\`tsx
"use client";
import { useState } from "react";

// Child component: Hanya menerima data dan fungsi via props
function TemperatureInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 p-2 border rounded w-full"
      />
    </div>
  );
}

// Parent component: Memegang state dan logika konversi
function TemperatureConverter() {
  const [celsius, setCelsius] = useState("");

  // Hitung fahrenheit dari celsius
  const fahrenheit = celsius
    ? ((parseFloat(celsius) * 9) / 5 + 32).toFixed(1)
    : "";

  return (
    <div className="max-w-sm p-6 space-y-4">
      <h2 className="text-xl font-bold">🌡️ Konverter Suhu</h2>

      <TemperatureInput
        label="Celsius (°C)"
        value={celsius}
        onChange={setCelsius}
      />

      <TemperatureInput
        label="Fahrenheit (°F)"
        value={fahrenheit}
        onChange={(val) => {
          // Konversi balik dari fahrenheit ke celsius
          const c = ((parseFloat(val) - 32) * 5) / 9;
          setCelsius(c.toFixed(1));
        }}
      />
    </div>
  );
}
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Mutasi State Langsung (Tanpa Setter)

**Gejala:** UI tidak berubah padahal data sudah diubah.

**Penyebab:** Mengubah isi array/object state secara langsung tanpa membuat salinan baru.

\`\`\`tsx
// ❌ SALAH — mutasi langsung
function addTask() {
  tasks.push({ id: 1, text: "Baru" }); // Mengubah array lama
  setTasks(tasks); // React mengira tidak ada perubahan karena referensi array SAMA
}

// ✅ BENAR — buat array baru
function addTask() {
  setTasks([...tasks, { id: 1, text: "Baru" }]); // Array BARU, referensi BERBEDA
}
\`\`\`

**Mengapa?** React membandingkan referensi (alamat memori), bukan isi. Jika referensi sama, React menganggap "tidak ada perubahan" dan tidak me-render ulang.

---

#### ❌ Error #2: Lupa Dependency Array di useEffect (akan dibahas di modul 3, tapi sering terjadi bersamaan dengan state error)

**Gejala:** Infinite loop — browser hang, fan laptop kencang.

**Penyebab:** useEffect tanpa dependency array akan berjalan di SETIAP render. Jika di dalam useEffect ada setState, maka render → useEffect → setState → render → useEffect → ... tak hingga.

Solusi akan dibahas detail di Modul 3.

---

### 5. Ringkasan Modul

| Konsep | Penjelasan Singkat |
|---|---|
| \`useState\` | Hook untuk menyimpan data yang bisa berubah di component |
| State Setter | Fungsi yang digunakan untuk mengubah nilai state |
| Render Ulang | Setiap kali state berubah, React me-render ulang component |
| Spread Operator | \`...prev\` digunakan untuk menyalin data sebelum mengubah sebagian |
| Lifting State Up | Mengangkat state ke parent agar bisa dibagikan ke banyak child |
| Immutability | Jangan mutasi state langsung; selalu buat salinan baru |

> **PASSWORD_KUIS: \`state_paham\`**
> Temukan password ini, masukkan di kolom kuis, dan buktikan kamu menguasai State di React!`,
    },
  });

  // ============================================================
  // MODUL 3: Efek Samping & Integrasi API via useEffect
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "Efek Samping & Integrasi API via useEffect",
      urutan: 3,
      courseId: course.id,
      quizPassword: "api_lancar",
      taskInstruction: `## 🎯 Tugas Praktik: Aplikasi Pantau Cuaca

Buatlah aplikasi cuaca sederhana menggunakan React dan Tailwind CSS v4 yang mengambil data dari API publik.

### Spesifikasi Wajib:
1. **Input kota**: Text input untuk nama kota + tombol "Cari"
2. **Tampilan cuaca**: Nama kota, suhu, kondisi (cerah/berawan/hujan), kelembaban, kecepatan angin
3. **Loading state**: Tampilkan spinner/teks "Memuat..." saat fetch data
4. **Error handling**: Tampilkan pesan error jika kota tidak ditemukan atau API gagal
5. **5 kota terakhir**: Simpan 5 kota terakhir yang dicari di localStorage, tampilkan sebagai tombol shortcut
6. **Responsif**: Tampilan card cuaca yang indah di mobile dan desktop
7. **Debounce**: Tidak langsung fetch saat user mengetik, tunggu 500ms setelah berhenti mengetik

### API yang Digunakan:
- OpenWeatherMap: \`https://api.openweathermap.org/data/2.5/weather?q={kota}&appid={API_KEY}&units=metric&lang=id\`
- Daftar gratis di: https://openweathermap.org/api (pakai "Current Weather Data")

### Kriteria Penilaian (100):
- **useEffect (30)**: Dependency array benar, cleanup function ada, tidak infinite loop
- **Fetch & Error Handling (25)**: Fetch sukses ditangani, error ditangani, loading state ada
- **LocalStorage (20)**: Riwayat kota tersimpan dan bisa diakses kembali
- **UI/UX (15)**: Ikon cuaca, warna dinamis berdasarkan kondisi, layout rapi
- **Debounce (10)**: Input tidak memicu fetch berlebihan

### Bonus (tidak wajib):
- Tampilkan prakiraan 5 hari ke depan (pakai endpoint /forecast)
- Ganti background color berdasarkan kondisi cuaca
- Tambahkan animasi transisi saat data berubah`,
      konten: `## ⚡ Efek Samping & Integrasi API: Menghubungkan React ke Dunia Luar

---

### 1. Analogi Dunia Nyata: Pesan Antar Makanan

Bayangkan kamu sedang di rumah dan ingin makan pizza. Ada 2 cara:

**Cara 1: Masak Sendiri (Synchronous)**
Kamu ke dapur, adonan, panggang, tunggu 30 menit, baru makan. Selama 30 menit itu, kamu **tidak bisa melakukan apa-apa** selain menunggu pizza matang. Ini disebut **blocking** — satu tugas menghalangi tugas lain.

**Cara 2: Pesan Delivery (Asynchronous)**
Kamu buka aplikasi, pesan pizza, lalu **lanjut nonton TV**. Saat pizza datang, kamu baru berhenti nonton dan makan. Ini disebut **non-blocking** — kamu bisa melakukan hal lain sambil menunggu.

Di React:
- **Render** = Kamu di rumah (synchronous, harus selesai dulu)
- **Fetch API** = Pesan delivery (asynchronous, bisa ditunggu sambil melakukan hal lain)
- **useEffect** = Notifikasi dari aplikasi delivery: "Pizza sudah sampai!"

useEffect adalah cara React untuk bilang: "Hei, ada sesuatu yang terjadi di luar komponen ini (fetch data, timer, subscribe event). Jalankan sesuatu setelah komponen selesai di-render."

---

### 2. The "Why": Masalah Tanpa useEffect

#### Kasus: Fetch Data dari API

Bayangkan kamu ingin menampilkan daftar user dari API. Tanpa useEffect:

\`\`\`tsx
// ❌ BERMASALAH — fetch di dalam render
function UserList() {
  const [users, setUsers] = useState([]);

  // INI SALAH! Fetch di dalam render akan berjalan tak hingga!
  fetch("https://api.example.com/users")
    .then((res) => res.json())
    .then((data) => setUsers(data));
  // setUsers memicu render ulang → fetch lagi → setUsers lagi → render lagi → ...

  return <div>{users.map((u) => <p key={u.id}>{u.nama}</p>)}</div>;
}
\`\`\`

Masalahnya:
1. **Infinite loop**: Render → fetch → setState → render → fetch → ... tak hingga
2. **Blocking**: Fetch menghalangi render. UI freeze sampai data selesai diambil
3. **No cleanup**: Jika component hilang sebelum fetch selesai, error bisa terjadi

#### Solusi: useEffect

\`\`\`tsx
// ✅ BENAR — fetch di dalam useEffect
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch berjalan SETELAH render, TIDAK menghalangi UI
    fetch("https://api.example.com/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []); // ← Array kosong = jalankan sekali saat mount

  return <div>{users.map((u) => <p key={u.id}>{u.nama}</p>)}</div>;
}
\`\`\`

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Memahami useEffect

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

function DocumentTitle() {
  const [count, setCount] = useState(0);

  // useEffect: jalankan efek samping SETELAH render
  useEffect(() => {
    // Kode di sini berjalan SETELAH component di-render ke layar
    document.title = \`Klik \${count} kali\`;

    // Cleanup function (opsional): berjalan SEBELUM effect berikutnya
    // atau saat component unmount
    return () => {
      console.log("Cleanup: title akan diubah");
    };
  }, [count]); // ← Dependency array: effect berjalan ulang jika 'count' berubah

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Klik</button>
    </div>
  );
}
\`\`\`

**3 Pola Dependency Array:**

\`\`\`tsx
// Pola 1: Array kosong → jalankan SEKALI saat mount
useEffect(() => {
  console.log("Component pertama kali muncul");
}, []);

// Pola 2: Ada dependency → jalankan saat dependency berubah
useEffect(() => {
  console.log(\`count berubah jadi \${count}\`);
}, [count]);

// Pola 3: Tanpa array → jalankan di SETIAP render (HINDARI!)
useEffect(() => {
  console.log("Render terjadi"); // ← Bisa infinite loop!
});
\`\`\`

#### Langkah 2: Fetch Data dengan Loading & Error State

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

function UserList() {
  // 3 state untuk mengelola lifecycle fetch
  const [users, setUsers] = useState<User[]>([]);    // Data
  const [loading, setLoading] = useState(true);       // Loading
  const [error, setError] = useState<string | null>(null); // Error

  useEffect(() => {
    // Gunakan async function di dalam useEffect
    async function fetchUsers() {
      try {
        setLoading(true);  // Mulai loading
        setError(null);    // Reset error

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );

        // Cek apakah response berhasil
        if (!response.ok) {
          throw new Error(\`Gagal mengambil data: \${response.status}\`);
        }

        const data = await response.json();
        setUsers(data);    // Simpan data
      } catch (err) {
        // Tangkap error
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false); // Selesai loading (apapun hasilnya)
      }
    }

    fetchUsers();
  }, []); // Jalankan sekali saat mount

  // Tampilkan loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <p className="ml-3">Memuat data...</p>
      </div>
    );
  }

  // Tampilkan error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Tampilkan data
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {users.map((user) => (
        <div key={user.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">{user.company.name}</p>
        </div>
      ))}
    </div>
  );
}
\`\`\`

#### Langkah 3: Cleanup Function (AbortController)

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

function SearchUsers({ query }: { query: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // AbortController untuk membatalkan request yang sudah tidak perlu
    const controller = new AbortController();

    async function search() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          \`https://jsonplaceholder.typicode.com/users?q=\${query}\`,
          { signal: controller.signal } // ← Kaitkan signal
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        // AbortError bukan error sesungguhnya, abaikan
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    search();

    // Cleanup: batalkan request jika component unmount atau query berubah
    return () => controller.abort();
  }, [query]); // Jalankan ulang setiap kali query berubah

  if (loading) return <p>Mencari...</p>;

  return (
    <ul>
      {results.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

#### Langkah 4: Debounce Pattern

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

function DebouncedSearch() {
  const [input, setInput] = useState("");  // Apa yang user ketik
  const [query, setQuery] = useState("");  // Query yang di-debounce
  const [results, setResults] = useState<any[]>([]);

  // Debounce: tunggu 500ms setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input); // Set query SETELAH 500ms tidak ada ketikan
    }, 500);

    // Cleanup: batalkan timer jika user mengetik lagi sebelum 500ms
    return () => clearTimeout(timer);
  }, [input]); // Jalankan ulang setiap kali input berubah

  // Fetch data berdasarkan query yang sudah di-debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    fetch(\`https://jsonplaceholder.typicode.com/users?q=\${query}\`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(() => {});

    return () => controller.abort();
  }, [query]); // Bukan 'input', tapi 'query'!

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Cari user..."
        className="w-full p-2 border rounded"
      />
      {results.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
\`\`\`

#### Langkah 5: Integrasi dengan API Cuaca

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

interface WeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  wind: { speed: number };
}

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Load history dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem("weather_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  async function fetchWeather(kota: string) {
    if (!kota.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Ganti YOUR_API_KEY dengan API key dari OpenWeatherMap
      const res = await fetch(
        \`https://api.openweathermap.org/data/2.5/weather?q=\${kota}&appid=YOUR_API_KEY&units=metric&lang=id\`
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error("Kota tidak ditemukan");
        throw new Error("Gagal mengambil data cuaca");
      }

      const data = await res.json();
      setWeather(data);

      // Simpan ke history (maksimal 5)
      setHistory((prev) => {
        const updated = [kota, ...prev.filter((c) => c !== kota)].slice(0, 5);
        localStorage.setItem("weather_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🌤️ Pantau Cuaca</h1>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
          placeholder="Masukkan nama kota..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => fetchWeather(city)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "..." : "Cari"}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {history.map((kota) => (
            <button
              key={kota}
              onClick={() => { setCity(kota); fetchWeather(kota); }}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
            >
              {kota}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Hasil */}
      {weather && (
        <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold">{weather.name}</h2>
          <p className="text-6xl font-light mt-2">
            {Math.round(weather.main.temp)}°C
          </p>
          <p className="text-lg mt-1 capitalize">
            {weather.weather[0].description}
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <span>💧 {weather.main.humidity}%</span>
            <span>💨 {weather.wind.speed} m/s</span>
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Infinite Loop (useEffect tanpa Dependency Array)

**Gejala:** Browser hang, tab tidak responsif, fan laptop berputar kencang.

**Penyebab:** useEffect tanpa dependency array akan berjalan di SETIAP render. Jika di dalamnya ada setState, maka: render → effect → setState → render → effect → ... tak hingga.

\`\`\`tsx
// ❌ SALAH — infinite loop!
useEffect(() => {
  const data = fetch("/api/users").then(r => r.json());
  setUsers(data); // setState memicu render ulang → useEffect jalan lagi
}); // ← TANPA dependency array!

// ✅ BENAR — tambahkan dependency array kosong
useEffect(() => {
  fetch("/api/users")
    .then(r => r.json())
    .then(data => setUsers(data));
}, []); // ← Array kosong = sekali saja saat mount
\`\`\`

---

#### ❌ Error #2: Missing Cleanup (Memory Leak)

**Gejala:** Warning di console: "Can't perform a React state update on an unmounted component".

**Penyebab:** Component sudah hilang dari layar, tapi fetch masih berjalan dan mencoba setState.

\`\`\`tsx
// ❌ BERMASALAH — tidak ada cleanup
useEffect(() => {
  fetch("/api/data")
    .then(r => r.json())
    .then(data => setItems(data)); // Component mungkin sudah unmount!
}, []);

// ✅ BENAR — gunakan AbortController
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/data", { signal: controller.signal })
    .then(r => r.json())
    .then(data => setItems(data))
    .catch(err => {
      if (err.name !== "AbortError") console.error(err);
    });

  return () => controller.abort(); // Batalkan saat unmount
}, []);
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan Singkat |
|---|---|
| \`useEffect\` | Hook untuk efek samping (fetch, timer, DOM manipulation) |
| Dependency Array | \`[]\` = sekali, \`[a,b]\` = saat a/b berubah, tanpa = setiap render |
| Cleanup Function | Fungsi return di useEffect untuk membersihkan (abort, clear timer) |
| AbortController | Membatalkan fetch request yang sudah tidak perlu |
| Debounce | Menunda eksekusi sampai user berhenti melakukan aksi |
| Loading/Error State | State tambahan untuk mengelola siklus hidup fetch |

> **PASSWORD_KUIS: \`api_lancar\`**
> Temukan password ini, masukkan di kolom kuis, dan buktikan kamu bisa menghubungkan React ke API dunia nyata!`,
    },
  });

  console.log("✅ Kelas berhasil dibuat!");
  console.log("📚 3 modul dengan materi pedagogi pemula yang mendalam");
  console.log("🔑 Quiz passwords: react_mula, state_paham, api_lancar");
  console.log("📋 3 tugas praktik dengan kriteria penilaian lengkap");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
