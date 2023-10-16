import { Participant } from "../entity/Participant";
import { ParticipantUsecaseDto } from "./dto/ParticipantUsecaseDto";

import { CreateParticipantPort } from "./port/CreateParticipantPort";
import { GetOrCreateParticipantPort } from "./port/GetOrCreateParticipantPort";
import { GetParticipantPort } from "./port/GetParticipantPort";
import { UpdateParticipantPort } from "./port/UpdateParticipantPort";

export interface ParticipantUsecase {
  getParticipant(payload: GetParticipantPort): Promise<Participant>;

  getOrCreate(
    payload: GetOrCreateParticipantPort,
  ): Promise<ParticipantUsecaseDto>;

  createParticipant(
    payload: CreateParticipantPort,
  ): Promise<ParticipantUsecaseDto>;

  // removeParticipant(payload: {
  //   id?: string;
  //   userId?: string;
  // }): Promise<{ id: string }>;

  // updateParticipant(payload: UpdateParticipantPort): Promise<{ id: string }>;
}