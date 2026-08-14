import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTemplate(template: {
    id: string;
    title: string;
    difficultyLevel: string | null;
    suggestedForGoal: string | null;
    suggestedTrainingDays: number | null;
    usageCount: number;
    description: string | null;
    weeks?: Array<{ days: Array<unknown> }>;
  }) {
    return {
      id: template.id,
      title: template.title,
      difficulty: template.difficultyLevel ?? "beginner",
      purpose: template.suggestedForGoal ?? undefined,
      daysCount: template.suggestedTrainingDays ?? template.weeks?.[0]?.days.length ?? 0,
      usage: template.usageCount,
      notes: template.description ?? undefined,
    };
  }

  async listCoachTemplates(coachId: string) {
    const templates = await this.prisma.programTemplate.findMany({
      where: { coachId },
      include: {
        weeks: {
          include: {
            days: true,
          },
          orderBy: { weekNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return templates.map((template) => this.mapTemplate(template));
  }

  async getTemplate(templateId: string, coachId: string) {
    const template = await this.prisma.programTemplate.findFirst({
      where: { id: templateId, coachId },
      include: {
        weeks: {
          include: { days: { include: { exercises: { include: { exercise: { select: { id: true, name: true, muscleGroup: true } } } } } } },
          orderBy: { weekNumber: "asc" },
        },
      },
    });

    if (!template) {
      throw new Error("تمپلیت یافت نشد.");
    }

    let planDays: Array<{
      dayNumber: number;
      phases: Array<{
        id: string;
        title: string;
        blocks: Array<{
          id: string;
          kind: string;
          title?: string;
          type?: string;
          rounds?: number;
          sets?: number;
          exerciseId?: string;
          exerciseName?: string;
          muscleGroup?: string;
          measureType?: string;
          count?: number;
          duration?: number;
          timeUnit?: string;
          children?: Array<{
            id: string;
            exerciseId: string;
            exerciseName?: string;
            muscleGroup?: string;
            measureType?: string;
            count?: number;
            duration?: number;
            timeUnit?: string;
          }>;
        }>;
      }>;
    }> = [];

    if (template.plan && Array.isArray(template.plan)) {
      const exerciseIds = new Set<string>();
      const rawPlan = template.plan as Array<Record<string, unknown>>;

      for (const day of rawPlan) {
        if (!day || typeof day !== "object") continue;
        const phases = (day as { phases?: Array<Record<string, unknown>> }).phases;
        if (!Array.isArray(phases)) continue;
        for (const phase of phases) {
          if (!phase || typeof phase !== "object") continue;
          const blocks = (phase as { blocks?: Array<Record<string, unknown>> }).blocks;
          if (!Array.isArray(blocks)) continue;
          for (const block of blocks) {
            if (!block || typeof block !== "object") continue;
            if (block.exerciseId && typeof block.exerciseId === "string") exerciseIds.add(block.exerciseId);
            if (Array.isArray(block.children)) {
              for (const child of block.children) {
                if (child && typeof child === "object" && typeof child.exerciseId === "string") exerciseIds.add(child.exerciseId);
              }
            }
          }
        }
      }

      const exerciseList = exerciseIds.size > 0
        ? await this.prisma.exercise.findMany({ where: { id: { in: Array.from(exerciseIds) } }, select: { id: true, name: true, muscleGroup: true } })
        : [];
      const exerciseMap = new Map(exerciseList.map((e) => [e.id, e]));

      planDays = rawPlan.map((day, dayIndex) => {
        const dayNumber = typeof day.dayNumber === "number" ? day.dayNumber : dayIndex + 1;
        const rawPhases = Array.isArray(day.phases) ? day.phases : [];
        const phases = rawPhases.map((phase, phaseIndex) => {
          const p = phase && typeof phase === "object" ? (phase as Record<string, unknown>) : null;
          const title = typeof p?.title === "string" ? p.title : `فاز ${phaseIndex + 1}`;
          const phaseId = typeof p?.id === "string" ? p.id : `phase-${dayIndex}-${phaseIndex}`;
          const rawBlocks: unknown[] = Array.isArray(p?.blocks) ? (p.blocks as unknown[]) : Array.isArray(p?.moves) ? (p.moves as unknown[]) : [];
          const blocks = rawBlocks.map((block: unknown, blockIndex: number) => {
            if (!block || typeof block !== "object") return null;
            const b = block as Record<string, unknown>;

            if (b.kind === "compound" || (b.compound && typeof b.compound === "object" && (b.compound as Record<string, unknown>).enabled === true)) {
              const compound = b.compound as Record<string, unknown> | null;
              const rawChildren: unknown[] = Array.isArray(b.children) ? b.children : Array.isArray(compound?.children) ? (compound?.children as unknown[]) : [];
              const children = rawChildren.map((child: unknown, childIndex: number) => {
                const c = child && typeof child === "object" ? (child as Record<string, unknown>) : null;
                const childExerciseId = typeof c?.exerciseId === "string" ? c.exerciseId : "";
                const ex = childExerciseId ? exerciseMap.get(childExerciseId) : null;
                return {
                  id: (typeof c?.id === "string" && c.id) || `compound-child-${dayIndex}-${phaseIndex}-${blockIndex}-${childIndex}`,
                  exerciseId: childExerciseId,
                  exerciseName: ex?.name ?? undefined,
                  muscleGroup: ex?.muscleGroup ?? undefined,
                  measureType: c?.measureType === "time" ? "time" : "count",
                  count: typeof c?.count === "number" ? c.count : undefined,
                  duration: typeof c?.duration === "number" ? c.duration : undefined,
                  timeUnit: typeof c?.timeUnit === "string" ? c.timeUnit : undefined,
                  notes: typeof c?.notes === "string" && c.notes.length > 0 ? c.notes : undefined,
                };
              });
              return {
                id: (typeof b.id === "string" && b.id) || `compound-${dayIndex}-${phaseIndex}-${blockIndex}`,
                kind: "compound",
                title: (typeof b.title === "string" && b.title) || (compound && typeof compound.title === "string" ? compound.title : undefined) || "ست ترکیبی",
                type: (typeof b.type === "string" ? b.type : undefined) || (compound && typeof compound.type === "string" ? compound.type : undefined) || "superset",
                rounds: (typeof b.rounds === "number" ? b.rounds : typeof b.sets === "number" ? b.sets : 1),
                children,
                notes: typeof b.notes === "string" && b.notes.length > 0 ? b.notes : undefined,
              };
            }

            const blockExerciseId = typeof b.exerciseId === "string" ? b.exerciseId : "";
            const ex = blockExerciseId ? exerciseMap.get(blockExerciseId) : null;
            return {
              id: (typeof b.id === "string" && b.id) || `exercise-${dayIndex}-${phaseIndex}-${blockIndex}`,
              kind: "exercise",
              exerciseId: blockExerciseId,
              exerciseName: ex?.name ?? undefined,
              muscleGroup: ex?.muscleGroup ?? undefined,
              sets: typeof b.sets === "number" ? b.sets : 1,
              measureType: b.measureType === "time" ? "time" : "count",
              count: typeof b.count === "number" ? b.count : undefined,
              duration: typeof b.duration === "number" ? b.duration : undefined,
              timeUnit: typeof b.timeUnit === "string" ? b.timeUnit : undefined,
              notes: typeof b.notes === "string" && b.notes.length > 0 ? b.notes : undefined,
            };
          }).filter(Boolean);

          return { id: phaseId, title, blocks: blocks.filter((b): b is NonNullable<typeof b> => Boolean(b)) };
        });
        return { dayNumber, phases };
      });
    }

    return {
      id: template.id,
      title: template.title,
      difficulty: template.difficultyLevel ?? "beginner",
      purpose: template.suggestedForGoal ?? undefined,
      daysCount: template.suggestedTrainingDays ?? template.weeks?.[0]?.days.length ?? 0,
      usage: template.usageCount,
      notes: template.description ?? undefined,
      plan: planDays,
      createdAt: template.createdAt,
    };
  }

  async createTemplate(data: {
    coachId: string;
    title: string;
    difficultyLevel: string;
    suggestedForGoal?: string;
    suggestedTrainingDays: number;
    description?: string;
    totalWeeks?: number;
    plan?: unknown;
  }) {
    const { totalWeeks = 4, ...templateData } = data;
    const template = await this.prisma.programTemplate.create({
      data: {
        coachId: templateData.coachId,
        title: templateData.title,
        description: templateData.description,
        difficultyLevel: templateData.difficultyLevel,
        suggestedForGoal: templateData.suggestedForGoal,
        suggestedForLevel: undefined,
        suggestedTrainingDays: templateData.suggestedTrainingDays,
        isPublic: false,
        plan: templateData.plan as Prisma.InputJsonValue | undefined,
      },
    });

    await this.prisma.templateWeek.createMany({
      data: Array.from({ length: totalWeeks }, (_, index) => ({
        templateId: template.id,
        weekNumber: index + 1,
      })),
    });

    return this.mapTemplate(template);
  }
}
