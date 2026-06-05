import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Menambahkan kelas Backend API...");

  const pengajar = await prisma.user.findFirst({ where: { role: "PENGAJAR" } });
  if (!pengajar) {
    console.error("❌ Tidak ditemukan user PENGAJAR.");
    process.exit(1);
  }
  console.log(`👨‍🏫 Pengajar: ${pengajar.nama}`);

  // ============================================================
  // KELAS: Backend API Production dengan Node.js & Prisma v7
  // ============================================================
  const course = await prisma.course.create({
    data: {
      judul: "Backend API Production dengan Node.js & Prisma v7",
      deskripsi: "Bangun REST API production-grade dari nol dengan Node.js, Express.js, dan Prisma ORM v7. Pelajari arsitektur API, desain database relasional, sistem autentikasi JWT, dan middleware keamanan. Dirancang untuk pemula dengan pendekatan pedagogi mendalam.",
      pengajarId: pengajar.id,
      isPublished: true,
    },
  });

  // ============================================================
  // MODUL 1: Arsitektur REST API & Express.js
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "Arsitektur REST API & Express.js",
      urutan: 1,
      courseId: course.id,
      quizPassword: "express_api",
      taskInstruction: `## 🎯 Tugas Praktik: Membuat Server Pertama dengan Routing Dasar

Buatlah server Express.js dengan minimal 5 endpoint RESTful untuk manajemen data "Buku".

### Spesifikasi Wajib:
1. **GET /api/books** — Ambil semua buku (dengan query filter: ?author=nama)
2. **GET /api/books/:id** — Ambil satu buku berdasarkan ID
3. **POST /api/books** — Tambah buku baru (validasi: title dan author wajib ada)
4. **PUT /api/books/:id** — Update data buku
5. **DELETE /api/books/:id** — Hapus buku

### Kriteria Penilaian (100):
- **Struktur Folder (20)**: Pisahkan routes, controllers, dan data dengan rapi
- **RESTful Convention (25)**: HTTP methods dan status codes yang benar (200, 201, 400, 404)
- **Error Handling (25)**: Try-catch di setiap handler, pesan error yang jelas
- **Middleware (15)**: Buat logger middleware yang mencetak method, URL, dan timestamp
- **Testing Manual (15)**: Lampirkan screenshot atau catatan hasil test di Postman/thunderclient

### Bonus:
- Tambahkan pagination: GET /api/books?page=1&limit=10
- Tambahkan sorting: GET /api/books?sort=title&order=asc`,
      konten: `## 🌐 Arsitektur REST API & Express.js: Fondasi Backend Modern

---

### 1. Analogi Dunia Nyata: Restoran dan API

Bayangkan kamu sedang di **restoran**. Kamu tidak masuk ke dapur sendiri untuk memasak. Sebaliknya:

1. Kamu duduk di meja dan melihat **menu** (dokumentasi API)
2. Kamu memanggil **pelayan** (HTTP request) dan pesan makanan
3. Pelayan menyampaikan pesanan ke **dapur** (server/backend)
4. Dapur menyiapkan makanan (memproses data)
5. Pelayan mengantarkan makanan ke mejamu (HTTP response)

**API (Application Programming Interface)** bekerja persis seperti ini. Frontend (kamu di meja) tidak perlu tahu bagaimana cara dapur memasak. Frontend hanya perlu tahu:
- **Menu apa yang tersedia** (endpoint apa yang ada)
- **Cara memesan** (format request yang benar)
- **Cara menerima pesanan** (format response yang diharapkan)

**REST (Representational State Transfer)** adalah aturan cara "memesan" yang disepakati bersama. Seperti etika di restoran: kamu tidak berteriak ke dapur, kamu menggunakan cara yang sopan dan terstruktur.

---

### 2. The "Why": Mengapa Kita Butuh API?

#### Masalah Tanpa API

Bayangkan kamu punya aplikasi toko online. Tanpa API:

\`\`\`
Browser User → Langsung akses Database → Tampilkan data
\`\`\`

Masalahnya:
- **Tidak aman**: Siapa pun bisa langsung akses database, termasuk menghapus data
- **Tidak terkontrol**: Tidak ada aturan siapa yang boleh melihat/edit apa
- **Tidak scalable**: Jika 10.000 user akses database langsung, database bisa crash

#### Solusi: API sebagai Perantara

\`\`\`
Browser User → API Server (perantara) → Database
\`\`\`

API bertindak sebagai **pintu gerbang** yang:
- **Memverifikasi identitas** user (autentikasi)
- **Mengecek izin** user (otorisasi)
- **Memvalidasi data** sebelum masuk ke database
- **Mengatur rate limit** agar server tidak kewalahan
- **Mengembalikan response** yang konsisten dan terstruktur

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Setup Project

\`\`\`bash
# Buat folder project
mkdir belajar-api && cd belajar-api

# Inisialisasi project Node.js
npm init -y

# Install Express.js
npm install express

# Install dev dependencies
npm install -D typescript @types/express @types/node tsx nodemon

# Inisialisasi TypeScript
npx tsc --init
\`\`\`

Buat struktur folder:

\`\`\`
belajar-api/
├── src/
│   ├── index.ts          ← Entry point server
│   ├── routes/
│   │   └── books.ts      ← Route definitions
│   ├── controllers/
│   │   └── books.ts      ← Business logic
│   ├── middleware/
│   │   └── logger.ts     ← Custom middleware
│   └── data/
│       └── books.ts      ← Data sementara (belum pakai DB)
├── package.json
└── tsconfig.json
\`\`\`

#### Langkah 2: Membuat Server Dasar

\`\`\`typescript
// src/index.ts
import express from "express";
import booksRouter from "./routes/books";
import { logger } from "./middleware/logger";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global: parse JSON body
app.use(express.json());

// Middleware global: logger
app.use(logger);

// Routes
app.use("/api/books", booksRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API Buku berjalan!",
    endpoints: {
      books: "/api/books",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server berjalan di http://localhost:\${PORT}\`);
});
\`\`\`

#### Langkah 3: Membuat Data & Controller

\`\`\`typescript
// src/data/books.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  genre: string;
}

export let books: Book[] = [
  { id: 1, title: "Belajar Node.js", author: "Budi Santoso", year: 2024, genre: "Programming" },
  { id: 2, title: "Mastering Express", author: "Ani Wijaya", year: 2023, genre: "Programming" },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", year: 2008, genre: "Software Engineering" },
];

let nextId = 4;

export function getNextId(): number {
  return nextId++;
}
\`\`\`

\`\`\`typescript
// src/controllers/books.ts
import { Request, Response } from "express";
import { books, getNextId, Book } from "../data/books";

// GET /api/books
export function getAllBooks(req: Request, res: Response) {
  try {
    let result = [...books];

    // Filter berdasarkan author (query parameter)
    const author = req.query.author as string;
    if (author) {
      result = result.filter((b) =>
        b.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Filter berdasarkan genre
    const genre = req.query.genre as string;
    if (genre) {
      result = result.filter((b) =>
        b.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    res.json({
      total: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
}

// GET /api/books/:id
export function getBookById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    const book = books.find((b) => b.id === id);

    if (!book) {
      return res.status(404).json({ error: \`Buku dengan ID \${id} tidak ditemukan\` });
    }

    res.json({ data: book });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
}

// POST /api/books
export function createBook(req: Request, res: Response) {
  try {
    const { title, author, year, genre } = req.body;

    // Validasi
    if (!title || !author) {
      return res.status(400).json({
        error: "Field 'title' dan 'author' wajib diisi",
      });
    }

    const newBook: Book = {
      id: getNextId(),
      title,
      author,
      year: year || new Date().getFullYear(),
      genre: genre || "Umum",
    };

    books.push(newBook);

    res.status(201).json({
      message: "Buku berhasil ditambahkan",
      data: newBook,
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan buku" });
  }
}

// PUT /api/books/:id
export function updateBook(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: \`Buku dengan ID \${id} tidak ditemukan\` });
    }

    // Update hanya field yang dikirim
    books[index] = {
      ...books[index],
      ...req.body,
      id, // ID tidak boleh berubah
    };

    res.json({
      message: "Buku berhasil diupdate",
      data: books[index],
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengupdate buku" });
  }
}

// DELETE /api/books/:id
export function deleteBook(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: \`Buku dengan ID \${id} tidak ditemukan\` });
    }

    const deleted = books.splice(index, 1)[0];

    res.json({
      message: "Buku berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus buku" });
  }
}
\`\`\`

#### Langkah 4: Membuat Routes

\`\`\`typescript
// src/routes/books.ts
import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books";

const router = Router();

router.get("/", getAllBooks);         // GET    /api/books
router.get("/:id", getBookById);     // GET    /api/books/:id
router.post("/", createBook);        // POST   /api/books
router.put("/:id", updateBook);      // PUT    /api/books/:id
router.delete("/:id", deleteBook);   // DELETE /api/books/:id

export default router;
\`\`\`

#### Langkah 5: Membuat Middleware Logger

\`\`\`typescript
// src/middleware/logger.ts
import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;

  console.log(\`[\${timestamp}] \${method} \${url}\`);

  // Lanjutkan ke handler berikutnya
  next();
}
\`\`\`

#### Langkah 6: Menjalankan Server

\`\`\`json
// package.json — tambahkan scripts
{
  "scripts": {
    "dev": "npx tsx watch src/index.ts",
    "start": "npx tsx src/index.ts"
  }
}
\`\`\`

\`\`\`bash
npm run dev
# Output: 🚀 Server berjalan di http://localhost:3000
\`\`\`

#### Langkah 7: Testing dengan curl

\`\`\`bash
# GET semua buku
curl http://localhost:3000/api/books

# GET buku by ID
curl http://localhost:3000/api/books/1

# POST buku baru
curl -X POST http://localhost:3000/api/books \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Belajar TypeScript", "author": "Citra Dewi"}'

# PUT update buku
curl -X PUT http://localhost:3000/api/books/1 \\
  -H "Content-Type: application/json" \\
  -d '{"year": 2025}'

# DELETE buku
curl -X DELETE http://localhost:3000/api/books/1
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Lupa \`app.use(express.json())\`

**Gejala:** \`req.body\` bernilai \`undefined\` saat menerima POST/PUT request.

**Penyebab:** Express tidak otomatis parse JSON body. Kamu harus menambahkan middleware \`express.json()\`.

\`\`\`typescript
// ❌ SALAH — req.body akan undefined
const app = express();
app.post("/api/books", (req, res) => {
  console.log(req.body); // undefined!
});

// ✅ BENAR — tambahkan express.json()
const app = express();
app.use(express.json()); // ← Tambahkan ini SEBELUM routes
app.post("/api/books", (req, res) => {
  console.log(req.body); // { title: "...", author: "..." }
});
\`\`\`

---

#### ❌ Error #2: Mengirim Response Dua Kali

**Gejala:** Error \`Cannot set headers after they are sent to the client\`.

**Penyebab:** Memanggil \`res.json()\` atau \`res.send()\` lebih dari sekali dalam satu handler.

\`\`\`typescript
// ❌ SALAH — ada 2 res.json()
app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (!book) {
    res.status(404).json({ error: "Tidak ditemukan" }); // Response pertama
  }

  res.json({ data: book }); // Response kedua → ERROR!
});

// ✅ BENAR — gunakan return untuk menghentikan eksekusi
app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (!book) {
    return res.status(404).json({ error: "Tidak ditemukan" }); // return menghentikan
  }

  res.json({ data: book });
});
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| REST API | Arsitektur untuk membangun web API menggunakan HTTP methods |
| Express.js | Framework Node.js untuk membuat server HTTP |
| HTTP Methods | GET (baca), POST (buat), PUT (update), DELETE (hapus) |
| Status Codes | 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found) |
| Middleware | Fungsi yang berjalan sebelum route handler |
| Request/Response | Request = data masuk, Response = data keluar |

> **PASSWORD_KUIS: \`express_api\`**
> Temukan password ini dan buktikan kamu memahami fondasi REST API!`,
    },
  });

  // ============================================================
  // MODUL 2: Database Relasional dengan Prisma v7
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "Database Relasional dengan Prisma v7",
      urutan: 2,
      courseId: course.id,
      quizPassword: "prisma_orm",
      taskInstruction: `## 🎯 Tugas Praktik: Desain Schema dan CRUD dengan Prisma

Buatlah schema Prisma untuk sistem perpustakaan sederhana dan implementasikan CRUD lengkap.

### Spesifikasi Wajib:
1. **Schema**: Buat model \`Book\` (judul, isbn, tahun, tersedia), \`Author\` (nama, bio), dan \`Category\` (nama)
2. **Relasi**: Book punya 1 Author (one-to-many), Book punya banyak Category (many-to-many)
3. **Seed data**: Buat script untuk mengisi minimal 3 author, 5 buku, 3 kategori
4. **CRUD endpoint**: GET, POST, PUT, DELETE untuk Book dengan include relasi
5. **Filter**: GET /api/books?author=nama&category=nama

### Kriteria Penilaian (100):
- **Schema Design (30)**: Relasi one-to-many dan many-to-many benar
- **CRUD Implementation (30)**: Semua operasi CRUD berfungsi dengan Prisma Client
- **Seed Script (20)**: Data dummy relevan dan relasi terbentuk dengan benar
- **Error Handling (20)**: Try-catch, validasi input, cek data sebelum update/delete`,
      konten: `## 🗄️ Database Relasional dengan Prisma v7: Menyimpan Data Secara Terstruktur

---

### 1. Analogi Dunya Nyata: Filing Cabinet dan Database

Bayangkan kamu punya **filing cabinet** (lemari arsip) di kantor. Di dalamnya ada banyak **laci** (tabel), dan setiap laci berisi **kertas-kertas** (baris/record) dengan informasi yang terstruktur.

**Database relasional** bekerja persis seperti filing cabinet:

| Filing Cabinet | Database |
|---|---|
| Lemari arsip | Database |
| Laci | Tabel (table) |
| Kategori di kertas | Kolom (column) |
| Satu lembar kertas | Baris (row/record) |
| Nomor referensi ke kertas lain | Foreign key (relasi) |

Mengapa disebut "relasional"? Karena kertas-kertas di laci yang berbeda bisa **saling terhubung**. Misalnya:
- Laci "Buku" punya kolom "ID Penulis" yang merujuk ke laci "Penulis"
- Satu penulis bisa punya banyak buku (one-to-many)
- Satu buku bisa masuk banyak kategori (many-to-many)

---

### 2. The "Why": Mengapa Kita Butuh ORM?

#### Masalah Tanpa ORM

Tanpa ORM, kamu harus menulis **SQL manual**:

\`\`\`javascript
// Mengambil semua buku beserta nama penulis
const result = await db.query(\`
  SELECT books.title, authors.name
  FROM books
  JOIN authors ON books.author_id = authors.id
  WHERE books.year > 2020
  ORDER BY books.title ASC
\`);
\`\`\`

Masalahnya:
- **Raw SQL rentan typo**: Salah satu hurup di nama tabel = error
- **Tidak type-safe**: JavaScript tidak tahu kolom apa yang ada di tabel
- **Migrasi manual**: Mengubah schema harus tulis SQL ALTER TABLE manual
- **Beda syntax**: MySQL, PostgreSQL, SQLite punya syntax SQL yang sedikit berbeda

#### Solusi: Prisma ORM

Dengan Prisma, kamu menulis kode JavaScript/TypeScript biasa:

\`\`\`typescript
// Mengambil semua buku beserta nama penulis
const books = await prisma.book.findMany({
  where: { year: { gt: 2020 } },
  include: { author: true },
  orderBy: { title: "asc" },
});
\`\`\`

Keuntungan:
- **Type-safe**: TypeScript tahu persis kolom apa yang tersedia
- **Auto-complete**: IDE bisa memberi saran field yang tersedia
- **Migrasi otomatis**: Ubah schema → Prisma generate SQL migration
- **Database-agnostic**: Ganti database tanpa ubah kode

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Setup Prisma

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

Ini akan membuat folder \`prisma/\` dengan file \`schema.prisma\`.

#### Langkah 2: Mendefinisikan Schema

\`\`\`prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Model Author — satu author bisa punya banyak buku
model Author {
  id    String @id @default(cuid())
  nama  String
  bio   String?
  books Book[] // Relasi one-to-many: author punya banyak buku
}

// Model Category — satu kategori bisa dipakai banyak buku
model Category {
  id    String @id @default(cuid())
  nama  String @unique
  books BookCategory[] // Relasi many-to-many
}

// Model Book — satu buku punya 1 author, bisa banyak kategori
model Book {
  id         String @id @default(cuid())
  judul      String
  isbn       String @unique
  tahun      Int
  tersedia   Boolean @default(true)
  author     Author @relation(fields: [authorId], references: [id])
  authorId   String
  categories BookCategory[] // Relasi many-to-many
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Tabel penghubung untuk many-to-many
model BookCategory {
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([bookId, categoryId])
}
\`\`\`

#### Langkah 3: Menjalankan Migrasi

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

#### Langkah 4: CRUD dengan Prisma Client

\`\`\`typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE — Tambah buku baru dengan relasi
async function createBook() {
  const book = await prisma.book.create({
    data: {
      judul: "Belajar Prisma ORM",
      isbn: "978-602-123-456-7",
      tahun: 2024,
      author: {
        connect: { id: "author-id-1" }, // Hubungkan ke author yang ada
      },
      categories: {
        create: [
          { category: { connectOrCreate: { where: { nama: "Programming" }, create: { nama: "Programming" } } } },
        ],
      },
    },
    include: { author: true, categories: { include: { category: true } } },
  });

  console.log(book);
}

// READ — Ambil semua buku dengan filter
async function getBooks() {
  const books = await prisma.book.findMany({
    where: {
      tahun: { gte: 2020 },        // Tahun >= 2020
      tersedia: true,               // Masih tersedia
    },
    include: {
      author: true,                 // Sertakan data author
      categories: { include: { category: true } },
    },
    orderBy: { judul: "asc" },     // Urutkan A-Z
    take: 10,                       // Maksimal 10 hasil
  });

  return books;
}

// UPDATE — Update data buku
async function updateBook(id: string) {
  const book = await prisma.book.update({
    where: { id },
    data: { tersedia: false },
  });

  return book;
}

// DELETE — Hapus buku
async function deleteBook(id: string) {
  await prisma.book.delete({
    where: { id },
  });
}
\`\`\`

#### Langkah 5: Seed Data

\`\`\`typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Buat authors
  const author1 = await prisma.author.create({
    data: { nama: "Budi Santoso", bio: "Full-stack developer sejak 2015" },
  });
  const author2 = await prisma.author.create({
    data: { nama: "Ani Wijaya", bio: "Backend specialist dan DevOps engineer" },
  });

  // Buat categories
  const catProg = await prisma.category.create({ data: { nama: "Programming" } });
  const catDb = await prisma.category.create({ data: { nama: "Database" } });
  const catWeb = await prisma.category.create({ data: { nama: "Web Development" } });

  // Buat books dengan relasi
  await prisma.book.create({
    data: {
      judul: "Belajar Node.js dari Nol",
      isbn: "978-602-001-001-0",
      tahun: 2024,
      authorId: author1.id,
      categories: {
        create: [
          { categoryId: catProg.id },
          { categoryId: catWeb.id },
        ],
      },
    },
  });

  console.log("Seed selesai!");
}

main().finally(() => prisma.$disconnect());
\`\`\`

Jalankan seed:

\`\`\`bash
npx tsx prisma/seed.ts
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Lupa \`npx prisma generate\` Setelah Ubah Schema

**Gejala:** TypeScript error karena tipe data tidak sesuai dengan schema terbaru.

**Solusi:** Selalu jalankan \`npx prisma generate\` setelah mengubah \`schema.prisma\`.

\`\`\`bash
# Setelah edit schema.prisma
npx prisma generate    # Generate Prisma Client baru
npx prisma migrate dev # Buat migrasi database
\`\`\`

---

#### ❌ Error #2: Foreign Key Constraint Violation

**Gejala:** \`Foreign key constraint failed\` saat create/update data.

**Penyebab:** Mencoba menghubungkan ke record yang tidak ada.

\`\`\`typescript
// ❌ SALAH — authorId tidak ada di database
await prisma.book.create({
  data: { judul: "Test", authorId: "id-yang-tidak-ada" },
});

// ✅ BENAR — cek dulu apakah author ada
const author = await prisma.author.findUnique({ where: { id: authorId } });
if (!author) {
  throw new Error("Author tidak ditemukan");
}

await prisma.book.create({
  data: { judul: "Test", authorId: author.id },
});
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| ORM | Tool yang menghubungkan kode bahasa pemrograman dengan database |
| Schema | Blueprint/desain struktur tabel di database |
| Relasi | Koneksi antar tabel (one-to-one, one-to-many, many-to-many) |
| Foreign Key | Kolom yang merujuk ke primary key tabel lain |
| Migrasi | Perubahan terstruktur pada schema database |
| Seed | Mengisi database dengan data awal/dummy |

> **PASSWORD_KUIS: \`prisma_orm\`**
> Temukan password ini dan buktikan kamu memahami database relasional dengan Prisma!`,
    },
  });

  // ============================================================
  // MODUL 3: Autentikasi JWT & Middleware Keamanan
  // ============================================================
  await prisma.module.create({
    data: {
      judul: "Autentikasi JWT & Middleware Keamanan",
      urutan: 3,
      courseId: course.id,
      quizPassword: "jwt_secure",
      taskInstruction: `## 🎯 Tugas Praktik: Proteksi Endpoint dengan JWT

Buatlah sistem autentikasi JWT lengkap yang mengamankan endpoint API.

### Spesifikasi Wajib:
1. **POST /api/auth/register** — Daftar user baru (hash password dengan bcrypt)
2. **POST /api/auth/login** — Login dan dapatkan JWT token
3. **GET /api/auth/profile** — Ambil profile user (TERPROTEKSI, butuh token)
4. **Middleware authMiddleware** — Verifikasi token di setiap request terproteksi
5. **Middleware requireRole** — Filter berdasarkan role (admin, user)

### Kriteria Penilaian (100):
- **Register (20)**: Password di-hash dengan bcrypt (salt 10), validasi input lengkap
- **Login (20)**: Verifikasi password, generate JWT dengan expiry 7 hari
- **Auth Middleware (25)**: Verifikasi token, tolak request tanpa token/token expired
- **Role Middleware (15)**: Hanya role tertentu yang bisa akses endpoint tertentu
- **Error Handling (20)**: Pesan error spesifik (401 vs 403), tidak membocorkan info sensitif

### Bonus:
- Tambahkan refresh token mechanism
- Implementasi rate limiting (maksimal 5 request per menit per IP)`,
      konten: `## 🔐 Autentikasi JWT & Middleware Keamanan: Mengamankan API

---

### 1. Analogi Dunia Nyata: Kartu Hotel dan JWT

Bayangkan kamu check-in di **hotel**. Resepsionis memverifikasi identitasmu (KTP), lalu memberimu **kartu kamar**. Kartu itu berisi:
- Nomor kamarmu (user ID)
- Tanggal check-in/check-out (waktu berlaku)
- Akses lantai tertentu (role/izin)

Kamu tidak perlu menunjukkan KTP setiap kali masuk kamar. Cukup tempel kartu di pintu. Sistem hotel akan memverifikasi kartu tersebut.

**JWT (JSON Web Token)** bekerja persis seperti kartu hotel:
- Kamu login dengan email + password (menunjukkan KTP)
- Server memverifikasi dan memberi JWT (kartu kamar)
- Kamu menyimpan JWT dan mengirimnya di setiap request (tempel kartu)
- Server memverifikasi JWT tanpa perlu cek database lagi (pintu otomatis terbuka)

---

### 2. The "Why": Mengapa Kita Butuh Autentikasi?

#### Masalah Tanpa Autentikasi

\`\`\`
GET /api/users       → Siapa pun bisa lihat data user
DELETE /api/users/5  → Siapa pun bisa hapus user
PUT /api/users/3     → Siapa pun bisa edit data orang lain
\`\`\`

Tanpa autentikasi, API kamu seperti **rumah tanpa pintu** — siapa pun bisa masuk dan melakukan apa saja.

#### Solusi: JWT sebagai "Tiket Masuk"

\`\`\`
POST /api/login (email + password)
       ↓
Server verifikasi → Generate JWT → Kirim ke client
       ↓
Client simpan JWT → Kirim di setiap request (header Authorization)
       ↓
Server verifikasi JWT → Izinkan atau tolak akses
\`\`\`

---

### 3. Panduan Koding Step-by-Step

#### Langkah 1: Install Dependencies

\`\`\`bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
\`\`\`

#### Langkah 2: Tambah Model User di Schema

\`\`\`prisma
// prisma/schema.prisma — tambahkan model User
enum UserRole {
  ADMIN
  USER
}

model User {
  id        String   @id @default(cuid())
  nama      String
  email     String   @unique
  password  String   // Akan di-hash dengan bcrypt
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

\`\`\`bash
npx prisma migrate dev --name add-user
npx prisma generate
\`\`\`

#### Langkah 3: Membuat Fungsi Auth

\`\`\`typescript
// src/lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-ganti-di-production";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Hash password sebelum disimpan ke database
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10); // 10 = salt rounds
}

// Verifikasi password saat login
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token berlaku 7 hari
  });
}

// Verifikasi dan decode JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
\`\`\`

#### Langkah 4: Membuat Auth Controller

\`\`\`typescript
// src/controllers/auth.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "../lib/auth";

const prisma = new PrismaClient();

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { nama, email, password } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({
        error: "Nama, email, dan password wajib diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password minimal 6 karakter",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Simpan user baru
    const user = await prisma.user.create({
      data: { nama, email, password: hashedPassword },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Gagal melakukan registrasi" });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email dan password wajib diisi",
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Email atau password salah", // Jangan bilang "email tidak ditemukan"
      });
    }

    // Verifikasi password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: "Email atau password salah",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login berhasil",
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Gagal melakukan login" });
  }
}
\`\`\`

#### Langkah 5: Membuat Middleware

\`\`\`typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/auth";

// Extend Express Request untuk menyimpan data user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware: Verifikasi JWT token
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Ambil token dari header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  const token = authHeader.split(" ")[1]; // "Bearer xxx" → "xxx"

  // Verifikasi token
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      error: "Token tidak valid atau sudah expired. Silakan login ulang.",
    });
    return;
  }

  // Simpan data user di request agar bisa diakses di handler
  req.user = payload;
  next();
}

// Middleware: Cek role (hanya role tertentu yang boleh akses)
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Autentikasi diperlukan" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Anda tidak memiliki izin untuk mengakses resource ini",
      });
    }

    next();
  };
}
\`\`\`

#### Langkah 6: Membuat Auth Routes

\`\`\`typescript
// src/routes/auth.ts
import { Router } from "express";
import { register, login } from "../controllers/auth";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Route terproteksi
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Ini data profile Anda",
    user: req.user, // Data dari middleware
  });
});

// Hanya admin yang bisa akses
router.get("/admin/users", authMiddleware, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Data semua user (admin only)" });
});

export default router;
\`\`\`

#### Langkah 7: Testing dengan curl

\`\`\`bash
# Register
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"nama": "Budi", "email": "budi@test.com", "password": "rahasia123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "budi@test.com", "password": "rahasia123"}'

# Akses profile (dengan token)
curl http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Tanpa token → 401
curl http://localhost:3000/api/auth/profile
\`\`\`

---

### 4. Perangkap Error Pemula

#### ❌ Error #1: Menyimpan Password Tanpa Hash

**Gejala:** Jika database bocor, semua password user bisa dibaca langsung.

\`\`\`typescript
// ❌ SALAH — simpan password polos
await prisma.user.create({
  data: { email, password: "rahasia123" },
});

// ✅ BENAR — hash dulu sebelum simpan
const hashed = await bcrypt.hash("rahasia123", 10);
await prisma.user.create({
  data: { email, password: hashed },
});
\`\`\`

---

#### ❌ Error #2: Membocorkan Informasi di Error Message

\`\`\`typescript
// ❌ SALAH — memberitahu attacker bahwa email tidak terdaftar
if (!user) {
  return res.status(401).json({ error: "Email tidak terdaftar" });
}

// ✅ BENAR — pesan samar agar attacker tidak bisa enumerate email
if (!user) {
  return res.status(401).json({ error: "Email atau password salah" });
}
\`\`\`

---

### 5. Ringkasan Modul

| Konsep | Penjelasan |
|---|---|
| JWT | Token ter-encode yang berisi data user dan waktu berlaku |
| Bcrypt | Library untuk hash password secara aman (one-way) |
| Auth Middleware | Middleware yang memverifikasi token sebelum lanjut ke handler |
| Role-based Access | Membatasi akses berdasarkan role user (admin, user) |
| 401 vs 403 | 401 = tidak terautentikasi, 403 = terautentikasi tapi tidak punya izin |
| Bearer Token | Format header: \`Authorization: Bearer <token>\` |

> **PASSWORD_KUIS: \`jwt_secure\`**
> Temukan password ini dan buktikan kamu bisa mengamankan API dengan JWT!`,
    },
  });

  console.log("✅ Kelas Backend API berhasil ditambahkan!");
  console.log("📚 3 modul: Express.js, Prisma v7, JWT Auth");
  console.log("🔑 Quiz: express_api, prisma_orm, jwt_secure");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
