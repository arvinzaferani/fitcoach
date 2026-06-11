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
