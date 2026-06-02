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
      return NextResponse.json({ error: "Hanya pengajar yang bisa mengubah status kelas." }, { status: 403 });
    }

    const { courseId } = await request.json();
    if (!courseId) return NextResponse.json({ error: "courseId wajib diisi." }, { status: 400 });

    const course = await prisma.course.findFirst({
      where: { id: courseId, pengajarId: payload.userId as string },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: !course.isPublished },
    });

    return NextResponse.json({
      message: updated.isPublished ? "Kelas berhasil di-publish!" : "Kelas dikembalikan ke Draft.",
      isPublished: updated.isPublished,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
