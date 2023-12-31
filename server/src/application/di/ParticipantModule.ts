import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { ParticipantController } from "@application/api/http-rest/controller/ParticipantController";

import { HttpParticipantRoleAuthGuard } from "@application/api/http-rest/auth/guard/HttpParticipantRoleAuthGuard";
import { ParticipantService } from "@application/services/ParticipantService";
import { UserModule } from "./UserModule";
import { MeetingModule } from "./MeetingModule";
import { MeetingService } from "@application/services/MeetingService";
import { RoomService } from "@application/services/RoomService";

@Module({
  controllers: [ParticipantController],
  imports: [InfrastructureModule, UserModule, MeetingModule],
  providers: [
    MeetingService,
    ParticipantService,
    HttpParticipantRoleAuthGuard,
    RoomService,
  ],
  exports: [ParticipantService],
})
export class ParticipantModule {}
