"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddModuleModal({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [quizPassword, setQuizPassword] = useState("");
  const [taskInstruction, setTaskInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/modules/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, judul, konten, quizPassword, taskInstruction: taskInstruction || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setJudul("");
      setKonten("");
      setQuizPassword("");
      setTaskInstruction("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal menambah modul. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition"
      >
        + Tambah Modul Baru
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Tambah Modul Baru
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Modul
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pengenalan React Component"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Isi Materi (Markdown)
                </label>
                <textarea
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  placeholder={"Tulis materi dalam format Markdown...\n\nContoh:\n## Judul Bab\n\nPenjelasan materi di sini.\n\n```javascript\nconsole.log('Hello World');\n```\n\n> PASSWORD_KUIS: rahasia123"}
                  required
                  rows={12}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm font-mono resize-y"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gunakan Markdown untuk format. Sisipkan tag PASSWORD_KUIS di akhir materi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Kuis
                </label>
                <input
                  type="text"
                  value={quizPassword}
                  onChange={(e) => setQuizPassword(e.target.value)}
                  placeholder="Contoh: react_component_2024"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Password ini harus sama dengan yang tertulis di materi (PASSWORD_KUIS).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Instruksi Tugas (Opsional)
                </label>
                <textarea
                  value={taskInstruction}
                  onChange={(e) => setTaskInstruction(e.target.value)}
                  placeholder={"Tulis instruksi tugas untuk peserta...\n\nContoh:\nBuatlah aplikasi To-Do List menggunakan React.\nKumpulkan link GitHub dan deployment Vercel."}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm resize-y"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Jika diisi, peserta bisa mengumpulkan tugas di modul ini.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm transition"
                >
                  {loading ? "Menyimpan..." : "Tambah Modul"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
