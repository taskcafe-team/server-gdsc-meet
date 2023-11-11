import { ParticipantRequestJoinDTO, ParticipantSendMessageDTO } from "./Types";

type ActionMap = {
  [key in keyof SendMessageActionEnum]: any;
};

export enum SendMessageActionEnum {
  ParticipantRequestJoin = "participant_request_join",
  ParticipantSendMessage = "participant_send_message",
}

export interface RegisterActionsType extends ActionMap {
  [SendMessageActionEnum.ParticipantRequestJoin]: ParticipantRequestJoinDTO;
  [SendMessageActionEnum.ParticipantSendMessage]: ParticipantSendMessageDTO;
}

export function createSendDataMessageAction<
  T extends keyof RegisterActionsType,
>(type: T, payload: RegisterActionsType[T]) {
  return { type, payload };
}