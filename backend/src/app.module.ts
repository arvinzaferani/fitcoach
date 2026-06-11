import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { RolesGuard } from "./common/roles.guard";
import { AssignmentsModule } from "./modules/assignments/assignments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { CoachAthleteModule } from "./modules/coach-athlete/coach-athlete.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { MediaModule } from "./modules/media/media.module";
import { TemplatesModule } from "./modules/templates/templates.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkoutsModule } from "./modules/workouts/workouts.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CoachAthleteModule,
    UsersModule,
    ExercisesModule,
    TemplatesModule,
    AssignmentsModule,
    MetricsModule,
    MediaModule,
    WorkoutsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
