import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { ErrorDTO } from "@core/common/dtos/ErrorDTO";
import { AppException } from "@core/common/exception/AppException";
import { AppConfig } from "@infrastructure/config/AppConfig";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

@Injectable()
@Catch()
export class NestHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  public catch(error: Error, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();
    let errorResponse = CoreApiResponse.error();

    errorResponse = this.handleCoreException(error, errorResponse);
    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.hanlderJwtError(error, errorResponse);

    if (this.configService.get("API_LOG_ENABLE")) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${
          errorResponse.metadata.error
            ? errorResponse.getErrorDisplay()
            : error.message
        }`;

      Logger.error(message);
    }
    response.status(errorResponse.metadata.status);
    response.json(errorResponse);
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof AppException) {
      const errorDTO = new ErrorDTO(
        error.getCode(),
        error.getMessage(),
        error.getAcction(),
        error.getTitle(),
        error.getErrorType(),
      );
      return CoreApiResponse.error(error.getHttpStatus(), errorDTO);
    }
    return errorResponse;
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      return CoreApiResponse.error(error.getStatus(), error.message);
    }
    return errorResponse;
  }

  private hanlderJwtError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ) {
    if (error instanceof JsonWebTokenError) {
      if (error instanceof TokenExpiredError) {
        return CoreApiResponse.error(HttpStatus.UNAUTHORIZED, "Token expired");
      }
      return CoreApiResponse.error(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
    return errorResponse;
  }
}
