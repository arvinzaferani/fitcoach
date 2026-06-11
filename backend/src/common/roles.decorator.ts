import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Array<"admin" | "coach" | "athlete">) => SetMetadata(ROLES_KEY, roles);
