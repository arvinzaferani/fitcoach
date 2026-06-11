import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  muscleGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  group?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  equipment?: string;

  @IsOptional()
  @IsString()
  gifMediaId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  muscleGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  group?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  equipment?: string;

  @IsOptional()
  @IsString()
  gifMediaId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
