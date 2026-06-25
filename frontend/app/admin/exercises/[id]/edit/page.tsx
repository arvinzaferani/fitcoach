"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ExerciseForm } from "../../_components/ExerciseForm";

export default function EditExercisePage() {
  const params = useParams<{ id: string }>();

  return (
    <AppShell title="ویرایش حرکت" subtitle="تغییرات مورد نظر را اعمال کنید">
      <div className="mx-auto max-w-xl">
        <ExerciseForm mode="edit" exerciseId={params.id} />
      </div>
    </AppShell>
  );
}
