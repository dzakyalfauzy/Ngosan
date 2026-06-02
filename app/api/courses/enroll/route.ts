import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const payload = await decrypt(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { error: "Session tidak valid." },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId wajib diisi." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan atau belum dipublikasikan." },
        { status: 404 }
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payload.userId as string,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar di kelas ini." },
        { status: 409 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: payload.userId as string,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });

    return NextResponse.json(
      { message: "Berhasil mendaftar kelas!", enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
