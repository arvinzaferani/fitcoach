import { IsOptional, IsString, IsUUID } from "class-validator";

export class SendInvitationDto {
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @IsString()
  athleteContact: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class AcceptInvitationDto {
  @IsUUID()
  invitationId: string;

  @IsOptional()
  @IsUUID()
  athleteId?: string;
}
