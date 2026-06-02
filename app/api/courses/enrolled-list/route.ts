import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ courses: [] });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ courses: [] });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.userId as string },
      include: {
        course: {
          select: {
            id: true,
            judul: true,
            deskripsi: true,
            pengajar: { select: { nama: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const courses = enrollments.map((e) => ({
      id: e.course.id,
      judul: e.course.judul,
      deskripsi: e.course.deskripsi,
      progress: e.progress,
      pengajar: e.course.pengajar,
      _count: e.course._count,
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Get enrolled list error:", error);
    return NextResponse.json({ courses: [] });
  }
}
