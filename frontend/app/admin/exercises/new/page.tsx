"use client";

import { AppShell } from "@/components/AppShell";
import { ExerciseForm } from "../_components/ExerciseForm";

export default function NewExercisePage() {
  return (
    <AppShell title="افزودن حرکت جدید" subtitle="اطلاعات حرکت را وارد کنید و GIF آن را آپلود نمایید">
      <div className="mx-auto max-w-xl">
        <ExerciseForm mode="create" />
      </div>
    </AppShell>
  );
}
