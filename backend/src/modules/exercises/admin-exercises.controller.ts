import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { Roles } from "../../common/roles.decorator";
import { CreateExerciseDto, UpdateExerciseDto } from "./exercises.dto";
import { ExercisesService } from "./exercises.service";

@Roles("admin")
@Controller("admin/exercises")
export class AdminExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateExerciseDto) {
    return this.exercisesService.create({ ...body, createdBy: user.sub });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.exercisesService.findById(id, true);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: UpdateExerciseDto) {
    return this.exercisesService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.exercisesService.deactivate(id);
  }
}
