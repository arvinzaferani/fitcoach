import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { Roles } from "../../common/roles.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { AcceptInvitationDto, SendInvitationDto } from "./coach-athlete.dto";
import { CoachAthleteService } from "./coach-athlete.service";

@Controller("coach-athlete")
export class CoachAthleteController {
  constructor(private readonly coachAthleteService: CoachAthleteService) {}

  @Roles("coach")
  @Post("invite")
  sendInvitation(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendInvitationDto) {
    return this.coachAthleteService.sendInvitation({ ...dto, coachId: user.sub });
  }

  @Roles("coach")
  @Get("coach/:coachId/invitations")
  coachInvitations(@CurrentUser() user: AuthenticatedUser, @Param("coachId") coachId: string) {
    return this.coachAthleteService.listCoachInvitations(user.sub === coachId ? coachId : user.sub);
  }

  @Roles("athlete")
  @Get("athlete/:athleteId/invitations")
  athleteInvitations(@CurrentUser() user: AuthenticatedUser, @Param("athleteId") athleteId: string) {
    return this.coachAthleteService.listAthleteInvitations(user.sub === athleteId ? athleteId : user.sub);
  }

  @Roles("athlete")
  @Get("athlete/:athleteId/coaches")
  athleteCoaches(@CurrentUser() user: AuthenticatedUser, @Param("athleteId") athleteId: string) {
    return this.coachAthleteService.listAthleteCoaches(user.sub === athleteId ? athleteId : user.sub);
  }

  @Roles("athlete")
  @Post("accept")
  acceptInvitation(@CurrentUser() user: AuthenticatedUser, @Body() dto: AcceptInvitationDto) {
    return this.coachAthleteService.acceptInvitation({ ...dto, athleteId: user.sub });
  }
}
