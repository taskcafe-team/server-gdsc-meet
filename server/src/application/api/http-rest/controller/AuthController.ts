import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiResponse } from "@nestjs/swagger";

import { CreateUserAdapter } from "@infrastructure/adapter/usecase/user/CreateUserAdapter";

import { UserRole } from "@core/common/enums/UserEnums";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { HttpAuthService } from "../auth/HttpAuthService";
import { HttpLocalAuthGuard } from "../auth/guard/HttpLocalAuthGuard";
import {
  HttpLoggedInUser,
  HttpRequestWithUser,
} from "../auth/type/HttpAuthTypes";
import { HttpGoogleOAuthGuard } from "../auth/guard/HttpGoogleOAuthGuard";
import {
  HttpRestApiModelRegisterBody,
  HttpRestApiModelLogInBody,
  HttpRestApiModelResetPasswordBody,
  HttpRestApiModelGetAccessTokenBody,
} from "./documentation/AuthDocumentation";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: HttpAuthService) {}

  @Post("email/login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpLocalAuthGuard)
  public async loginWithEmail(
    @Req() request: HttpRequestWithUser,
    @Body() body: HttpRestApiModelLogInBody,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    return CoreApiResponse.success(result);
  }

  @Post("access-token")
  @ApiResponse({ status: HttpStatus.OK })
  public async getAccessToken(
    @Body(new ValidationPipe()) body: HttpRestApiModelGetAccessTokenBody,
  ): Promise<CoreApiResponse<{ accessToken: string }>> {
    const result = await this.authService.getAccessToken(body.refreshToken);
    return CoreApiResponse.success(result);
  }

  @Post("email/register")
  @HttpCode(HttpStatus.CREATED)
  public async registerWithEmail(
    @Body(new ValidationPipe()) body: HttpRestApiModelRegisterBody,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: CreateUserAdapter = await CreateUserAdapter.new({
      firstName: null,
      lastName: null,
      email: body.email,
      role: UserRole.USER,
      password: body.password,
      avatar: null,
      providerName: null,
      providerId: null,
    });
    const result = await this.authService.register(adapter);

    return CoreApiResponse.success(result);
  }

  @Get("email/confirm-email")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmEmail(
    @Query("token") token: string,
  ): Promise<CoreApiResponse<void>> {
    return CoreApiResponse.success(await this.authService.confirmEmail(token));
  }

  @Get("email/resend-verification")
  @HttpCode(HttpStatus.OK)
  public async resendVerification(
    @Query("email") email: string,
  ): Promise<void> {
    const result = await this.authService.resendVerification(email);
  }

  @Get("email/forgot-password")
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Query("email") email: string,
  ): Promise<CoreApiResponse<void>> {
    const result = await this.authService.forgotPassword(email);
    return CoreApiResponse.success(result);
  }

  @Post("email/reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(
    @Body() body: HttpRestApiModelResetPasswordBody,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resetPassword(body);
    return CoreApiResponse.success();
  }

  @Get("google/login")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpGoogleOAuthGuard)
  public async loginWithGoogleOAuth() {
    return;
  }

  @Get("google/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpGoogleOAuthGuard)
  public async verifyLoginGoogle(
    @Req() request: HttpRequestWithUser,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    return CoreApiResponse.success(result);
  }
}
