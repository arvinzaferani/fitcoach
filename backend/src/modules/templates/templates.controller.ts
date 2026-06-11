import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import { Roles } from "../../common/roles.decorator";
import { AuthenticatedUser } from "../../common/authenticated-user.interface";
import { CreateTemplateDto } from "./templates.dto";
import { TemplatesService } from "./templates.service";

@Roles("coach")
@Controller("coach/templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.templatesService.listCoachTemplates(user.sub);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateTemplateDto) {
    return this.templatesService.createTemplate({
      coachId: user.sub,
      title: body.title,
      difficultyLevel: body.difficultyLevel,
      suggestedForGoal: body.suggestedForGoal,
      suggestedTrainingDays: body.suggestedTrainingDays,
      description: body.description,
      plan: body.plan,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return { id, message: "Template details." };
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return { id, message: "Update template.", body };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return { id, message: "Delete template if unassigned." };
  }

  @Post(":id/copy")
  copy(@Param("id") id: string) {
    return { id, message: "Copy template." };
  }
}
