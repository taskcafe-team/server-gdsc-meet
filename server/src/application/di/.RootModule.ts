import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";
import { MeetingModule } from "./MeetingModule";
import { UserModule } from "./UserModule";
import { ParticipantModule } from "./ParticipantModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "env/local.dev.env",
      validate: EnvironmentVariablesConfig.validate,
    }),
    InfrastructureModule,
    AuthModule,
    UserModule,
    MeetingModule,
    ParticipantModule,
  ],
  providers: [],
  exports: [],
})
export class RootModule {}
