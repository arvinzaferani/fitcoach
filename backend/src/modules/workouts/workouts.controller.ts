import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { Roles } from "../../common/roles.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { WorkoutsService } from "./workouts.service";

@Roles("athlete")
@Controller("athlete")
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get("profile")
  profile() {
    return { message: "Athlete profile." };
  }

  @Put("profile")
  updateProfile(@Body() body: unknown) {
    return { message: "Update athlete profile.", body };
  }

  @Get("current-program")
  currentProgram() {
    return { message: "Current program with week days." };
  }

  @Get("today-workout")
  todayWorkout(@CurrentUser() user: AuthenticatedUser) {
    return this.workoutsService.todayWorkout(user.sub);
  }

  @Get("workout/:date")
  workoutByDate(@Param("date") date: string) {
    return { date, message: "Workout for selected date." };
  }

  @Post("workout/log")
  logSet(@Body() body: unknown) {
    return { message: "Log one workout set.", body };
  }

  @Get("workout/history")
  history() {
    return { message: "Workout history." };
  }
}
