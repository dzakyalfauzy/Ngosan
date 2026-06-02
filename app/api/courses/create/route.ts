import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    if (payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Hanya pengajar yang bisa membuat kelas." }, { status: 403 });
    }

    const { judul, deskripsi } = await request.json();

    if (!judul || !deskripsi) {
      return NextResponse.json({ error: "Judul dan deskripsi wajib diisi." }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        judul,
        deskripsi,
        pengajarId: payload.userId as string,
        isPublished: false,
      },
    });

    return NextResponse.json(
      { message: "Kelas berhasil dibuat!", course },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
