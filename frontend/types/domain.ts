export type UserRole = "admin" | "coach" | "athlete";
export type FitnessLevel = "beginner" | "intermediate" | "advanced" | "elite";
export type TrainingGoal = "weight_loss" | "muscle_gain" | "strength" | "endurance" | "general_fitness";
export type WorkoutStatus = "pending" | "in-progress" | "completed";

export interface AthleteSummary {
  id: string;
  fullName: string;
  level: FitnessLevel;
  goal: TrainingGoal;
  lastMetricDate: string;
  activeProgram: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: number;
  repsRange: string;
  restSeconds: number;
  muscleGroup: string;
  gifMediaId?: string | null;
  status: WorkoutStatus;
}

export interface MetricPoint {
  date: Date;
  value: number;
}
