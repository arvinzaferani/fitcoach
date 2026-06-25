"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCoachAthletes, inviteAthlete, type CoachAthleteItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Mail, Plus, Search, UserPlus, Users, X } from "lucide-react";

export default function CoachAthletesPage() {
  const [query, setQuery] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<CoachAthleteItem[]>([]);
  const [inviteContact, setInviteContact] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    getCoachAthletes().then(setAthletes).catch(() => setAthletes([]));
  }, []);

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return athletes;
    return athletes.filter(
      (a) =>
        a.fullName.toLowerCase().includes(normalizedQuery) ||
        a.email.toLowerCase().includes(normalizedQuery),
    );
  }, [query, athletes]);

  const selectedAthlete =
    filteredAthletes.find((a) => a.id === selectedAthleteId) ??
    athletes.find((a) => a.id === selectedAthleteId) ??
    null;

  async function handleInviteAthlete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteStatus("");
    try {
      await inviteAthlete({ athleteContact: inviteContact.trim(), message: inviteMessage.trim() || undefined });
      setInviteStatus("دعوت ارسال شد.");
      setInviteContact("");
      setInviteMessage("");
      setTimeout(() => setInviteStatus(""), 3000);
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "ارسال دعوت ناموفق بود.");
    }
  }

  return (
    <AppShell title="شاگردان" subtitle="مدیریت و دعوت شاگردان">
      {/* Search + Invite */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی شاگرد..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pr-10 pl-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(!showInvite)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white shadow-card transition-all active:scale-[0.98]",
            showInvite ? "bg-danger" : "bg-primary",
          )}
        >
          {showInvite ? <X size={18} /> : <UserPlus size={18} />}
          {showInvite ? "بستن" : "دعوت"}
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <form
          onSubmit={handleInviteAthlete}
          className="mb-5 animate-slide-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card"
        >
          <h3 className="mb-3 text-lg font-black">دعوت ورزشکار جدید</h3>
          <div className="space-y-3">
            <input
              value={inviteContact}
              onChange={(event) => setInviteContact(event.target.value)}
              required
              placeholder="ایمیل یا شماره ورزشکار"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={inviteMessage}
              onChange={(event) => setInviteMessage(event.target.value)}
              placeholder="پیام (اختیاری)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-black text-white shadow-card transition-all active:scale-[0.98]"
            >
              <Mail size={16} />
              ارسال دعوت
            </button>
          </div>
          {inviteStatus ? (
            <p
              className={cn(
                "mt-3 text-center text-sm",
                inviteStatus.includes("شد") ? "text-secondary" : "text-danger",
              )}
            >
              {inviteStatus}
            </p>
          ) : null}
        </form>
      )}

      {/* Athlete List */}
      {filteredAthletes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-16">
          <Users size={40} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {query ? "نتیجه‌ای یافت نشد" : "هنوز شاگردی ندارید"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">
                {athlete.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{athlete.fullName}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{athlete.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                    {athlete.activeProgram || "بدون برنامه"}
                  </span>
                </div>
              </div>
              <Link
                href={`/coach/athletes/${athlete.id}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <ArrowLeft size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Athlete Detail Modal */}
      {selectedAthlete ? (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedAthleteId(null)}
        >
          <div
            className="w-full max-w-md animate-slide-up rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-float sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--border)] sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">
                  {selectedAthlete.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedAthlete.fullName}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{selectedAthlete.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAthleteId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-[var(--background)] p-3">
                <span className="text-xs text-[var(--text-muted)]">شماره</span>
                <p className="font-medium">{selectedAthlete.phone ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-[var(--background)] p-3">
                <span className="text-xs text-[var(--text-muted)]">برنامه فعال</span>
                <p className="font-medium">{selectedAthlete.activeProgram || "بدون برنامه فعال"}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/coach/athletes/${selectedAthlete.id}`}
                className="flex-1 rounded-xl bg-primary py-3 text-center font-black text-white shadow-card transition-all active:scale-[0.98]"
                onClick={() => setSelectedAthleteId(null)}
              >
                مشاهده پروفایل
              </Link>
              <Link
                href="/coach/assign"
                className="flex-1 rounded-xl border border-[var(--border)] py-3 text-center font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
                onClick={() => setSelectedAthleteId(null)}
              >
                تخصیص برنامه
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
