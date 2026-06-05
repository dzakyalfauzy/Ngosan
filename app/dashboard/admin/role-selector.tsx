"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userName: string;
  currentRole: string;
  isCurrentUser: boolean;
}

export default function RoleSelector({ userId, userName, currentRole, isCurrentUser }: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(newRole: string) {
    if (newRole === currentRole) return;
    if (isCurrentUser) {
      setError("Tidak bisa mengubah role sendiri");
      return;
    }

    const confirmed = window.confirm(
      `Ubah role ${userName} dari ${currentRole} menjadi ${newRole}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setRole(currentRole);
        return;
      }

      setRole(newRole);
      router.refresh();
    } catch {
      setError("Gagal mengubah role");
      setRole(currentRole);
    } finally {
      setLoading(false);
    }
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    PENGAJAR: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    PESERTA: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  };

  return (
    <div>
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading || isCurrentUser}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${roleColors[role] || ""}`}
      >
        <option value="PESERTA">PESERTA</option>
        <option value="PENGAJAR">PENGAJAR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
