import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get("health")
  health() {
    return { status: "users module ready" };
  }
}
