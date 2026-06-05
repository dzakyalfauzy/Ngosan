"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  moduleId: string;
  currentJudul: string;
  currentKonten: string;
  currentQuizPassword: string;
  currentTaskInstruction: string | null;
}

export default function EditModuleModal({
  moduleId, currentJudul, currentKonten, currentQuizPassword, currentTaskInstruction,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState(currentJudul);
  const [konten, setKonten] = useState(currentKonten);
  const [quizPassword, setQuizPassword] = useState(currentQuizPassword);
  const [taskInstruction, setTaskInstruction] = useState(currentTaskInstruction || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, konten, quizPassword, taskInstruction: taskInstruction || null }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal mengupdate modul.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
        title="Edit modul"
      >
        ✏️
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Modul</h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Judul Modul</label>
                <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Isi Materi (Markdown)</label>
                <textarea value={konten} onChange={(e) => setKonten(e.target.value)} required rows={14}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm font-mono resize-y" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password Kuis</label>
                <input type="text" value={quizPassword} onChange={(e) => setQuizPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Instruksi Tugas (Opsional)</label>
                <textarea value={taskInstruction} onChange={(e) => setTaskInstruction(e.target.value)} rows={4} placeholder="Kosongkan jika tidak ada tugas..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm resize-y" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition">Batal</button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm transition">{loading ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
