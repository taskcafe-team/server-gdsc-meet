import { plainToClass } from "class-transformer";
import { IsNotEmpty, IsNumber, validateSync, IsBoolean } from "class-validator";

export class EnvironmentVariablesConfig {
  @IsNotEmpty() NODE_ENV: string;
  // ----- api ----- //
  @IsNotEmpty() API_HOST: string;
  @IsNotEmpty() @IsNumber() API_PORT: number;
  @IsNotEmpty() API_TOKEN_SECRET: string;
  @IsNotEmpty() API_ACCESS_TOKEN_SECRET: string;
  @IsNotEmpty() @IsNumber() API_ACCESS_TOKEN_TTL_IN_MINUTES: number;
  @IsNotEmpty() API_ACCESS_TOKEN_HEADER: string;
  @IsNotEmpty() API_LOGIN_USERNAME_FIELD: string;
  @IsNotEmpty() API_LOGIN_PASSWORD_FIELD: string;
  @IsNotEmpty() @IsBoolean() API_LOG_ENABLE: boolean;
  @IsNotEmpty() API_CORS_ORIGIN: string;
  @IsNotEmpty() API_CORS_METHOD: string;

  @IsNotEmpty() API_CONFIRM_EMAIL_URL: string;
  @IsNotEmpty() API_RESET_PASSWORD_URL: string;
  // ---- Google API ---- //
  @IsNotEmpty() GOOGLE_CLIENT_ID: string;
  @IsNotEmpty() GOOGLE_CLIENT_SECRET: string;
  @IsNotEmpty() GOOGLE_CALLBACK_URL: string;

  // ---- Email ---- //
  @IsNotEmpty() EMAIL_HOST: string;
  @IsNotEmpty() @IsNumber() EMAIL_PORT: number;
  @IsNotEmpty() EMAIL_AUTH_USER: string;
  @IsNotEmpty() EMAIL_AUTH_USER_PASSWORD: string;

  public static validate(configuration: Record<string, unknown>) {
    const finalConfig = plainToClass(
      EnvironmentVariablesConfig,
      configuration,
      { enableImplicitConversion: true },
    );

    const errors = validateSync(finalConfig, { skipMissingProperties: false });

    if (errors.length > 0) throw new Error(errors.toString());

    return finalConfig;
  }
}
