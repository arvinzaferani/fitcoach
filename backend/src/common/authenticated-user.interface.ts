export type UserRole = "admin" | "coach" | "athlete";

export type AuthenticatedUser = {
  sub: string;
  email: string;
  role: UserRole;
};
