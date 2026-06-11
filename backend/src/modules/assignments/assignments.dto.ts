import { IsDateString, IsString, IsUUID } from "class-validator";

export class AssignTemplateDto {
  @IsUUID()
  athleteId: string;

  @IsUUID()
  templateId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
