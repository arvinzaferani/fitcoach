"use client";

import { Check, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  acceptAthleteInvitation,
  getAthleteCoaches,
  getAthleteInvitations,
  type AthleteCoachItem,
  type AthleteInvitationItem,
} from "@/lib/api";

const persianDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeZone: "Asia/Tehran",
});

export default function AthleteCoachesPage() {
  const [coaches, setCoaches] = useState<AthleteCoachItem[]>([]);
  const [invitations, setInvitations] = useState<AthleteInvitationItem[]>([]);
  const [message, setMessage] = useState("");
  const [acceptingInvitationId, setAcceptingInvitationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function loadData() {
    setLoading(true);
    Promise.all([
      getAthleteCoaches().catch(() => []),
      getAthleteInvitations().catch(() => []),
    ])
      .then(([nextCoaches, nextInvitations]) => {
        setCoaches(nextCoaches);
        setInvitations(nextInvitations);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAcceptInvitation(invitationId: string) {
    if (acceptingInvitationId) return;

    setAcceptingInvitationId(invitationId);
    setMessage("");
    try {
      await acceptAthleteInvitation(invitationId);
      setMessage("دعوت با موفقیت پذیرفته شد.");
      loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "پذیرش دعوت ناموفق بود.");
    } finally {
      setAcceptingInvitationId(null);
    }
  }

  return (
    <AppShell title="مربی‌های من" subtitle="ارتباط با مربی‌ها و دعوت‌های در انتظار">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">مربی‌های فعال</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">مربی‌هایی که اتصالشان تایید شده است.</p>
            </div>
            <span className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-black text-primary">{coaches.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? <p className="text-sm text-slate-500 dark:text-slate-300">در حال بارگذاری...</p> : null}
            {!loading && coaches.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                هنوز مربی فعالی برای شما ثبت نشده است.
              </div>
            ) : null}
            {coaches.map((coach) => (
              <article key={coach.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserRound aria-hidden="true" size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black">{coach.fullName}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                      <Mail aria-hidden="true" size={14} />
                      <span className="truncate">{coach.email}</span>
                    </p>
                    {coach.phone ? (
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                        <Phone aria-hidden="true" size={14} />
                        <span>{coach.phone}</span>
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      اتصال از {persianDateFormatter.format(new Date(coach.connectedAt))}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">دعوت‌ها</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">دعوت‌های در انتظار پاسخ.</p>
            </div>
            <span className="rounded-lg bg-secondary/10 px-3 py-2 text-sm font-black text-secondary">{invitations.length}</span>
          </div>

          {message ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <div className="mt-4 space-y-3">
            {!loading && invitations.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                دعوت فعالی ندارید.
              </div>
            ) : null}
            {invitations.map((invitation) => (
              <article key={invitation.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <h3 className="font-black">{invitation.coach.fullName}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{invitation.coach.email}</p>
                {invitation.message ? <p className="mt-3 text-sm">{invitation.message}</p> : null}
                <button
                  type="button"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  disabled={acceptingInvitationId === invitation.id}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check aria-hidden="true" size={16} />
                  <span>{acceptingInvitationId === invitation.id ? "در حال پذیرش..." : "پذیرش دعوت"}</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
