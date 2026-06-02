import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ enrolled: [] });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ enrolled: [] });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.userId as string },
      select: { courseId: true },
    });

    return NextResponse.json({
      enrolled: enrollments.map((e) => e.courseId),
    });
  } catch (error) {
    console.error("Get enrolled error:", error);
    return NextResponse.json({ enrolled: [] });
  }
}
