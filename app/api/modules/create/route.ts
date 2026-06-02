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
      return NextResponse.json({ error: "Hanya pengajar yang bisa menambah modul." }, { status: 403 });
    }

    const { courseId, judul, konten, quizPassword, taskInstruction } = await request.json();

    if (!courseId || !judul || !konten || !quizPassword) {
      return NextResponse.json(
        { error: "courseId, judul, konten, dan quizPassword wajib diisi." },
        { status: 400 }
      );
    }

    // Cek apakah kelas milik pengajar ini
    const course = await prisma.course.findFirst({
      where: { id: courseId, pengajarId: payload.userId as string },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    // Hitung urutan otomatis
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { urutan: "desc" },
      select: { urutan: true },
    });

    const nextUrutan = (lastModule?.urutan ?? 0) + 1;

    const modul = await prisma.module.create({
      data: {
        judul,
        konten,
        quizPassword,
        taskInstruction: taskInstruction || null,
        urutan: nextUrutan,
        courseId,
      },
    });

    return NextResponse.json(
      { message: "Modul berhasil ditambahkan!", module: modul },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
