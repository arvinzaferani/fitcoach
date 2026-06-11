"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WorkoutCard } from "@/components/WorkoutCard";
import { acceptAthleteInvitation, getAthleteInvitations, getAthleteTodayWorkout, type AthleteInvitationItem, type AthleteWorkoutResponse } from "@/lib/api";

export default function AthleteDashboardPage() {
  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<AthleteWorkoutResponse["exercises"]>([]);
  const [invitations, setInvitations] = useState<AthleteInvitationItem[]>([]);
  const [inviteStatus, setInviteStatus] = useState("");
  const [acceptingInvitationId, setAcceptingInvitationId] = useState<string | null>(null);

  useEffect(() => {
    getAthleteTodayWorkout().then((data) => {
      setProgramTitle(data.activeProgramTitle);
      setTodayWorkout(data.exercises);
    }).catch(() => {
      setProgramTitle(null);
      setTodayWorkout([]);
    });

    getAthleteInvitations().then(setInvitations).catch(() => {
      setInvitations([]);
    });
  }, []);

  async function handleAcceptInvitation(invitationId: string) {
    if (acceptingInvitationId) {
      return;
    }

    setAcceptingInvitationId(invitationId);
    setInviteStatus("");
    try {
      await acceptAthleteInvitation(invitationId);
      setInvitations((current) => current.filter((item) => item.id !== invitationId));
      setInviteStatus("دعوت با موفقیت پذیرفته شد.");
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "پذیرش دعوت ناموفق بود.");
    } finally {
      setAcceptingInvitationId(null);
    }
  }

  return (
    <AppShell title="صفحه اصلی ورزشکار" subtitle="تمرین امروز، پیشرفت هفته و دسترسی سریع به ثبت ست">
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">دعوت‌های مربیان</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">دعوت‌های در انتظار پذیرش را اینجا می‌بینید.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">{invitations.length} دعوت</span>
        </div>
        {inviteStatus ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{inviteStatus}</p> : null}
        <div className="mt-4 space-y-3">
          {invitations.length > 0 ? invitations.map((invitation) => (
            <div key={invitation.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold">{invitation.coach.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{invitation.coach.email}</p>
                {invitation.message ? <p className="mt-2 text-sm">{invitation.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => handleAcceptInvitation(invitation.id)}
                disabled={acceptingInvitationId === invitation.id}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acceptingInvitationId === invitation.id ? "در حال پذیرش..." : "پذیرش دعوت"}
              </button>
            </div>
          )) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">فعلاً دعوتی برای شما ثبت نشده است.</p>
          )}
        </div>
      </div>
      <div className="mb-6 rounded-xl bg-primary p-6 text-white ">
        <h2 className="text-2xl font-black">تمرین امروز: {programTitle ?? "بدون برنامه فعال"}</h2>
        <p className="mt-2 opacity-85">{todayWorkout.length} حرکت</p>
      </div>
      <div className="space-y-4">
        {todayWorkout.map((exercise) => (
          <WorkoutCard key={exercise.id} {...exercise} gifMediaId={exercise.gifMediaId ?? undefined} />
        ))}
      </div>
      <Link href="/athlete/workout" className="mt-6 inline-flex rounded-lg bg-secondary px-6 py-3 font-black text-white">
        شروع تمرین کامل
      </Link>
    </AppShell>
  );
}
