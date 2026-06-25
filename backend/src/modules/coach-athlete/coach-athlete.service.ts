import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AcceptInvitationDto, SendInvitationDto } from "./coach-athlete.dto";

@Injectable()
export class CoachAthleteService {
  constructor(private readonly prisma: PrismaService) {}

  async sendInvitation(dto: SendInvitationDto) {
    const coach = await this.prisma.user.findUnique({ where: { id: dto.coachId } });
    if (!coach || coach.role !== "coach") {
      throw new BadRequestException("Coach not found.");
    }

    const normalizedContact = dto.athleteContact.trim();
    const athlete = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedContact },
          { phone: normalizedContact },
        ],
      },
    });
    if (!athlete || athlete.role !== "athlete") {
      throw new BadRequestException("Athlete not found by email.");
    }

    const existingRelation = await this.prisma.coachAthleteRelation.findUnique({
      where: { coachId_athleteId: { coachId: coach.id, athleteId: athlete.id } },
    });
    if (existingRelation) {
      throw new BadRequestException("Coach and athlete are already connected.");
    }

    const invitation = await this.prisma.coachAthleteInvitation.create({
      data: {
        coachId: coach.id,
        athleteId: athlete.id,
        message: dto.message,
        status: "pending",
      },
    });

    return { invitationId: invitation.id, status: invitation.status };
  }

  listCoachInvitations(coachId: string) {
    return this.prisma.coachAthleteInvitation.findMany({
      where: { coachId },
      include: { athlete: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  listAthleteInvitations(athleteId: string) {
    return this.prisma.coachAthleteInvitation.findMany({
      where: { athleteId, status: "pending" },
      include: { coach: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAthleteCoaches(athleteId: string) {
    const relations = await this.prisma.coachAthleteRelation.findMany({
      where: { athleteId },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return relations.map((relation) => ({
      id: relation.coach.id,
      fullName: relation.coach.fullName,
      email: relation.coach.email,
      phone: relation.coach.phone,
      connectedAt: relation.createdAt,
    }));
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.coachAthleteInvitation.findUnique({ where: { id: dto.invitationId } });
    if (!invitation) {
      throw new NotFoundException("Invitation not found.");
    }
    if (invitation.athleteId !== dto.athleteId) {
      throw new BadRequestException("Invitation does not belong to this athlete.");
    }
    if (invitation.status !== "pending") {
      throw new BadRequestException("Invitation is not pending.");
    }

    await this.prisma.$transaction(async (trx) => {
      await trx.coachAthleteRelation.upsert({
        where: {
          coachId_athleteId: {
            coachId: invitation.coachId,
            athleteId: invitation.athleteId,
          },
        },
        update: {},
        create: {
          coachId: invitation.coachId,
          athleteId: invitation.athleteId,
        },
      });

      await trx.coachAthleteInvitation.update({
        where: { id: invitation.id },
        data: { status: "accepted", acceptedAt: new Date() },
      });
    });

    return { status: "accepted", invitationId: invitation.id };
  }
}
