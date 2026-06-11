import { Allow, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateTemplateDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(20)
  difficultyLevel: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  suggestedForGoal?: string;

  @IsInt()
  @Min(1)
  suggestedTrainingDays: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Allow()
  plan?: unknown;
}
