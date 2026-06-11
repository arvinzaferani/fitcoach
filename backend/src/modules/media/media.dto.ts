import { IsInt, IsString, MaxLength, Min } from "class-validator";

export class CreateExerciseGifUploadDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @MaxLength(100)
  contentType: string;

  @IsInt()
  @Min(1)
  sizeBytes: number;
}

export class DeleteExerciseGifDto {
  @IsString()
  @MaxLength(255)
  key: string;
}
