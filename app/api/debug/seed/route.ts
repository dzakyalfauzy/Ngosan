import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let pengajar = await prisma.user.findFirst({ where: { role: "PENGAJAR" } });
    if (!pengajar) {
      const hashedPassword = await bcrypt.hash("pengajar123", 10);
      pengajar = await prisma.user.create({
        data: { nama: "Pengajar Demo", email: "pengajar@ngosan.com", password: hashedPassword, role: "PENGAJAR" },
      });
    }

    await prisma.moduleProgress.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.course.deleteMany({});

    // ==================== KELAS 1: HTML & CSS ====================
    const html = await prisma.course.create({
      data: { judul: "Belajar HTML & CSS Dasar", deskripsi: "Pelajari fondasi web development dari nol hingga membuat halaman web responsif pertamamu.", pengajarId: pengajar.id, isPublished: true },
    });

    await prisma.module.createMany({
      data: [
        {
          judul: "Pengenalan HTML", urutan: 1, courseId: html.id, quizPassword: "html_fondasi_2024",
          konten: `## Apa itu HTML?

HTML (HyperText Markup Language) adalah bahasa standar yang digunakan untuk membuat dan menyusun halaman web. Bayangkan HTML seperti **kerangka sebuah rumah** — tanpa kerangka, rumah tidak bisa berdiri. Tanpa HTML, halaman web tidak bisa ditampilkan.

## Struktur Dasar HTML

Setiap dokumen HTML memiliki struktur dasar yang wajib ada:

\`\`\`html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halaman Pertamaku</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Ini adalah halaman web pertamaku.</p>
</body>
</html>
\`\`\`

### Penjelasan Setiap Bagian:
- \`<!DOCTYPE html>\` — Memberitahu browser bahwa ini adalah dokumen HTML5
- \`<html>\` — Elemen root yang membungkus seluruh halaman
- \`<head>\` — Berisi metadata (judul, charset, link CSS)
- \`<body>\` — Berisi konten yang terlihat oleh pengguna

## Elemen HTML Dasar

### Heading (Judul)
HTML menyediakan 6 level heading dari \`<h1>\` sampai \`<h6>\`:

\`\`\`html
<h1>Ini Judul Terbesar</h1>
<h2>Ini Judul Kedua</h2>
<h3>Ini Judul Ketiga</h3>
\`\`\`

### Paragraf dan Teks
\`\`\`html
<p>Ini adalah paragraf pertama.</p>
<p>Teks dengan <strong>tebal</strong> dan <em>miring</em>.</p>
<p>Teks <mark>highlight</mark> dan <del>dicoret</del>.</p>
\`\`\`

### Link dan Gambar
\`\`\`html
<a href="https://google.com" target="_blank">Buka Google</a>
<img src="foto.jpg" alt="Deskripsi foto" width="300">
\`\`\`

### List (Daftar)
\`\`\`html
<ul>
    <li>HTML — Struktur halaman</li>
    <li>CSS — Tampilan dan gaya</li>
    <li>JavaScript — Interaksi dan logika</li>
</ul>
\`\`\`

## Form (Formulir)
\`\`\`html
<form action="/submit" method="POST">
    <label for="nama">Nama:</label>
    <input type="text" id="nama" name="nama" required>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    <button type="submit">Kirim</button>
</form>
\`\`\`

---

> **PASSWORD_KUIS: \`html_fondasi_2024\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Dasar CSS", urutan: 2, courseId: html.id, quizPassword: "css_style_master",
          konten: `## Apa itu CSS?

CSS (Cascading Style Sheets) adalah bahasa yang digunakan untuk **mengatur tampilan** elemen HTML. Jika HTML adalah kerangka rumah, maka CSS adalah **cat, dekorasi, dan desain interior**.

## Cara Menambahkan CSS

\`\`\`css
/* External CSS — cara terbaik */
h1 { color: navy; }
.card { padding: 20px; border-radius: 8px; }
#header { background-color: #333; }
a:hover { color: red; }
\`\`\`

## Box Model

Setiap elemen HTML adalah "kotak" dengan 4 lapisan:

\`\`\`css
.box {
    width: 200px;      /* Content */
    padding: 20px;     /* Jarak content ke border */
    border: 2px solid; /* Garis tepi */
    margin: 10px;      /* Jarak ke elemen lain */
}
\`\`\`

## Flexbox Layout

\`\`\`css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}
\`\`\`

## CSS Grid

\`\`\`css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
\`\`\`

## Responsive Design

\`\`\`css
@media (min-width: 768px) {
    .container { max-width: 720px; margin: 0 auto; }
}
\`\`\`

---

> **PASSWORD_KUIS: \`css_style_master\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Semantic HTML & Aksesibilitas", urutan: 3, courseId: html.id, quizPassword: "semantic_pro_77",
          konten: `## Mengapa Semantic HTML Penting?

Semantic HTML menggunakan elemen yang **mendeskripsikan makna kontennya**, bukan hanya tampilannya. Ini penting untuk SEO, aksesibilitas (screen reader), dan keterbacaan kode.

## Elemen Semantic

\`\`\`html
<header>Logo dan navigasi utama</header>
<nav>Menu navigasi</nav>
<main>
    <article>
        <h2>Judul Artikel</h2>
        <section>Konten bagian 1</section>
        <section>Konten bagian 2</section>
    </article>
    <aside>Konten samping (sidebar)</aside>
</main>
<footer>Hak cipta dan info kontak</footer>
\`\`\`

## Aksesibilitas (a11y)

\`\`\`html
<!-- Gunakan alt pada gambar -->
<img src="chart.png" alt="Grafik penjualan naik 50%">

<!-- Gunakan label pada form -->
<label for="email">Email:</label>
<input type="email" id="email" aria-describedby="email-help">
<small id="email-help">Kami tidak akan membagikan email Anda.</small>

<!-- Gunakan role untuk landmark -->
<div role="alert">Pesan error di sini</div>
<nav aria-label="Navigasi utama">...</nav>
\`\`\`

---

> **PASSWORD_KUIS: \`semantic_pro_77\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "CSS Flexbox Mendalam", urutan: 4, courseId: html.id, quizPassword: "flexbox_ultimate",
          konten: `## Flexbox: Layout Satu Dimensi

Flexbox adalah sistem layout untuk menyusun elemen dalam **satu baris atau satu kolom**.

## Flex Container Properties

\`\`\`css
.flex-container {
    display: flex;
    flex-direction: row;        /* row | column | row-reverse */
    justify-content: center;    /* flex-start | center | space-between | space-around */
    align-items: center;        /* flex-start | center | stretch | baseline */
    flex-wrap: wrap;            /* nowrap | wrap */
    gap: 16px;
}
\`\`\`

## Flex Item Properties

\`\`\`css
.flex-item {
    flex-grow: 1;    /* Ambil sisa ruang */
    flex-shrink: 0;  /* Jangan mengecil */
    flex-basis: 200px; /* Ukuran dasar */
    /* Shorthand */
    flex: 1 0 200px;
    order: -1; /* Urutan tampil */
}
\`\`\`

## Studi Kasus: Navbar Responsive

\`\`\`html
<nav class="navbar">
    <div class="logo">Ngosan</div>
    <ul class="nav-links">
        <li><a href="/">Beranda</a></li>
        <li><a href="/courses">Kelas</a></li>
        <li><a href="/about">Tentang</a></li>
    </ul>
    <button class="cta">Daftar</button>
</nav>
\`\`\`

\`\`\`css
.navbar {
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    background: #1a1a2e;
}
.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin-left: auto;
}
.nav-links a { color: white; text-decoration: none; }
.cta {
    margin-left: 2rem;
    padding: 0.5rem 1rem;
    background: #00b4d8;
    color: white;
    border: none;
    border-radius: 6px;
}
\`\`\`

---

> **PASSWORD_KUIS: \`flexbox_ultimate\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "CSS Grid & Project Akhir", urutan: 5, courseId: html.id, quizPassword: "grid_layout_king",
          taskInstruction: "Buatlah landing page responsif untuk portfolio pribadi menggunakan HTML dan CSS (Flexbox + Grid).\n\nPersyaratan:\n1. Gunakan semantic HTML (header, main, section, footer)\n2. Buat minimal 3 section: Hero, About, Projects\n3. Gunakan CSS Grid untuk layout card project\n4. Buat responsif di mobile dan desktop\n5. Push ke GitHub dan deploy di Vercel/Netlify",
          konten: `## CSS Grid: Layout Dua Dimensi

Grid memungkinkan layout **baris dan kolom** sekaligus.

\`\`\`css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto 1fr auto;
    gap: 20px;
}
.featured { grid-column: span 2; }
.sidebar { grid-row: span 2; }
\`\`\`

## Project: Landing Page Responsif

\`\`\`html
<div class="page">
    <header class="header">...</header>
    <main class="content">
        <section class="hero">...</section>
        <section class="features">
            <div class="card">Fitur 1</div>
            <div class="card">Fitur 2</div>
            <div class="card">Fitur 3</div>
        </section>
    </main>
    <footer class="footer">...</footer>
</div>
\`\`\`

\`\`\`css
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 4rem 2rem;
}
.card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
\`\`\`

---

> **PASSWORD_KUIS: \`grid_layout_king\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
      ],
    });

    // ==================== KELAS 2: JAVASCRIPT ====================
    const js = await prisma.course.create({
      data: { judul: "Kuasai JavaScript Modern", deskripsi: "Belajar JavaScript dari dasar hingga fitur modern ES6+ dengan studi kasus nyata.", pengajarId: pengajar.id, isPublished: true },
    });

    await prisma.module.createMany({
      data: [
        {
          judul: "Variabel & Tipe Data", urutan: 1, courseId: js.id, quizPassword: "js_var_ninja",
          konten: `## Variabel di JavaScript

Variabel adalah **wadah untuk menyimpan data**. Di JavaScript modern, ada 3 cara mendeklarasikan variabel:

\`\`\`javascript
var nama = "Budi";     // Cara lama, HINDARI
let umur = 25;         // Bisa diubah
const PI = 3.14;       // Tidak bisa diubah (konstanta)
\`\`\`

## Tipe Data Primitif

\`\`\`javascript
// String — teks
const nama = "Budi Santoso";
const salam = \`Hello, \${nama}!\`; // Template literal

// Number — angka (integer & decimal)
const umur = 25;
const harga = 99.99;
const negatif = -10;

// Boolean — true/false
const isActive = true;
const isAdmin = false;

// null & undefined
const data = null;        // Kosong secara sengaja
let hasil;                // undefined (belum diisi)

// Symbol & BigInt (advanced)
const id = Symbol("id");
const big = 9007199254740991n;
\`\`\`

## Tipe Data Non-Primitif

\`\`\`javascript
// Object — kumpulan key-value
const user = {
    nama: "Budi",
    umur: 25,
    isActive: true,
};
console.log(user.nama);    // "Budi"
console.log(user["umur"]); // 25

// Array — kumpulan data berurutan
const buah = ["apel", "mangga", "jeruk"];
console.log(buah[0]);      // "apel"
buah.push("anggur");       // Tambah di akhir
\`\`\`

## Type Checking

\`\`\`javascript
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (bug lama JS!)
typeof []         // "object"
Array.isArray([]) // true
\`\`\`

---

> **PASSWORD_KUIS: \`js_var_ninja\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Function & Arrow Function", urutan: 2, courseId: js.id, quizPassword: "func_arrow_elite",
          konten: `## Function Declaration

\`\`\`javascript
function sapa(nama) {
    return \`Hello, \${nama}!\`;
}
console.log(sapa("Budi")); // "Hello, Budi!"
\`\`\`

## Function Expression

\`\`\`javascript
const tambah = function(a, b) {
    return a + b;
};
console.log(tambah(3, 5)); // 8
\`\`\`

## Arrow Function (ES6+)

\`\`\`javascript
// Arrow function — sintaks lebih pendek
const kali = (a, b) => a * b;

// Dengan banyak baris
const hitungLuas = (panjang, lebar) => {
    const luas = panjang * lebar;
    return luas;
};

// Parameter default
const sapa = (nama = "Teman") => \`Hello, \${nama}!\`;

// Rest parameter
const jumlahkan = (...angka) => angka.reduce((a, b) => a + b, 0);
console.log(jumlahkan(1, 2, 3, 4)); // 10
\`\`\`

## Higher-Order Function

\`\`\`javascript
const angka = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// filter — ambil yang memenuhi kondisi
const genap = angka.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

// map — transformasi setiap elemen
const kuadrat = angka.map(n => n * n);
// [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

// reduce — akumulasi menjadi 1 nilai
const total = angka.reduce((acc, n) => acc + n, 0);
// 55

// find — cari elemen pertama yang cocok
const besar5 = angka.find(n => n > 5);
// 6

// chaining
const hasil = angka
    .filter(n => n % 2 === 0)
    .map(n => n * 10)
    .reduce((a, b) => a + b, 0);
// 200
\`\`\`

---

> **PASSWORD_KUIS: \`func_arrow_elite\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Array & Object Mendalam", urutan: 3, courseId: js.id, quizPassword: "array_obj_master",
          konten: `## Array Methods Lengkap

\`\`\`javascript
const buah = ["apel", "mangga", "jeruk", "pisang"];

// Menambah & menghapus
buah.push("anggur");      // Tambah di akhir
buah.pop();               // Hapus dari akhir
buah.unshift("durian");   // Tambah di awal
buah.shift();             // Hapus dari awal

// Mengambil bagian array
const sebagian = buah.slice(1, 3); // ["mangga", "jeruk"]

// Mencari
buah.includes("mangga");  // true
buah.indexOf("jeruk");    // 2

// Mengurutkan
const angka = [3, 1, 4, 1, 5, 9];
angka.sort((a, b) => a - b); // [1, 1, 3, 4, 5, 9]

// Membalik
buah.reverse();
\`\`\`

## Destructuring Assignment

\`\`\`javascript
// Array destructuring
const [pertama, kedua, ...sisanya] = [1, 2, 3, 4, 5];
// pertama=1, kedua=2, sisanya=[3,4,5]

// Object destructuring
const { nama, umur, kota = "Jakarta" } = {
    nama: "Budi",
    umur: 25
};
// nama="Budi", umur=25, kota="Jakarta"

// Function parameter destructuring
function tampilkanUser({ nama, role }) {
    console.log(\`\${nama} adalah \${role}\`);
}
tampilkanUser({ nama: "Budi", role: "Admin" });
\`\`\`

## Spread Operator

\`\`\`javascript
// Spread array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const gabung = [...arr1, ...arr2]; // [1,2,3,4,5,6]

// Spread object
const user = { nama: "Budi", umur: 25 };
const userLengkap = { ...user, kota: "Jakarta", role: "Admin" };
\`\`\`

---

> **PASSWORD_KUIS: \`array_obj_master\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Async/Await & Fetch API", urutan: 4, courseId: js.id, quizPassword: "async_fetch_pro",
          konten: `## Mengapa Asynchronous?

Bayangkan kamu pesan makanan di restoran. Kamu **tidak berdiri di depan kasir** menunggu — kamu duduk dan bisa melakukan hal lain. Inilah konsep **asynchronous**.

## Promise

\`\`\`javascript
const pesanMakanan = new Promise((resolve, reject) => {
    const ready = true;
    if (ready) resolve("Nasi Goreng siap!");
    else reject("Bahan habis.");
});

pesanMakanan
    .then(hasil => console.log(hasil))
    .catch(error => console.log(error));
\`\`\`

## Async/Await

\`\`\`javascript
async function ambilData() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) throw new Error("Gagal!");
        const users = await response.json();
        console.log(users);
    } catch (error) {
        console.error("Error:", error.message);
    }
}
\`\`\`

## POST Request

\`\`\`javascript
async function createUser(name, email) {
    const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
    });
    return await response.json();
}
\`\`\`

## Parallel Request

\`\`\`javascript
// CEPAAT — semua bersamaan
const [users, posts] = await Promise.all([
    fetch("/api/users").then(r => r.json()),
    fetch("/api/posts").then(r => r.json()),
]);
\`\`\`

---

> **PASSWORD_KUIS: \`async_fetch_pro\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "DOM Manipulation", urutan: 5, courseId: js.id, quizPassword: "dom_master_99",
          taskInstruction: "Buatlah aplikasi To-Do List interaktif menggunakan vanilla JavaScript dan DOM Manipulation.\n\nPersyaratan:\n1. Bisa menambah, menghapus, dan menandai tugas selesai\n2. Gunakan event delegation untuk efisiensi\n3. Simpan data ke localStorage agar persist setelah refresh\n4. Tambahkan fitur filter (Semua, Selesai, Belum Selesai)\n5. Push ke GitHub dan deploy di Vercel/Netlify",
          konten: `## Apa itu DOM?

DOM (Document Object Model) adalah **representasi struktur HTML sebagai objek tree** yang bisa dimanipulasi JavaScript.

## Mengambil Elemen

\`\`\`javascript
const header = document.getElementById("header");
const card = document.querySelector(".card");
const allCards = document.querySelectorAll(".card");

allCards.forEach(card => {
    console.log(card.textContent);
});
\`\`\`

## Mengubah Elemen

\`\`\`javascript
const title = document.querySelector("h1");
title.textContent = "Judul Baru!";
title.style.color = "blue";
title.classList.add("active");
title.classList.toggle("hidden");
\`\`\`

## Membuat & Menghapus Elemen

\`\`\`javascript
const newCard = document.createElement("div");
newCard.classList.add("card");
newCard.innerHTML = "<h3>Card Baru</h3><p>Konten</p>";
document.querySelector("#container").appendChild(newCard);
newCard.remove();
\`\`\`

## Event Handling

\`\`\`javascript
const button = document.querySelector("#my-btn");
button.addEventListener("click", (e) => {
    e.target.textContent = "Diklik!";
});

// Event Delegation
document.querySelector("#list").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        e.target.closest("li").remove();
    }
});
\`\`\`

## Studi Kasus: To-Do List

\`\`\`javascript
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const li = document.createElement("li");
    li.innerHTML = \`
        <span>\${text}</span>
        <button class="hapus-btn">✕</button>
    \`;
    list.appendChild(li);
    input.value = "";
});

list.addEventListener("click", (e) => {
    if (e.target.classList.contains("hapus-btn")) {
        e.target.parentElement.remove();
    }
    if (e.target.tagName === "SPAN") {
        e.target.classList.toggle("selesai");
    }
});
\`\`\`

---

> **PASSWORD_KUIS: \`dom_master_99\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
      ],
    });

    // ==================== KELAS 3: REACT.JS ====================
    const react = await prisma.course.create({
      data: { judul: "React.js untuk Pemula", deskripsi: "Bangun aplikasi web interaktif dengan React dari nol hingga mahir hooks dan state management.", pengajarId: pengajar.id, isPublished: true },
    });

    await prisma.module.createMany({
      data: [
        {
          judul: "Pengenalan React", urutan: 1, courseId: react.id, quizPassword: "react_intro_ok",
          konten: `## Apa itu React?

React adalah **library JavaScript** yang dibuat oleh Facebook (Meta) untuk membangun **user interface (UI)** yang interaktif. React menggunakan konsep **component-based** — setiap bagian UI adalah component yang bisa dipakai ulang.

## Mengapa React Populer?
- **Component-Based** — UI dibagi jadi potongan kecil yang reusable
- **Virtual DOM** — Render ulang yang efisien
- **Declarative** — Deskripsikan "apa" yang ingin ditampilkan, bukan "bagaimana"
- **Ekosistem besar** — Next.js, React Native, dll.

## Setup Project

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

Atau dengan Vite (lebih cepat):
\`\`\`bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
\`\`\`

## JSX: HTML di dalam JavaScript

\`\`\`jsx
function App() {
    const nama = "Budi";
    const isLoggedIn = true;

    return (
        <div className="App">
            <h1>Hello, {nama}!</h1>
            {isLoggedIn ? <p>Selamat datang!</p> : <p>Silakan login.</p>}
            <button onClick={() => alert("Diklik!")}>Klik Saya</button>
        </div>
    );
}
\`\`\`

---

> **PASSWORD_KUIS: \`react_intro_ok\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Component & Props", urutan: 2, courseId: react.id, quizPassword: "comp_props_guru",
          konten: `## Functional Component

\`\`\`jsx
function Greeting() {
    return <h1>Hello, World!</h1>;
}

function UserProfile() {
    return (
        <div className="profile-card">
            <h2>Budi Santoso</h2>
            <p>budi@email.com</p>
        </div>
    );
}
\`\`\`

## Props: Mengirim Data

\`\`\`jsx
function Card({ title, description, author }) {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{description}</p>
            <span>Oleh: {author}</span>
        </div>
    );
}

function App() {
    return (
        <div>
            <Card title="Belajar React" description="Tutorial React" author="Budi" />
            <Card title="JavaScript ES6+" description="Fitur modern JS" author="Ani" />
        </div>
    );
}
\`\`\`

## Props dengan Children

\`\`\`jsx
function Container({ children, title }) {
    return (
        <div className="container">
            <h2>{title}</h2>
            <div className="content">{children}</div>
        </div>
    );
}

function App() {
    return (
        <Container title="Dashboard">
            <p>Konten di dalam container.</p>
            <button>Klik Saya</button>
        </Container>
    );
}
\`\`\`

## Conditional Rendering & List

\`\`\`jsx
function TodoList({ todos }) {
    if (todos.length === 0) return <p>Tidak ada tugas.</p>;

    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id} className={todo.done ? "line-through" : ""}>
                    {todo.text}
                </li>
            ))}
        </ul>
    );
}
\`\`\`

---

> **PASSWORD_KUIS: \`comp_props_guru\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "State & useEffect", urutan: 3, courseId: react.id, quizPassword: "state_hook_wizard",
          taskInstruction: "Buatlah aplikasi Pencarian Film menggunakan React dengan useState dan useEffect.\n\nPersyaratan:\n1. Gunakan OMDb API (https://www.omdbapi.com/) untuk data film\n2. Buat fitur search dengan debounce 500ms\n3. Tampilkan hasil dalam grid card (poster, judul, tahun)\n4. Tambahkan loading state dan error handling\n5. Push ke GitHub dan deploy di Vercel",
          konten: `## useState Hook

\`\`\`jsx
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Tambah</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}
\`\`\`

## State dengan Object & Array

\`\`\`jsx
function ShoppingList() {
    const [items, setItems] = useState([]);
    const [input, setInput] = useState("");

    function addItem() {
        if (!input.trim()) return;
        setItems(prev => [...prev, { id: Date.now(), text: input }]);
        setInput("");
    }

    function removeItem(id) {
        setItems(prev => prev.filter(item => item.id !== id));
    }

    return (
        <div>
            <input value={input} onChange={e => setInput(e.target.value)} />
            <button onClick={addItem}>Tambah</button>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        {item.text}
                        <button onClick={() => removeItem(item.id)}>✕</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
\`\`\`

## useEffect Hook

\`\`\`jsx
import { useState, useEffect } from "react";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("https://jsonplaceholder.typicode.com/users");
                const data = await res.json();
                setUsers(data);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []); // [] = sekali saat mount

    if (loading) return <p>Loading...</p>;
    return (
        <ul>
            {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    );
}
\`\`\`

## Cleanup Effect

\`\`\`jsx
function Timer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval); // Cleanup!
    }, []);

    return <p>Timer: {seconds}s</p>;
}
\`\`\`

---

> **PASSWORD_KUIS: \`state_hook_wizard\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "Event Handling & Form", urutan: 4, courseId: react.id, quizPassword: "event_form_pro",
          konten: `## Event Handling di React

\`\`\`jsx
function App() {
    function handleClick() {
        alert("Tombol diklik!");
    }

    function handleInputChange(e) {
        console.log("Input:", e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Form disubmit!");
    }

    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleInputChange} />
            <button onClick={handleClick}>Klik</button>
            <button type="submit">Submit</button>
        </form>
    );
}
\`\`\`

## Controlled Form

\`\`\`jsx
function LoginForm() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.email.includes("@")) {
            setError("Email tidak valid!");
            return;
        }
        if (form.password.length < 6) {
            setError("Password minimal 6 karakter!");
            return;
        }
        setError("");
        console.log("Login:", form);
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
            <button type="submit">Login</button>
        </form>
    );
}
\`\`\`

---

> **PASSWORD_KUIS: \`event_form_pro\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
        {
          judul: "useContext & useReducer", urutan: 5, courseId: react.id, quizPassword: "context_reducer_2024",
          konten: `## useContext: Global State Sederhana

\`\`\`jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark");
    const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

function Navbar() {
    const { theme, toggle } = useContext(ThemeContext);
    return (
        <nav className={theme}>
            <button onClick={toggle}>Ganti Tema</button>
        </nav>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Navbar />
        </ThemeProvider>
    );
}
\`\`\`

## useReducer: State Complex

\`\`\`jsx
import { useReducer } from "react";

function reducer(state, action) {
    switch (action.type) {
        case "increment": return { count: state.count + 1 };
        case "decrement": return { count: state.count - 1 };
        case "reset": return { count: 0 };
        default: return state;
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0 });

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: "increment" })}>+</button>
            <button onClick={() => dispatch({ type: "decrement" })}>-</button>
            <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
        </div>
    );
}
\`\`\`

## Studi Kasus: Shopping Cart

\`\`\`jsx
function cartReducer(state, action) {
    switch (action.type) {
        case "add": {
            const exists = state.find(item => item.id === action.payload.id);
            if (exists) {
                return state.map(item =>
                    item.id === action.payload.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }
            return [...state, { ...action.payload, qty: 1 }];
        }
        case "remove":
            return state.filter(item => item.id !== action.payload);
        case "updateQty":
            return state.map(item =>
                item.id === action.payload.id
                    ? { ...item, qty: action.payload.qty }
                    : item
            );
        default:
            return state;
    }
}
\`\`\`

---

> **PASSWORD_KUIS: \`context_reducer_2024\`**
> Salin password ini ke kolom kuis di bawah untuk menandai modul ini selesai!`,
        },
      ],
    });

    return NextResponse.json({
      message: "Berhasil membuat 3 kelas dengan 15 modul materi lengkap!",
      pengajar: pengajar.email,
      courses: [html.judul, js.judul, react.judul],
    });
  } catch (error) {
    console.error("=== SEED ERROR ===");
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
