"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCourseButton({ courseId, courseName }: { courseId: string; courseName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kelas "${courseName}"?\n\nSemua modul, tugas, dan data peserta di kelas ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus kelas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
    >
      {loading ? "..." : "🗑️ Hapus"}
    </button>
  );
}
