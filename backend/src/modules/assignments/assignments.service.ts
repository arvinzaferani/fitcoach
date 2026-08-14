import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCoachAthletes(coachId: string) {
    const relations = await this.prisma.coachAthleteRelation.findMany({
      where: { coachId },
      include: {
        athlete: {
          include: {
            assignedPrograms: {
              include: {
                template: true,
              },
              where: { status: "active" },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return relations.map((relation) => ({
      id: relation.athlete.id,
      fullName: relation.athlete.fullName,
      email: relation.athlete.email,
      phone: relation.athlete.phone,
      activeProgram: relation.athlete.assignedPrograms[0]?.template.title ?? "بدون برنامه فعال",
      relationCreatedAt: relation.createdAt,
    }));
  }

  async listAssignments(coachId: string) {
    const assignments = await this.prisma.athleteAssignedProgram.findMany({
      where: { assignedBy: coachId },
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      athleteId: assignment.athlete.id,
      athleteName: assignment.athlete.fullName,
      templateId: assignment.template.id,
      templateTitle: assignment.template.title,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      status: assignment.status,
      createdAt: assignment.createdAt,
    }));
  }

  async getAthleteProfile(athleteId: string, coachId: string) {
    const relation = await this.prisma.coachAthleteRelation.findUnique({
      where: { coachId_athleteId: { coachId, athleteId } },
    });

    if (!relation) {
      throw new Error("این ورزشکار در لیست شما نیست.");
    }

    const athlete = await this.prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        athleteProfile: true,
        athleteMetrics: {
          orderBy: { recordedAt: "desc" },
          take: 50,
        },
        assignedPrograms: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            template: {
              select: {
                id: true,
                title: true,
                difficultyLevel: true,
                suggestedForGoal: true,
              },
            },
          },
        },
      },
    });

    if (!athlete) {
      throw new Error("ورزشکار یافت نشد.");
    }

    const activeProgram = athlete.assignedPrograms[0] ?? null;

    return {
      id: athlete.id,
      fullName: athlete.fullName,
      email: athlete.email,
      phone: athlete.phone,
      profile: athlete.athleteProfile,
      metrics: athlete.athleteMetrics.map((m) => ({
        id: m.id,
        recordedAt: m.recordedAt,
        weightKg: m.weightKg,
        bodyFatPercentage: m.bodyFatPercentage,
        muscleMassKg: m.muscleMassKg,
        biologicalAge: m.biologicalAge,
        notes: m.notes,
      })),
      activeProgram: activeProgram
        ? {
            id: activeProgram.id,
            templateId: activeProgram.template.id,
            templateTitle: activeProgram.template.title,
            difficulty: activeProgram.template.difficultyLevel,
            purpose: activeProgram.template.suggestedForGoal,
            startDate: activeProgram.startDate,
            endDate: activeProgram.endDate,
            isCustomized: activeProgram.isCustomized,
          }
        : null,
    };
  }

  async getAthleteCurrentProgram(athleteId: string, coachId: string) {
    const relation = await this.prisma.coachAthleteRelation.findUnique({
      where: { coachId_athleteId: { coachId, athleteId } },
    });

    if (!relation) {
      throw new Error("این ورزشکار در لیست شما نیست.");
    }

    const assignment = await this.prisma.athleteAssignedProgram.findFirst({
      where: { athleteId, status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            difficultyLevel: true,
            suggestedForGoal: true,
          },
        },
      },
    });

    return assignment
      ? {
          id: assignment.id,
          templateId: assignment.template.id,
          templateTitle: assignment.template.title,
          difficulty: assignment.template.difficultyLevel,
          purpose: assignment.template.suggestedForGoal,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isCustomized: assignment.isCustomized,
          customizationNote: assignment.customizationNote,
        }
      : null;
  }

  async assignTemplate(data: { athleteId: string; templateId: string; assignedBy: string; startDate: Date; endDate: Date }) {
    const assignment = await this.prisma.athleteAssignedProgram.create({
      data,
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await this.prisma.programTemplate.update({
      where: { id: data.templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return {
      id: assignment.id,
      athleteId: assignment.athlete.id,
      athleteName: assignment.athlete.fullName,
      templateId: assignment.template.id,
      templateTitle: assignment.template.title,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      status: assignment.status,
      createdAt: assignment.createdAt,
    };
  }
}
