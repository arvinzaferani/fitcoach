import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { Roles } from "../../common/roles.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { AssignmentsService } from "./assignments.service";
import { AssignTemplateDto } from "./assignments.dto";

@Roles("coach")
@Controller("coach")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get("athletes")
  athletes(@CurrentUser() user: AuthenticatedUser) {
    return this.assignmentsService.listCoachAthletes(user.sub);
  }

  @Post("athletes/invite")
  inviteAthlete(@Body() body: unknown) {
    return { message: "Invite athlete by email.", body };
  }

  @Delete("athletes/:id")
  removeAthlete(@Param("id") id: string) {
    return { id, message: "Remove coach-athlete relation." };
  }

  @Get("athletes/:id/profile")
  athleteProfile(@Param("id") id: string) {
    return { id, message: "Athlete profile with metrics and programs." };
  }

  @Put("athletes/:id/profile")
  updateAthleteProfile(@Param("id") id: string, @Body() body: unknown) {
    return { id, message: "Update athlete profile.", body };
  }

  @Post("assign")
  assign(@CurrentUser() user: AuthenticatedUser, @Body() dto: AssignTemplateDto) {
    return this.assignmentsService.assignTemplate({
      athleteId: dto.athleteId,
      templateId: dto.templateId,
      assignedBy: user.sub,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Get("assignments")
  assignments(@CurrentUser() user: AuthenticatedUser) {
    return this.assignmentsService.listAssignments(user.sub);
  }

  @Get("assignments/:id")
  assignment(@Param("id") id: string) {
    return { id, message: "Assignment details." };
  }

  @Put("assignments/:id/customize")
  customize(@Param("id") id: string, @Body() body: unknown) {
    return { id, message: "Customize assigned program.", body };
  }

  @Get("athletes/:id/current-program")
  currentProgram(@Param("id") id: string) {
    return { id, message: "Current athlete program." };
  }
}
