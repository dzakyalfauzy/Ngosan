"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EnrolledCourse {
  id: string;
  judul: string;
  deskripsi: string;
  progress: number;
  pengajar: { nama: string };
  _count: { modules: number };
}

export default function EnrolledCourses() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses/enrolled-list")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/dashboard/courses/${course.id}`}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition block"
        >
          <h4 className="font-semibold text-slate-900 dark:text-white">{course.judul}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">👤 {course.pengajar.nama}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{course._count.modules} modul</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Lanjutkan Belajar →
          </p>
        </Link>
      ))}
    </div>
  );
}
