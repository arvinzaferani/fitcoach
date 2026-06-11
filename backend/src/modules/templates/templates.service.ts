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
