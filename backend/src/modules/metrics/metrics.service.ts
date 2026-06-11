import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAthleteMetrics(athleteId: string) {
    const athlete = await this.prisma.user.findFirst({ where: { id: athleteId, role: "athlete" } });
    if (!athlete) {
      return [];
    }

    const metrics = await this.prisma.athleteMetric.findMany({
      where: { athleteId: athlete.id },
      orderBy: { recordedAt: "asc" },
      take: 24,
    });

    return metrics.map((metric) => ({
      id: metric.id,
      recordedAt: metric.recordedAt,
      weightKg: metric.weightKg ? Number(metric.weightKg) : null,
      bodyFatPercentage: metric.bodyFatPercentage ? Number(metric.bodyFatPercentage) : null,
      muscleMassKg: metric.muscleMassKg ? Number(metric.muscleMassKg) : null,
      biologicalAge: metric.biologicalAge,
      notes: metric.notes,
    }));
  }

  canEditMetric(recordedDate: Date) {
    const now = new Date();
    const day = now.getDay();
    const daysSinceSaturday = (day + 1) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceSaturday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return recordedDate >= startOfWeek && recordedDate <= endOfWeek;
  }
}
