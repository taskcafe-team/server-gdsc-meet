import * as path from "path";
import { createWriteStream } from "fs";
import { Multer } from "multer";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { HttpAuth } from "../auth/decorator/HttpAuth";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { GetUserAdapter } from "@infrastructure/adapter/usecase/user/GetUserAdapter";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { UserService } from "@core/services/user/UserService";
import { FileInterceptor } from "@nestjs/platform-express";
import { HttpRestApiModelUpdateUser } from "./documentation/UserDocumentation";

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @HttpAuth()
  @ApiBearerAuth()
  public async getMe(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: GetUserAdapter = await GetUserAdapter.new({
      userId: httpUser.id,
    });

    const result = await this.userService.getUser(adapter);
    return CoreApiResponse.success<UserUsecaseDto>(result);
  }

  @Put("me")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "hello" })
  @UseInterceptors(FileInterceptor("avatar"))
  @ApiBody({ type: HttpRestApiModelUpdateUser })
  public async updateMe(@Body() body: HttpRestApiModelUpdateUser) {
    const avatarFile = body.avatar;

    const uniqueFileName = `${Date.now()}-${avatarFile.originalname}`;
    const uploadPath = path.join(
      __dirname,
      "./../../../../../",
      "data",
      uniqueFileName,
    );
    const writeStream = createWriteStream(uploadPath);
    writeStream.write(avatarFile.buffer);
    writeStream.end();
    return;
  }
}
