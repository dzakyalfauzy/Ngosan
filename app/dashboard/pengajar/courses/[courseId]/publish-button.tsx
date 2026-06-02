"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishButton({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/courses/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
        isPublished
          ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {loading
        ? "Menyimpan..."
        : isPublished
          ? "Kembalikan ke Draft"
          : "🚀 Publish Kelas"}
    </button>
  );
}
