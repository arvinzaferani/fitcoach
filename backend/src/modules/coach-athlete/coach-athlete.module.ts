import { Module } from "@nestjs/common";
import { CoachAthleteController } from "./coach-athlete.controller";
import { CoachAthleteService } from "./coach-athlete.service";

@Module({
  controllers: [CoachAthleteController],
  providers: [CoachAthleteService],
})
export class CoachAthleteModule {}
