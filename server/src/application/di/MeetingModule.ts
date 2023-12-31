import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { JwtModule } from "@nestjs/jwt";
import { MeetingController } from "@application/api/http-rest/controller/MeetingController";
import { UserModule } from "./UserModule";
import { MeetingService } from "@application/services/MeetingService";
import { RoomService } from "@application/services/RoomService";

@Module({
  controllers: [MeetingController],
  imports: [InfrastructureModule, UserModule, JwtModule, UserModule],
  providers: [MeetingService, RoomService],
})
export class MeetingModule {}
