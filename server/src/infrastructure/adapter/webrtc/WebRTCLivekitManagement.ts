import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AccessToken,
  DataPacket_Kind,
  Room,
  RoomServiceClient,
  SendDataOptions,
  TokenVerifier,
  VideoGrant,
} from "livekit-server-sdk";
import { AccessTokenMetadata, RoomType, SendDataMessagePort } from "./Types";
import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";

export type _RoomClientService = Omit<
  RoomServiceClient,
  "getParticipant" | "createRoom" | "updateParticipants" | "sendData"
>;

export type CreateRoomDTO = {
  roomId: string;
  roomType: RoomType;
  emptyTimeout: number;
  maxParticipants: number;
};
export type CreateTokenDTO = {
  roomId: string;
  roomType: RoomType;
  roomToken: string;
};

export type GetParticipantPort = {
  roomId: string;
  roomType: RoomType;
  participantId: string;
};

export type GetParticipantsPort = {
  roomId: string;
  roomType: RoomType;
  participantIds: string[];
};

export type CreateAccessTokenPort = {
  permissions: VideoGrant;
  metadata: AccessTokenMetadata;
};

export type CreateRoomPort = {
  roomId: string;
  roomType: RoomType;
  emptyTimeout?: number;
  maxParticipants?: number;
};

export type IWebRTCLivekitService = {
  _roomServiceClient: _RoomClientService;
  createRoom: (port: CreateRoomPort) => Promise<CreateRoomDTO>;
  createToken: (
    port: CreateAccessTokenPort,
    metadata: AccessTokenMetadata,
  ) => Promise<CreateTokenDTO>;
  verifyToken: (token: string) => Promise<AccessTokenMetadata>;
  sendDataMessage: (port: SendDataMessagePort) => Promise<void>;
  getParticipant: (port: GetParticipantPort) => Promise<ParticipantUsecaseDTO>;
  getParticipants(port: GetParticipantsPort): Promise<ParticipantUsecaseDTO[]>;
};

@Injectable()
export class WebRTCLivekitService implements IWebRTCLivekitService {
  private readonly livekitHost: string;
  private readonly livekitClientId: string;
  private readonly livekitClientSecret: string;

  private readonly roomServiceClient: RoomServiceClient;

  private readonly emptyTimeout: number = 100;
  private readonly maxParticipants: number = 100;

  constructor(configService: ConfigService<EnvironmentVariablesConfig, true>) {
    this.livekitHost = configService.get("WEBRTC_LIVEKIT_API_HOST");
    this.livekitClientId = configService.get("WEBRTC_LIVEKIT_CLIENT_ID");
    this.livekitClientSecret = configService.get(
      "WEBRTC_LIVEKIT_CLIENT_SECRET",
    );

    this.roomServiceClient = new RoomServiceClient(
      this.livekitHost,
      this.livekitClientId,
      this.livekitClientSecret,
    );
  }

  public get _roomServiceClient(): _RoomClientService {
    return this.roomServiceClient;
  }

  public async createRoom(port: {
    roomId: string;
    roomType: RoomType;
    emptyTimeout?: number;
    maxParticipants?: number;
  }) {
    const { roomId, roomType } = port;
    const roomname = `${port.roomType}:${port.roomId}`;
    const room: Room = await this.roomServiceClient.createRoom({
      name: roomname,
      emptyTimeout: port.emptyTimeout || this.emptyTimeout,
      maxParticipants: port.maxParticipants || this.maxParticipants,
    });

    return {
      roomId,
      roomType,
      emptyTimeout: room.emptyTimeout,
      maxParticipants: room.maxParticipants,
    };
  }

  public async createToken(
    port: CreateAccessTokenPort,
  ): Promise<CreateTokenDTO> {
    const { metadata, permissions } = port;
    const at = new AccessToken(this.livekitClientId, this.livekitClientSecret, {
      name: metadata.name === "" ? "no name" : metadata.name,
      identity: metadata.id,
      metadata: JSON.stringify(metadata),
    });

    const roomname = `${metadata.room.type}:${metadata.room.id}`;
    at.addGrant({
      room: roomname,
      roomJoin: permissions.roomJoin ?? true,
      canPublish: permissions.canPublish ?? true,
      canSubscribe: permissions.canSubscribe ?? true,
      roomList: permissions.roomList ?? false,
      roomCreate: permissions.roomCreate ?? false,
      canPublishData: permissions.canPublishData ?? true,
      canPublishSources: permissions.canPublishSources ?? undefined,
      hidden: permissions.hidden ?? false,
    });

    const result = {
      roomId: metadata.room.id,
      roomType: metadata.room.type,
      roomToken: at.toJwt(),
    };

    return result;
  }

  public async verifyToken(token: string): Promise<AccessTokenMetadata> {
    const jwtVerify = new TokenVerifier(
      this.livekitClientId,
      this.livekitClientSecret,
    );

    const claimGrants = jwtVerify.verify(token);
    const { video, metadata } = claimGrants;
    if (!video || !metadata)
      throw new InternalServerErrorException("Verify token failed!");

    const accessToken = JSON.parse(metadata) as AccessTokenMetadata;
    if (!accessToken || !accessToken.room)
      throw new InternalServerErrorException("Verify token failed!");

    return accessToken;
  }

  public async getParticipant(
    port: GetParticipantPort,
  ): Promise<ParticipantUsecaseDTO> {
    const { roomId, roomType, participantId } = port;

    const roomname = `${roomType}:${roomId}`;
    const p = await this.roomServiceClient
      .getParticipant(roomname, participantId)
      .catch(() => null);
    if (!p) throw new NotFoundException("Participant not found!");
    const metadata = JSON.parse(p.metadata) as AccessTokenMetadata;
    return metadata as ParticipantUsecaseDTO;
  }

  public async getParticipants(
    port: GetParticipantsPort,
  ): Promise<ParticipantUsecaseDTO[]> {
    const { roomId, roomType, participantIds } = port;
    const psPromis = participantIds.map(async (participantId) => {
      return await this.getParticipant({
        roomId,
        roomType,
        participantId,
      });
    });
    const ps = await Promise.all(psPromis);
    return ps;
  }

  public async updateParticipants(port: {
    roomId: string;
    roomType: RoomType;
    participantId: string;
  }) {
    //TODO: chua xu ly
    const { roomId, roomType, participantId } = port;

    const roomname = `${roomType}:${roomId}`;
    return await this.roomServiceClient.updateParticipant(
      roomname,
      participantId,
    );
  }

  public async sendDataMessage(port: SendDataMessagePort) {
    const { roomId, roomType, participantIds } = port.sendto;

    const encoder = new TextEncoder();
    const action = encoder.encode(JSON.stringify(port.action));

    const sendDataOptions: SendDataOptions = {
      destinationIdentities: participantIds,
    };

    const roomname = `${roomType}:${roomId}`;
    return await this.roomServiceClient
      .sendData(roomname, action, DataPacket_Kind.RELIABLE, sendDataOptions)
      .catch((e) => console.log(e));
  }
}
