"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Task {
  moduleId: string;
  moduleJudul: string;
  urutan: number;
  taskInstruction: string;
  courseId: string;
  courseJudul: string;
  submission: {
    id: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    submissionUrl: string;
  } | null;
}

export default function TugasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks/list")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = tasks.filter((t) => !t.submission);
  const submitted = tasks.filter((t) => t.submission?.status === "PENDING");
  const graded = tasks.filter((t) => t.submission?.status === "GRADED");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Ngosan</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tugas & Kuis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {pending.length} belum dikerjakan · {submitted.length} menunggu penilaian · {graded.length} sudah dinilai
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">Belum ada tugas</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar kelas terlebih dahulu untuk melihat tugas.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Belum Dikerjakan */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📝 Belum Dikerjakan ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map((task) => (
                    <Link
                      key={task.moduleId}
                      href={`/dashboard/courses/${task.courseId}?module=${task.moduleId}`}
                      className="block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{task.courseJudul}</p>
                          <h3 className="font-semibold text-slate-900 dark:text-white mt-1">Modul {task.urutan}: {task.moduleJudul}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.taskInstruction}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex-shrink-0 ml-4">
                          Kerjakan →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Menunggu Penilaian */}
            {submitted.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">⏳ Menunggu Penilaian ({submitted.length})</h2>
                <div className="space-y-3">
                  {submitted.map((task) => (
                    <div key={task.moduleId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{task.courseJudul}</p>
                      <h3 className="font-semibold text-slate-900 dark:text-white mt-1">Modul {task.urutan}: {task.moduleJudul}</h3>
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">⏳ Tugas sudah dikirim. Menunggu penilaian pengajar.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sudah Dinilai */}
            {graded.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">✅ Sudah Dinilai ({graded.length})</h2>
                <div className="space-y-3">
                  {graded.map((task) => (
                    <div key={task.moduleId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{task.courseJudul}</p>
                      <h3 className="font-semibold text-slate-900 dark:text-white mt-1">Modul {task.urutan}: {task.moduleJudul}</h3>
                      <div className="mt-3 flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center min-w-[80px]">
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{task.submission?.grade}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">/100</p>
                        </div>
                        {task.submission?.feedback && (
                          <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Feedback:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{task.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
