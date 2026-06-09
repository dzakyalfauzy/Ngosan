import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Menambahkan kelas lanjutan...");

  const pengajar = await prisma.user.findFirst({ where: { role: "PENGAJAR" } });
  if (!pengajar) {
    console.error("❌ Tidak ditemukan user PENGAJAR.");
    process.exit(1);
  }
  console.log(`👨‍🏫 Pengajar: ${pengajar.nama}`);

  // ============================================================
  // KELAS 1: TypeScript Mastery untuk Developer
  // ============================================================
  const ts = await prisma.course.create({
    data: {
      judul: "TypeScript Mastery untuk Developer",
      deskripsi: "Kuasai TypeScript dari nol hingga advanced. Pelajari type system, generics, utility types, dan bagaimana TypeScript menjadikan kode JavaScript lebih aman dan mudah di-maintain.",
      pengajarId: pengajar.id,
      isPublished: true,
    },
  });

  await prisma.module.createMany({
    data: [
      {
        judul: "Type System & Type Annotations",
        urutan: 1,
        courseId: ts.id,
        quizPassword: "ts_type_paham",
        taskInstruction: "## 🎯 Tugas: Tipe Data Custom untuk Sistem Perpustakaan\n\nBuatlah file TypeScript yang mendefinisikan minimal 5 interface terkait sistem perpustakaan: Book, Author, Library, Loan, dan Member.\n\n### Kriteria:\n1. Setiap interface punya minimal 5 properties dengan tipe yang tepat\n2. Gunakan union type untuk field status (misal: `status: \"active\" | \"inactive\" | \"archived\"`)\n3. Buat type `BookWithAuthor` yang menggabungkan Book dengan Author\n4. Gunakan optional chaining untuk property opsional\n5. Push ke GitHub dan lampirkan link file .ts Anda",
        konten: `## 🔷 Type System & Type Annotations: Fondasi Keamanan Kode

---

### 1. Analogi Dunia Nyata: Label pada Kotak

Bayangkan kamu punya banyak **kotak penyimpanan** di gudang. Jika semua kotak **tidak berlabel**, kamu harus membuka setiap kotak untuk mengetahui isinya. Sangat tidak efisien.

Tapi jika setiap kotak punya **label yang jelas**:
- Kotak A: "Alat Tulis" → Isinya pulpen, pensil, penghapus
- Kotak B: "Dokumen" → Isinya KTP, SIM, kartu nama
- Kotak C: "Elektronik" → Isinya charger, kabel, headset

Sekarang kamu bisa mencari barang **tanpa membuka kotak**. Cukup lihat labelnya.

**TypeScript bekerja persis seperti label pada kotak.**

Di JavaScript biasa:
\`\`\`javascript
// Tidak ada label — kita tidak tahu isinya apa
let data = "Budi";
data = 123; // Tiba-tiba jadi angka? Tidak ada yang melarang!
data = [1, 2, 3]; // Sekarang jadi array?
\`\`\`

Di TypeScript:
\`\`\`typescript
// Ada label — tahu persis isinya apa
let nama: string = "Budi";
nama = 123; // ❌ Error! Type 'number' tidak bisa ditugaskan ke 'string'
\`\`\`

---

### 2. The "Why": Mengapa Kita Butuh TypeScript?

#### Masalah JavaScript Tanpa Type

Bayangkan fungsi \`calculateTotal\`:

\`\`\`javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Bisa dipanggil dengan data yang salah tanpa error
calculateTotal("hello"); // ❌ Runtime error!
calculateTotal([{ price: "100", qty: 2 }]); // ❌ "100" * 2 = "100100" (string concatenation)
\`\`\`

Error ini baru muncul **saat kode dijalankan**, bukan saat ditulis. Bayangkan error ini ada di production dan baru diketahui oleh user!

#### Solusi: TypeScript

\`\`\`typescript
interface CartItem {
  price: number;
  qty: number;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ✅ Tipe diketahui dari awal
calculateTotal([{ price: 100, qty: 2 }]); // 200

// ❌ Error TERDETEKSI SAAT MENULIS KODE (sebelum dijalankan)
calculateTotal("hello"); // Argument of type 'string' is not assignable
\`\`\`

**Manfaat TypeScript:**
- **Type safety**: Error diketahui saat menulis kode, bukan saat runtime
- **Autocomplete**: IDE tahu persis property apa yang tersedia
- **Refactoring aman**: Ubah nama property → IDE langsung beri tahu semua tempat yang perlu diubah
- **Dokumentasi hidup**: Tipe data JADI dokumentasi — tidak perlu tebak isi variabel

---

### 3. Panduan Koding Step-by-Step

#### Primitif Types

\`\`\`typescript
// String — teks
const nama: string = "Budi Santoso";
const greeting: string = \`Halo, \${nama}\`;

// Number — angka (integer & decimal)
const umur: number = 25;
const harga: number = 99.99;
const hex: number = 0xff;

// Boolean — true/false
const isActive: boolean = true;
const isAdmin: boolean = false;

// Null & Undefined
const data: null = null;
const result: undefined = undefined;

// Array
const angka: number[] = [1, 2, 3];
const namaArray: Array<string> = ["Budi", "Ani"];

// Tuple — array dengan tipe tetap
const user: [string, number] = ["Budi", 25];
// user = [25, "Budi"]; // ❌ Error! Urutan salah

// Any — hindari penggunaan ini
const bebas: any = "bisa apa saja"; // ❌ Tidak aman

// Unknown — lebih aman dari any
const input: unknown = getData();
// Harus di-type check dulu sebelum digunakan
\`\`\`

#### Interfaces

\`\`\`typescript
// Mendefinisikan bentuk object
interface User {
  id: number;
  nama: string;
  email: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
}

// Property opsional dengan ?
interface Product {
  id: number;
  nama: string;
  harga: number;
  diskon?: number; // Opsional
}

// Extends — mewarisi properti dari interface lain
interface AdminUser extends User {
  permissions: string[];
}

// Menggunakan interface
const user: User = {
  id: 1,
  nama: "Budi",
  email: "budi@test.com",
  role: "admin",
  createdAt: new Date(),
};
\`\`\`

#### Type Aliases

\`\`\`typescript
// Type bisa untuk primitif, union, dan complex types
type ID = string | number;
type Status = "pending" | "active" | "completed";

// Object type
type Point = {
  x: number;
  y: number;
};

// Intersection (menggabungkan)
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type UserWithTimestamp = User & Timestamped;

// Union type
type Result = Success | Error;
type Success = { ok: true; data: unknown };
type Error = { ok: false; message: string };
\`\`\`

#### Function Types

\`\`\`typescript
// Parameter dan return type
function tambah(a: number, b: number): number {
  return a + b;
}

// Arrow function
const kali = (a: number, b: number): number => a * b;

// Parameter opsional
function greet(nama: string, greeting?: string): string {
  return \`\${greeting || "Hello"}, \${nama}!\`;
}

// Rest parameter
function sum(...angka: number[]): number {
  return angka.reduce((a, b) => a + b, 0);
}

// Function type
type Callback = (data: string) => void;

function processData(data: string, callback: Callback) {
  callback(data);
}
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Menggunakan \`any\` Secara Berlebihan

\`\`\`typescript
// ❌ SALAH — any menghilangkan semua keamanan type
let data: any = "hello";
data = 123; // Tidak error!
data.nonExistentMethod(); // Runtime error!

// ✅ BENAR — gunakan unknown dan type guard
let data: unknown = "hello";
if (typeof data === "string") {
  console.log(data.toUpperCase()); // Aman!
}
\`\`\`

#### ❌ Error #2: Lupa Type Annotation pada Return

\`\`\`typescript
// ❌ TypeScript menebak return type (bisa salah)
function parseJSON(str: string) {
  return JSON.parse(str); // Return type: any
}

// ✅ BENAR — tentukan return type secara eksplisit
function parseJSON(str: string): unknown {
  return JSON.parse(str);
}
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| Type Annotation | Menambahkan tipe pada variabel, parameter, dan return |
| Interface | Mendefinisikan bentuk object dengan properti tertentu |
| Type Alias | Membuat nama tipe sendiri (bisa primitif, union, complex) |
| Union Type | Tipe yang bisa salah satu dari beberapa pilihan |
| Generic | Tipe yang bisa disesuaikan saat dipakai |
| Type Guard | Pemeriksaan tipe di runtime (\`typeof\`, \`instanceof\`) |

> **PASSWORD_KUIS: \`ts_type_paham\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "Generics & Utility Types",
        urutan: 2,
        courseId: ts.id,
        quizPassword: "ts_generics_pro",
        taskInstruction: "## 🎯 Tugas: Buat Generic API Client\n\nBuatlah class Generic \`ApiClient<T>\` yang bisa fetch data dari API dan return data dengan tipe yang benar.\n\n### Kriteria:\n1. Class punya method \`get(url: string): Promise<T>\`\n2. Saat membuat instance, tentukan tipenya: \`new ApiClient<User[]>()\`\n3. Method \`get\` harus return data yang sudah ter-type\n4. Handle error dengan try-catch\n5. Push ke GitHub",
        konten: `## 🔷 Generics & Utility Types: Membuat Kode yang Fleksibel

---

### 1. Analogi: Mesin Fotokopi

Bayangkan kamu punya **mesin fotokopi**. Mesin ini bisa memfotokopi **apa saja**: dokumen, foto, kartu nama, sertifikat. Mesinnya SAMA, tapi output-nya BERBEDA tergantung apa yang kamu masukkan.

**Generic di TypeScript** bekerja seperti mesin fotokopi. Kamu membuat fungsi/class yang bisa bekerja dengan BANYAK tipe, tapi tetap menjaga keamanan tipe.

Tanpa Generic:
\`\`\`typescript
// Fungsi ini hanya bisa terima number
function firstElement(arr: number[]): number {
  return arr[0];
}

firstElement([1, 2, 3]); // ✅ 1
firstElement(["a", "b"]); // ❌ Error!
\`\`\`

Dengan Generic:
\`\`\`typescript
// Fungsi ini bisa terima array tipe APA SAJA
function firstElement<T>(arr: T[]): T {
  return arr[0];
}

firstElement<number>([1, 2, 3]);     // ✅ 1 (type: number)
firstElement<string>(["a", "b"]);    // ✅ "a" (type: string)
\`\`\`

---

### 2. The "Why": Mengapa Generic Penting?

Bayangkan kamu ingin membuat fungsi \`getId\` yang mengembalikan ID dari objek. Tanpa generic, kamu harus membuat versi berbeda untuk setiap tipe:

\`\`\`typescript
// ❌ Tanpa generic — banyak duplikasi
function getUserById(arr: User[]): number { return arr[0].id; }
function getPostById(arr: Post[]): string { return arr[0].id; }
function getBookById(arr: Book[]): number { return arr[0].id; }
// Hampir SAMA semua!
\`\`\`

Dengan generic:
\`\`\`typescript
// ✅ Dengan generic — satu fungsi untuk semua tipe
interface HasId { id: number | string; }

function getById<T extends HasId>(arr: T[]): T {
  return arr[0];
}

getById<User>(users);  // Return type: User
getById<Post>(posts);  // Return type: Post
getById<Book>(books);  // Return type: Book
\`\`\`

---

### 3. Panduan Koding

#### Generic pada Function

\`\`\`typescript
// Generic dengan constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { nama: "Budi", umur: 25, email: "budi@test.com" };

getProperty(user, "nama");   // ✅ "Budi" (type: string)
getProperty(user, "umur");   // ✅ 25 (type: number)
getProperty(user, "telepon"); // ❌ Error! "telepon" tidak ada di object
\`\`\`

#### Generic pada Interface

\`\`\`typescript
// Response API generic
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Digunakan dengan tipe berbeda
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, nama: "Budi", email: "budi@test.com" },
  message: "Berhasil",
};

const postResponse: ApiResponse<Post[]> = {
  success: true,
  data: [{ id: 1, judul: "Hello" }],
  message: "Berhasil",
};
\`\`\`

#### Generic pada Class

\`\`\`typescript
// Stack — struktur data LIFO
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.pop(); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
stringStack.pop(); // "world"
\`\`\`

#### Utility Types Built-in

\`\`\`typescript
interface User {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

// Partial — semua property jadi opsional
type UpdateUser = Partial<User>;
// { id?: number; nama?: string; email?: string; ... }

// Required — semua property jadi wajib
type StrictUser = Required<User>;

// Pick — ambil beberapa property saja
type UserBasic = Pick<User, "id" | "nama" | "email">;
// { id: number; nama: string; email: string }

// Omit — hapus beberapa property
type UserWithoutPassword = Omit<User, "password">;
// { id: number; nama: string; email: string; role: ... }

// Record — object dengan key-value type tertentu
type UserRoles = Record<string, "admin" | "user" | "guest">;
// { "Budi": "admin", "Ani": "user" }
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Generic Constraint yang Terlalu Ketat

\`\`\`typescript
// ❌ Terlalu spesifik — tidak bisa dipakai untuk tipe lain
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");    // ✅ 5
getLength([1, 2, 3]);  // ✅ 3
getLength(12345);       // ❌ Error! number tidak punya .length

// ✅ Benar — gunakan interface yang lebih fleksibel
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| \`<T>\` | Parameter tipe generic — bisa diisi tipe apa saja |
| \`T extends X\` | Constraint — generic harus memenuhi syarat tertentu |
| \`keyof\` | Mengambil semua property name dari object sebagai union type |
| \`Partial<T>\` | Membuat semua property jadi opsional |
| \`Pick<T, K>\` | Mengambil beberapa property saja |
| \`Omit<T, K>\` | Menghapus beberapa property |

> **PASSWORD_KUIS: \`ts_generics_pro\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "Type Narrowing & Type Guards",
        urutan: 3,
        courseId: ts.id,
        quizPassword: "ts_narrow_solid",
        taskInstruction: "## 🎯 Tugas: Discriminated Unions untuk Notifikasi\n\nBuatlah sistem notifikasi menggunakan Discriminated Unions. Ada 3 tipe: Success, Error, dan Warning. Masing-masing punya data berbeda.\n\n### Kriteria:\n1. Definisikan union type \`Notification\` dengan 3 varian\n2. Buat fungsi \`renderNotification(n: Notification)\` yang menampilkan pesan berbeda per tipe\n3. Gunakan \`switch\` dengan narrowing otomatis\n4. Tidak ada \`any\` atau \`as\` yang dipaksakan\n5. Push ke GitHub",
        konten: `## 🔷 Type Narrowing & Type Guards: Membuat Kode Lebih Pintar

---

### 1. Analogi: Pintu Berlabel

Bayangkan kamu di gedung dengan 3 pintu:
- Pintu merah → Ruang Server
- Pintu biru → Ruang Meeting
- Pintu hijau → Ruang Istirahat

Kamu TIDAK BOLEH masuk pintu merah jika kamu bukan programmer. Kamu TIDAK BOLEH masuk pintu biri jika kamu bukan manager. **Kamu harus tahu pintu mana yang boleh dimasuki berdasarkan kondisi.**

Type narrowing = memastikan tipe data **sudah benar** sebelum menggunakannya.

---

### 2. The "Why": Masalah Tanpa Narrowing

\`\`\`typescript
type StringOrNumber = string | number;

function tambah(a: StringOrNumber, b: StringOrNumber): StringOrNumber {
  return a + b; // ❌ Error! Operator + tidak bisa langsung dipakai
  //            // untuk union type
}
\`\`\`

---

### 3. Panduan Koding

#### typeof Narrowing

\`\`\`typescript
function formatInput(input: string | number): string {
  if (typeof input === "string") {
    // Di sini TypeScript TAHU input adalah string
    return input.toUpperCase();
  }
  // Di sini TypeScript TAHU input adalah number
  return input.toFixed(2);
}

console.log(formatInput("hello"));  // "HELLO"
console.log(formatInput(3.14159));  // "3.14"
\`\`\`

#### instanceof Narrowing

\`\`\`typescript
function handleError(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.message);  // ✅ Error properties tersedia
    console.log(error.stack);
  } else {
    console.log(error);  // ✅ Sudah pasti string
  }
}
\`\`\`

#### Discriminated Unions

\`\`\`typescript
// Setiap tipe punya "discriminator" (property yang membedakan)
type Success = { kind: "success"; data: unknown };
type Error = { kind: "error"; message: string };
type Loading = { kind: "loading" };

type Result = Success | Error | Loading;

function handleResult(result: Result) {
  switch (result.kind) {
    case "success":
      console.log("Data:", result.data);   // ✅ data tersedia
      break;
    case "error":
      console.log("Error:", result.message); // ✅ message tersedia
      break;
    case "loading":
      console.log("Loading...");            // ✅ tidak ada property lain
      break;
  }
}
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Menggunakan \`as\` untuk Memaksa Type

\`\`\`typescript
// ❌ SALAH — as bisa menipu TypeScript
const data = "hello";
const angka = data as number; // Tidak error, tapi SALAH di runtime!

// ✅ BENAR — gunakan type guard
if (typeof data === "number") {
  console.log(data.toFixed(2)); // Aman!
}
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| Type Narrowing | Mengecilkan type dari union menjadi spesifik |
| typeof guard | Pemeriksaan tipe primitif (\`string\`, \`number\`, \`boolean\`) |
| instanceof | Pemeriksaan tipe class (\`Error\`, \`Date\`) |
| Discriminated Union | Union dengan property \`kind\`/\`type\` sebagai pembeda |
| Never type | Type yang tidak mungkin tercapai (exhaustive check) |

> **PASSWORD_KUIS: \`ts_narrow_solid\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
    ],
  });
  console.log("✅ Kelas 1: TypeScript Mastery (3 modul)");

  // ============================================================
  // KELAS 2: CSS Mastery — Tailwind CSS & Modern Styling
  // ============================================================
  const css = await prisma.course.create({
    data: {
      judul: "CSS Mastery — Tailwind CSS & Modern Styling",
      deskripsi: "Kuasai CSS dari dasar hingga Tailwind CSS v4. Pelajari box model, flexbox, grid, responsive design, dan cara membangun UI yang profesional menggunakan utility-first CSS.",
      pengajarId: pengajar.id,
      isPublished: true,
    },
  });

  await prisma.module.createMany({
    data: [
      {
        judul: "CSS Box Model & Selectors",
        urutan: 1,
        courseId: css.id,
        quizPassword: "css_box_master",
        taskInstruction: "## 🎯 Tugas: Buat Profile Card\n\nBuatlah komponen Profile Card menggunakan HTML dan CSS murni (tanpa Tailwind).\n\n### Kriteria:\n1. Avatar bulat dengan border\n2. Nama besar, bio kecil\n3. 3 tombol dengan warna berbeda\n4. Card harus responsif\n5. Gunakan box-shadow dan border-radius\n6. Push ke GitHub",
        konten: `## 🎨 CSS Box Model & Selectors: Membentuk Elemen Web

---

### 1. Analogi: Kotak Berlapis

Bayangkan kamu punya **kotak hadiah**. Setiap kotak punya:
- **Isi** (content) — hadiah di dalam kotak
- **Bungkus** (padding) — kertas tissue di dalam kotak
- **Kotak** (border) — dinding kotaknya
- **Jarak** (margin) — jarak kotak ini dengan kotak lain

CSS Box Model bekerja persis seperti ini. SETIAP elemen HTML adalah "kotak" dengan 4 lapisan.

---

### 2. The "Why": Mengapa Box Model Penting?

Tanpa memahami box model, layout kamu akan berantakan:
- Elemen bertumpuk karena margin tidak terkontrol
- Teks mepet ke tepi karena tidak ada padding
- Lebar elemen melebihi container karena border tidak dihitung

---

### 3. Panduan Koding

#### Box Model Properties

\`\`\`css
.card {
  /* Content — isi elemen */
  width: 300px;
  height: 200px;

  /* Padding — jarak content ke border */
  padding: 20px;

  /* Border — garis tepi */
  border: 2px solid #333;

  /* Margin — jarak ke elemen lain */
  margin: 16px;

  /* Box-sizing — border & padding dihitung di dalam width */
  box-sizing: border-box;
}

/* Reset universal — sangat disarankan */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
\`\`\`

#### Selectors

\`\`\`css
/* Element selector */
h1 { color: blue; }

/* Class selector */
.card { padding: 20px; border-radius: 8px; }

/* ID selector */
#header { background: #333; color: white; }

/* Descendant selector */
.sidebar .nav-item { list-style: none; }

/* Pseudo-class */
a:hover { color: red; }
input:focus { outline: 2px solid blue; }
button:active { transform: scale(0.95); }
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Lupa \`box-sizing: border-box\`

Tanpa \`border-box\`, padding dan border **ditambahkan** ke width, bukan dihitung di dalamnya. Akibatnya, elemen melebihi container.

\`\`\`css
/* ❌ Tanpa box-sizing */
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* Total width = 300 + 40 + 4 = 344px! */

/* ✅ Dengan box-sizing */
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  box-sizing: border-box;
  /* Total width tetap 300px */
\`\`\`

---

> **PASSWORD_KUIS: \`css_box_master\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "Flexbox & CSS Grid Mastery",
        urutan: 2,
        courseId: css.id,
        quizPassword: "css_layout_pro",
        taskInstruction: "## 🎯 Tugas: Buat Dashboard Layout\n\nBuatlah layout dashboard dengan CSS Grid: sidebar kiri (250px), header atas, dan konten utama yang fleksibel.\n\n### Kriteria:\n1. Sidebar fixed di kiri\n2. Header sticky di atas konten\n3. Konten utama auto-size\n4. Responsif: sidebar jadi drawer di mobile\n5. Gunakan \`grid-template-areas\` atau \`grid-template-columns/rows\`",
        konten: `## 🎨 Flexbox & CSS Grid: Layout Modern

---

### 1. Analogi

**Flexbox** = menyusun barang di **satu rak** (horizontal atau vertikal). Kamu bisa atur jarak, rata kiri/kanan, dan ukuran setiap barang.

**CSS Grid** = menyusun barang di **rak bertingkat** (2 dimensi). Kamu bisa atur kolom DAN baris sekaligus.

---

### 2. The "Why"

Tanpa Flexbox/Grid, kamu harus:
- Menggunakan \`float\` yang ribet dan rawan error
- Menggunakan \`position: absolute\` yang membuat elemen "keluar" dari flow
- Menulis CSS yang tidak responsif

---

### 3. Panduan Koding

#### Flexbox

\`\`\`css
.container {
  display: flex;
  justify-content: space-between; /* Distribusi ruang horizontal */
  align-items: center;            /* Rata tengah vertikal */
  gap: 16px;                      /* Jarak antar item */
  flex-wrap: wrap;                /* Wrap jika tidak muat */
}

.item {
  flex: 1;          /* Ambil ruang sama rata */
  flex-shrink: 0;   /* Jangan mengecil */
  flex-basis: 200px; /* Lebar dasar */
}
\`\`\`

#### CSS Grid

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;  /* Sidebar + konten */
  grid-template-rows: 60px 1fr;      /* Header + body */
  grid-template-areas:
    "sidebar header"
    "sidebar content";
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header; }
.content { grid-area: content; }

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "content";
  }
  .sidebar { display: none; }
}
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Flex items tidak rata karena gap tidak konsisten

Gunakan \`gap\` daripada \`margin\` pada flex items untuk konsistensi jarak.

---

> **PASSWORD_KUIS: \`css_layout_pro\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "Responsive Design & Tailwind CSS v4",
        urutan: 3,
        courseId: css.id,
        quizPassword: "css_responsive_ok",
        taskInstruction: "## 🎯 Tugas: Landing Page Responsive\n\nBuatlah landing page responsif menggunakan Tailwind CSS v4.\n\n### Kriteria:\n1. Navbar: horizontal di desktop, hamburger menu di mobile\n2. Hero section: teks besar di desktop, lebih kecil di mobile\n3. Grid features: 4 kolom desktop, 2 tablet, 1 mobile\n4. Footer: flex wrap\n5. Semua menggunakan Tailwind utility classes\n6. Push ke GitHub",
        konten: `## 🎨 Responsive Design & Tailwind CSS: UI untuk Semua Ukuran Layar

---

### 1. Analogi: Pakaian yang Pas di Badan

Bayangkan kamu membeli **jas**. Jas yang bagus harus:
- **Pas** di badanmu (tidak kebesaran, tidak kekecilan)
- **Nyaman** dipakai (tidak gerah, tidak sesak)
- **Sesuai acara** (formal, casual, sporty)

**Responsive design** = membuat website "pas" di semua ukuran layar — dari HP kecil hingga desktop besar.

---

### 2. The "Why": Mengapa Responsive Design Penting?

- **50%+ traffic web** datang dari mobile
- Google memberi **peringkat lebih tinggi** untuk website mobile-friendly
- User akan **pergi** jika harus zoom/scroll horizontal

---

### 3. Panduan Koding

#### Media Queries

\`\`\`css
/* Default: mobile-first */
.container {
  padding: 16px;
}

/* Tablet (768px ke atas) */
@media (min-width: 768px) {
  .container {
    padding: 32px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop (1024px ke atas) */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
\`\`\`

#### Tailwind Responsive Prefix

\`\`\`html
<!-- Mobile: 1 kolom, Tablet: 2 kolom, Desktop: 4 kolom -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
  <div class="card">4</div>
</div>

<!-- Teks: kecil di mobile, besar di desktop -->
<h1 class="text-xl sm:text-3xl lg:text-5xl font-bold">
  Judul Responsif
</h1>

<!-- Padding: kecil di mobile, besar di desktop -->
<div class="p-4 sm:p-8 lg:p-12">
  Konten
</div>
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Mobile-first vs Desktop-first

Gunakan **mobile-first** (default = mobile, tambah breakpoint untuk layar lebih besar). Lebih mudah di-maintain.

\`\`\`css
/* ❌ Desktop-first (sulit maintain) */
.container { max-width: 960px; }
@media (max-width: 768px) { .container { max-width: 100%; } }

/* ✅ Mobile-first (recommended) */
.container { max-width: 100%; }
@media (min-width: 768px) { .container { max-width: 960px; } }
\`\`\`

---

> **PASSWORD_KUIS: \`css_responsive_ok\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
    ],
  });
  console.log("✅ Kelas 2: CSS Mastery (3 modul)");

  // ============================================================
  // KELAS 3: DevOps Dasar — Git, Docker & Deployment
  // ============================================================
  const devops = await prisma.course.create({
    data: {
      judul: "DevOps Dasar — Git, Docker & Deployment",
      deskripsi: "Pelajari dasar-dasar DevOps untuk developer: version control dengan Git, containerisasi dengan Docker, CI/CD pipeline, dan deployment ke cloud. Persiapan wajib untuk bekerja di tim profesional.",
      pengajarId: pengajar.id,
      isPublished: true,
    },
  });

  await prisma.module.createMany({
    data: [
      {
        judul: "Git Version Control untuk Developer",
        urutan: 1,
        courseId: devops.id,
        quizPassword: "git_master_dev",
        taskInstruction: "## 🎯 Tugas: Buat Repository dengan Branching Strategy\n\nBuatlah repository GitHub dengan:\n1. Branch \`main\` (production-ready)\n2. Branch \`develop\` (development)\n3. Feature branch \`feature/login-page\` dari develop\n4. Lakukan minimal 3 commit di feature branch\n5. Merge ke develop, lalu squash merge ke main\n6. Lampirkan link repository dan screenshot history commit",
        konten: `## 🔄 Git Version Control: Mengelola Perubahan Kode

---

### 1. Analogi: Undo di Microsoft Word

Bayangkan kamu sedang menulis buku 300 halaman di Microsoft Word. Tiba-tiba kamu menyadari bahwa bab 5 yang kamu tulis kemarin ternyata salah. Di Word, kamu bisa pencet Ctrl+Z (undo) untuk kembali ke versi sebelumnya.

**Git adalah "Ctrl+Z" untuk SELURUH project coding**, tapi jauh lebih powerful:
- Bisa undo ke versi MANA SAJA (bukan cuma versi terakhir)
- Bisa membuat "cabang" (branch) untuk coba-coba tanpa mengganggu versi utama
- Bisa "merge" perubahan dari banyak orang secara bersamaan

---

### 2. The "Why": Mengapa Git Penting?

Tanpa Git:
- Tidak ada riwayat perubahan
- Sulit kolaborasi (saling overwrite file)
- Tidak ada backup versi sebelumnya
- Tidak ada branch untuk eksperimen

---

### 3. Panduan Koding

#### Setup Git

\`\`\`bash
# Konfigurasi
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"

# Inisialisasi repository
mkdir my-project && cd my-project
git init

# Cek status
git status
\`\`\`

#### Workflow Dasar

\`\`\`bash
# 1. Buat/edit file
echo "# My Project" > README.md

# 2. Stage (tandai perubahan untuk di-commit)
git add README.md           # Stage 1 file
git add .                   # Stage semua file

# 3. Commit (simpan snapshot)
git commit -m "feat: tambah README"

# 4. Push ke remote (GitHub)
git remote add origin https://github.com/user/repo.git
git push -u origin main
\`\`\`

#### Branching

\`\`\`bash
# Buat branch baru
git checkout -b feature/login

# Kerja di feature branch
# ... buat kode ...
git add .
git commit -m "feat: tambah halaman login"

# Merge ke main
git checkout main
git merge feature/login

# Hapus feature branch (sudah di-merge)
git branch -d feature/login
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Commit dengan pesan yang tidak jelas

\`\`\`bash
# ❌ SALAH
git commit -m "fix"
git commit -m "update"
git commit -m "tes"

# ✅ BENAR — gunakan Conventional Commits
git commit -m "feat: tambah form login"
git commit -m "fix: perbaiki validasi email"
git commit -m "refactor: pindahkan helper ke lib/utils"
\`\`\`

---

> **PASSWORD_KUIS: \`git_master_dev\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "Docker untuk Developer",
        urutan: 2,
        courseId: devops.id,
        quizPassword: "docker_intro_ok",
        taskInstruction: "## 🎯 Tugas: Dockerize Aplikasi Node.js\n\nBuatlah Dockerfile untuk aplikasi Node.js sederhana:\n\n### Kriteria:\n1. Gunakan base image \`node:20-alpine\`\n2. Copy package.json dan install dependencies\n3. Copy source code\n4. Expose port 3000\n5. Command untuk menjalankan app\n6. Buat juga \`.dockerignore\`\n7. Test build dengan \`docker build\` dan \`docker run\`",
        konten: `## 🐳 Docker untuk Developer: Konsistensi di Mana Saja

---

### 1. Analogi: Kontainer Kargo

Bayangkan kamu ingin mengirim **kitchen set** dari Jakarta ke Surabaya. Jika semua peralatan dikirim **terpisah** (kompor di truk A, meja di truk B, kursi di truk C), kemungkinan besar ada yang hilang atau rusak di jalan.

Solusinya: masukkan **SEMUA** ke dalam **kontainer kargo** yang tersegel. Kontainer ini berisi semua yang dibutuhkan kitchen set — dan hanya kontainer ini yang dikirim.

**Docker = kontainer kargo untuk aplikasi.**
Semua yang dibutuhkan aplikasi (code, dependencies, runtime, OS) dimasukkan ke dalam satu "container" yang bisa dijalankan di mana saja.

---

### 2. The "Why": Mengapa Docker Penting?

Masalah tanpa Docker:
- **"Di laptop saya jalan"** — di server tidak jalan karena beda versi OS/library
- Setup environment developer baru butuh berjam-jam
- Deploy manual dan rentan error
- Tidak bisa menjalankan banyak versi app yang berbeda

Solusi Docker:
- **Konsisten** — di mana pun dijalankan, hasilnya SAMA
- **Reproducible** — setup baru tinggal \`docker build\` + \`docker run\`
- **Isolated** — satu container tidak mengganggu container lain
- **Portable** — container bisa dipindah ke server manapun

---

### 3. Panduan Koding

#### Dockerfile

\`\`\`dockerfile
# Dockerfile untuk Node.js app

# 1. Base image
FROM node:20-alpine

# 2. Working directory
WORKDIR /app

# 3. Copy dependency files (agar cache lebih efisien)
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm ci --only=production

# 5. Copy source code
COPY . .

# 6. Expose port
EXPOSE 3000

# 7. Start command
CMD ["node", "src/index.ts"]
\`\`\`

#### .dockerignore

\`\`\`
node_modules
.next
.env
.git
\`\`\`

#### Build & Run

\`\`\`bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app

# List running containers
docker ps

# Stop container
docker stop <container-id>
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Tidak ada .dockerignore

Tanpa \`.dockerignore\`, folder \`node_modules\` akan di-copy ke container (bisa ratusan MB). Selalu buat \`.dockerignore\`.

---

> **PASSWORD_KUIS: \`docker_intro_ok\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
      {
        judul: "CI/CD & Deployment ke Cloud",
        urutan: 3,
        courseId: devops.id,
        quizPassword: "deploy_production",
        taskInstruction: "## 🎯 Tugas: Deploy ke Vercel dengan GitHub Actions\n\nBuatlah workflow CI/CD sederhana:\n\n### Kriteria:\n1. Buat file \`.github/workflows/deploy.yml\`\n2. Trigger: push ke branch \`main\`\n3. Steps: checkout, setup node, install, build, test\n4. Deploy ke Vercel (bisa pakai Vercel CLI)\n5. Lampirkan link workflow file di GitHub",
        konten: `## 🚀 CI/CD & Deployment ke Cloud: Dari Kode ke Production

---

### 1. Analogi: Pabrik Mobil

Di pabrik mobil ada **assembly line** (jalur perakitan):
1. **Unit 1**: Mengelas rangka
2. **Unit 2**: Memasang mesin
3. **Unit 3**: Mengecat body
4. **Unit 4**: Quality control
5. **Unit 5**: Packing dan kirim

Setiap unit tidak perlu menunggu unit selesai — mereka bisa bekerja **bersamaan**. Dan setiap mobil melewati **proses yang SAMA** secara otomatis.

**CI/CD = assembly line untuk kode software.**
- **CI (Continuous Integration)**: Kode yang di-push otomatis di-build dan di-test
- **CD (Continuous Delivery/Deployment)**: Jika test lolos, otomatis di-deploy ke production

---

### 2. The "Why": Mengapa CI/CD Penting?

Tanpa CI/CD:
- Deploy manual: copy file ke server → restart server → berharap tidak error
- Test dilakukan secara manual → sering terlewat
- Rollback sulit jika ada bug di production
- Tidak bisa deploy setiap hari karena prosesnya lambat

Dengan CI/CD:
- **Otomatis**: Kode di-push → test jalan → deploy
- **Konsisten**: Proses yang sama setiap kali
- **Aman**: Test harus lolos sebelum deploy
- **Cepat**: Deploy dalam hitungan menit

---

### 3. Panduan Koding

#### GitHub Actions Workflow

\`\`\`yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
\`\`\`

#### Vercel Deployment

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy (interactive)
vercel

# Deploy ke production
vercel --prod
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error: Secret tidak terbaca di workflow

Pastikan secrets ditambahkan di **Settings → Secrets and variables → Actions** di GitHub. Jangan hardcode token di file workflow!

---

> **PASSWORD_KUIS: \`deploy_production\`**
> Masukkan password ini di kuis untuk menandai modul ini selesai!`,
      },
    ],
  });
  console.log("✅ Kelas 3: DevOps Dasar (3 modul)");

  console.log("\n🎉 Semua kelas berhasil ditambahkan!");
  console.log("📚 3 kelas × 3 modul = 9 modul materi premium");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
