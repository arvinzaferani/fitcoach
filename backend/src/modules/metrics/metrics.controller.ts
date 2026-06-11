import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { Roles } from "../../common/roles.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { MetricsService } from "./metrics.service";

@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Roles("athlete")
  @Get("athlete/metrics")
  myMetrics(@CurrentUser() user: AuthenticatedUser) {
    return this.metricsService.listAthleteMetrics(user.sub);
  }

  @Roles("athlete")
  @Post("athlete/metrics")
  createMyMetric(@Body() body: unknown) {
    return { message: "Create athlete metric.", body };
  }

  @Roles("athlete")
  @Put("athlete/metrics/:id")
  updateMyMetric(@Param("id") id: string, @Body() body: unknown) {
    return { id, message: "Update current-week metric only.", body };
  }

  @Roles("athlete")
  @Delete("athlete/metrics/:id")
  deleteMyMetric(@Param("id") id: string) {
    return { id, message: "Delete current-week metric only." };
  }

  @Roles("coach")
  @Get("coach/athletes/:id/metrics")
  athleteMetrics(@Param("id") id: string) {
    return { id, message: "Coach reads athlete metrics." };
  }

  @Roles("coach")
  @Post("coach/athletes/:id/metrics")
  createAthleteMetric(@Param("id") id: string, @Body() body: unknown) {
    return { id, message: "Coach records athlete metric.", body };
  }
}
