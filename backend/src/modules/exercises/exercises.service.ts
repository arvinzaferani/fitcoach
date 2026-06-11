import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateExerciseDto, UpdateExerciseDto } from "./exercises.dto";

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
  }

  findAll() {
    return this.prisma.exercise.findMany({
      orderBy: [{ isActive: "desc" }, { group: "asc" }, { name: "asc" }],
    });
  }

  async findById(id: string, includeInactive = true) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise || (!includeInactive && !exercise.isActive)) {
      throw new NotFoundException("Exercise not found");
    }

    return exercise;
  }

  create(data: CreateExerciseDto & { createdBy?: string }) {
    return this.prisma.exercise.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        muscleGroup: data.muscleGroup,
        group: data.group,
        equipment: data.equipment,
        gifMediaId: data.gifMediaId,
        description: data.description,
        createdBy: data.createdBy,
      },
    });
  }

  update(id: string, data: UpdateExerciseDto) {
    return this.prisma.exercise.update({
      where: { id },
      data: {
        name: data.name,
        nameEn: data.nameEn,
        muscleGroup: data.muscleGroup,
        group: data.group,
        equipment: data.equipment,
        gifMediaId: data.gifMediaId,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  deactivate(id: string) {
    return this.prisma.exercise.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
