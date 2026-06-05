"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Modul {
  id: string;
  judul: string;
  urutan: number;
  konten: string;
  taskInstruction: string | null;
}

interface Submission {
  id: string;
  submissionUrl: string;
  notes: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
}

interface Props {
  courseId: string;
  courseTitle: string;
  pengajarNama: string;
  modules: Modul[];
}

export default function LearningView({ courseId, courseTitle, pengajarNama, modules }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizStatus, setQuizStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [quizMessage, setQuizMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // Task submission state
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [taskUrl, setTaskUrl] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskStatus, setTaskStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [taskMessage, setTaskMessage] = useState("");

  const activeModule = modules[activeIndex];
  const isCurrentCompleted = completedModules.has(activeModule?.id);

  // Baca query param ?module=xxx untuk langsung buka modul tertentu
  const searchParams = useSearchParams();
  useEffect(() => {
    const moduleId = searchParams.get("module");
    if (moduleId) {
      const index = modules.findIndex((m) => m.id === moduleId);
      if (index !== -1) {
        setActiveIndex(index);
        setTimeout(() => {
          document.getElementById("task-section")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [searchParams, modules]);

  // Fetch progress saat mount
  useEffect(() => {
    fetch(`/api/courses/progress?courseId=${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        setCompletedModules(new Set(data.completedModuleIds || []));
        const total = modules.length;
        const done = (data.completedModuleIds || []).length;
        setProgress(total > 0 ? Math.round((done / total) * 100) : 0);
      })
      .catch(() => {});
  }, [courseId, modules.length]);

  // Fetch submission saat ganti modul
  useEffect(() => {
    setQuizAnswer("");
    setQuizStatus("idle");
    setQuizMessage("");
    setSubmission(null);
    setTaskUrl("");
    setTaskNotes("");
    setTaskStatus("idle");
    setTaskMessage("");

    if (activeModule?.taskInstruction) {
      fetch(`/api/tasks/submit?moduleId=${activeModule.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.submission) {
            setSubmission(data.submission);
            setTaskUrl(data.submission.submissionUrl);
            setTaskNotes(data.submission.notes || "");
          }
        })
        .catch(() => {});
    }
  }, [activeIndex, activeModule?.id, activeModule?.taskInstruction]);

  async function handleQuizSubmit() {
    setQuizStatus("loading");
    setQuizMessage("");
    try {
      const res = await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: activeModule.id, courseId, quizAnswer }),
      });
      const data = await res.json();
      if (!res.ok) { setQuizStatus("error"); setQuizMessage(data.error); return; }
      setQuizStatus("success");
      setQuizMessage(data.message);
      setCompletedModules((prev) => new Set(prev).add(activeModule.id));
      setProgress(data.progress);
    } catch { setQuizStatus("error"); setQuizMessage("Terjadi kesalahan."); }
  }

  async function handleTaskSubmit() {
    setTaskStatus("loading");
    setTaskMessage("");
    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: activeModule.id, submissionUrl: taskUrl, notes: taskNotes }),
      });
      const data = await res.json();
      if (!res.ok) { setTaskStatus("error"); setTaskMessage(data.error); return; }
      setTaskStatus("success");
      setTaskMessage(data.message);
      setSubmission(data.submission);
    } catch { setTaskStatus("error"); setTaskMessage("Gagal mengirim tugas."); }
  }

  return (
    <div className="max-w-7xl mx-auto flex relative">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center">
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky top-0 md:top-[57px] w-72 h-screen md:h-[calc(100vh-57px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform z-10`}>
        <div className="p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Daftar Modul</h2>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{courseTitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">👤 {pengajarNama}</p>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1"><span>Progress</span><span>{progress}%</span></div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
          <nav className="space-y-1">
            {modules.map((modul, index) => {
              const isDone = completedModules.has(modul.id);
              return (
                <button key={modul.id} onClick={() => { setActiveIndex(index); setSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2 ${index === activeIndex ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                  <span className="flex-shrink-0">{isDone ? "✅" : `${modul.urutan}.`}</span>
                  <span className="truncate">{modul.judul}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-57px)] p-6 sm:p-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Modul {activeModule.urutan} dari {modules.length}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">{activeModule.judul}</h1>

          <article className="max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
                    {children}
                  </p>
                ),
                pre: ({ children }) => (
                  <div className="my-5 rounded-xl overflow-hidden border border-slate-700 dark:border-slate-600">
                    <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-slate-400 ml-2 font-mono">code</span>
                    </div>
                    <pre className="bg-slate-950 p-5 overflow-x-auto text-sm leading-relaxed">
                      {children}
                    </pre>
                  </div>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={`${className} text-sm font-mono text-emerald-300`}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-6 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-6 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 pl-4 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 rounded-r-lg py-3 pr-4 text-slate-700 dark:text-slate-300">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900 dark:text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-slate-600 dark:text-slate-400">
                    {children}
                  </em>
                ),
                hr: () => (
                  <hr className="my-8 border-t border-slate-200 dark:border-slate-700" />
                ),
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {children}
                  </td>
                ),
              }}
            >
              {activeModule.konten}
            </ReactMarkdown>
          </article>

          {/* Task Submission Card */}
          {activeModule.taskInstruction && (
            <div id="task-section" className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">📋 Tugas Praktik</h3>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{activeModule.taskInstruction}</p>
              </div>

              {submission?.status === "GRADED" ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">✅ Sudah Dinilai</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{submission.grade}/100</p>
                  </div>
                  {submission.feedback && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Feedback Pengajar:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{submission.feedback}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">Link: <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{submission.submissionUrl}</a></p>
                </div>
              ) : submission?.status === "PENDING" ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">⏳ Tugas sudah dikirim. Menunggu penilaian dari pengajar.</p>
                  <p className="text-xs text-slate-400 mt-1">Link: <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{submission.submissionUrl}</a></p>
                </div>
              ) : (
                <>
                  {taskMessage && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${taskStatus === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}>
                      {taskMessage}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Project / GitHub</label>
                      <input type="url" value={taskUrl} onChange={(e) => setTaskUrl(e.target.value)} placeholder="https://github.com/username/project" required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                      <textarea value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} placeholder="Jelaskan apa yang sudah kamu kerjakan..." rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm resize-none" />
                    </div>
                    <button onClick={handleTaskSubmit} disabled={!taskUrl.trim() || taskStatus === "loading"}
                      className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm transition">
                      {taskStatus === "loading" ? "Mengirim..." : "Kirim Tugas"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quiz Card */}
          <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">🧪 Kuis & Tes Kemampuan Modul</h3>
            {isCurrentCompleted ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                <span className="text-lg">✅</span><span>Modul ini sudah selesai!</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Temukan <strong>PASSWORD_KUIS</strong> di dalam materi, lalu masukkan di bawah.</p>
                {quizMessage && <div className={`mb-4 p-3 rounded-lg text-sm ${quizStatus === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}>{quizMessage}</div>}
                <div className="flex gap-2">
                  <input type="text" value={quizAnswer} onChange={(e) => setQuizAnswer(e.target.value)} placeholder="Masukkan password kuis..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm" />
                  <button onClick={handleQuizSubmit} disabled={!quizAnswer.trim() || quizStatus === "loading"}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm transition">
                    {quizStatus === "loading" ? "..." : "Validasi"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => { setActiveIndex(Math.max(0, activeIndex - 1)); window.scrollTo(0, 0); }} disabled={activeIndex === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">← Modul Sebelumnya</button>
            <span className="text-xs text-slate-400 dark:text-slate-500">{completedModules.size} / {modules.length} selesai</span>
            {activeIndex < modules.length - 1 && (
              <button onClick={() => { setActiveIndex(activeIndex + 1); window.scrollTo(0, 0); }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition">Modul Selanjutnya →</button>
            )}
            {activeIndex === modules.length - 1 && progress >= 100 && (
              <span className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">🎉 Kelas Selesai!</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
