"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCoachAthletes, inviteAthlete, type CoachAthleteItem } from "@/lib/api";

export default function CoachAthletesPage() {
  const [query, setQuery] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<CoachAthleteItem[]>([]);
  const [inviteContact, setInviteContact] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

  useEffect(() => {
    getCoachAthletes().then(setAthletes).catch(() => setAthletes([]));
  }, []);

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return athletes;
    }
    return athletes.filter((athlete) => athlete.fullName.includes(normalizedQuery));
  }, [query, athletes]);

  const selectedAthlete = filteredAthletes.find((athlete) => athlete.id === selectedAthleteId)
    ?? athletes.find((athlete) => athlete.id === selectedAthleteId)
    ?? null;

  async function handleInviteAthlete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteStatus("");
    try {
      await inviteAthlete({ athleteContact: inviteContact.trim(), message: inviteMessage.trim() || undefined });
      setInviteStatus("دعوت ارسال شد.");
      setInviteContact("");
      setInviteMessage("");
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "ارسال دعوت ناموفق بود.");
    }
  }

  return (
    <AppShell title="لیست شاگردان" subtitle="جستجو، فیلتر، مشاهده پروفایل و قطع ارتباط">
      <form onSubmit={handleInviteAthlete} className="mb-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-black">دعوت ورزشکار</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input value={inviteContact} onChange={(event) => setInviteContact(event.target.value)} required placeholder="ایمیل یا شماره ورزشکار" className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" />
          <input value={inviteMessage} onChange={(event) => setInviteMessage(event.target.value)} placeholder="پیام (اختیاری)" className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-black text-white">ارسال دعوت</button>
        </div>
        {inviteStatus ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{inviteStatus}</p> : null}
      </form>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو بر اساس نام..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white  dark:border-slate-800 dark:bg-slate-900">
        {filteredAthletes.map((athlete) => (
          <div key={athlete.id} className="grid gap-3 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 md:grid-cols-5">
            <strong>{athlete.fullName}</strong>
            <span>{athlete.email}</span>
            <span>{athlete.phone ?? "-"}</span>
            <span>{athlete.activeProgram}</span>
            <button
              type="button"
              onClick={() => setSelectedAthleteId(athlete.id)}
              className="rounded-xl bg-secondary/10 px-4 py-2 text-sm font-black text-secondary"
            >
              پروفایل
            </button>
          </div>
        ))}
      </div>
      {selectedAthlete ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-5" onClick={() => setSelectedAthleteId(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-2xl font-black">{selectedAthlete.fullName}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">ایمیل: {selectedAthlete.email}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">شماره: {selectedAthlete.phone ?? "-"}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">برنامه فعال: {selectedAthlete.activeProgram}</p>
            <button type="button" onClick={() => setSelectedAthleteId(null)} className="mt-6 rounded-lg bg-primary px-5 py-2 font-black text-white">
              بستن
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
