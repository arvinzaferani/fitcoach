import { Body, Controller, Delete, Get, Param, Post, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../../common/public.decorator";
import { Roles } from "../../common/roles.decorator";
import { CreateExerciseGifUploadDto, DeleteExerciseGifDto } from "./media.dto";
import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get(":id")
  async getMedia(@Param("id") id: string, @Res({ passthrough: true }) response: Response) {
    const media = await this.mediaService.getMediaContent(id);
    response.setHeader("Content-Type", media.contentType);
    response.setHeader("Cache-Control", "public, max-age=86400");
    return new StreamableFile(media.buffer);
  }
}

@Roles("admin")
@Controller("admin/media")
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("presign")
  createExerciseGifUpload(@Body() body: CreateExerciseGifUploadDto) {
    return this.mediaService.createExerciseGifUpload(body);
  }

  @Delete(":id")
  deleteExerciseGif(@Param("id") id: string) {
    return this.mediaService.deleteMedia(id);
  }
}
