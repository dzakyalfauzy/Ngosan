"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: string;
  judul: string;
  deskripsi: string;
  thumbnail: string | null;
  pengajar: { id: string; nama: string };
  _count: { modules: number };
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((res) => res.json()),
      fetch("/api/courses/enrolled").then((res) => res.json()),
    ])
      .then(([courseData, enrollData]) => {
        setCourses(courseData.courses || []);
        setEnrolled(new Set(enrollData.enrolled || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId);
    setMessage(null);

    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setEnrolled((prev) => new Set(prev).add(courseId));
      setMessage({ type: "success", text: data.message });
    } catch {
      setMessage({ type: "error", text: "Gagal mendaftar. Coba lagi." });
    } finally {
      setEnrolling(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <p className="text-lg">Belum ada kelas tersedia.</p>
        <p className="text-sm mt-1">Kelas akan muncul di sini setelah pengajar mempublikasikannya.</p>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const isEnrolled = enrolled.has(course.id);
          const isLoading = enrolling === course.id;

          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.judul}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {course.judul}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {course.deskripsi}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>👤 {course.pengajar.nama}</span>
                    <span>📚 {course._count.modules} Modul</span>
                  </div>
                  {isEnrolled ? (
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      Mulai Belajar →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={isLoading}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition"
                    >
                      {isLoading ? "..." : "Daftar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
