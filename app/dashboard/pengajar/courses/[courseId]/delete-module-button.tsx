"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteModuleButton({ moduleId, moduleName }: { moduleId: string; moduleName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus modul "${moduleName}"?\n\nData tugas dan progress peserta di modul ini akan ikut terhapus.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus modul.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50"
      title="Hapus modul"
    >
      {loading ? "..." : "🗑️"}
    </button>
  );
}
