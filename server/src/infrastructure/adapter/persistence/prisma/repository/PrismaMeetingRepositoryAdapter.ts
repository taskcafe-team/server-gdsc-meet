import { PrismaBaseRepository } from "./PrismaBaseRepository";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { Prisma } from "@prisma/client";
import { PrismaMeetingMapper } from "../entity/meeting/PrismaMeetingMapper";
import { PrismaMeeting } from "../entity/meeting/PrismaMeeting";
import { Nullable } from "@core/common/type/CommonTypes";
import { MeetingRepositoryPort } from "@core/domain/meeting/usecase/port/MeetingRepositoryPort";
import { MeetingType } from "@core/common/enums/MeetingEnums";

export class PrismaMeetingRepositoryAdapter
  extends PrismaBaseRepository
  implements MeetingRepositoryPort
{
  constructor(context: Prisma.TransactionClient) {
    super(context);
  }

  public async findMeetings(by: {
    id?: string;
    ids?: string[];
    type?: MeetingType;
  }): Promise<Meeting[]> {
    const findOptions: Prisma.MeetingFindManyArgs = { where: {} };

    if (by.id) findOptions.where!.id = by.id;
    if (by.ids) findOptions.where!.id = { in: by.ids };
    if (by.type) findOptions.where!.type = by.type;

    const orm: PrismaMeeting[] = await this.context.meeting.findMany(
      findOptions,
    );

    return orm.map((o) => PrismaMeetingMapper.toDomainEntity(o));
  }

  public async findMeeting(by: { id: string }): Promise<Nullable<Meeting>> {
    const orm = await this.context.meeting
      .findFirst({ where: { id: by.id } })
      .then((o) => o ?? null);
    return orm && PrismaMeetingMapper.toDomainEntity(orm);
  }

  public async addMeeting(meeting: Meeting): Promise<Meeting> {
    const data = PrismaMeetingMapper.toOrmEntity(meeting);
    const orm: PrismaMeeting = await this.context.meeting.create({ data });

    return PrismaMeetingMapper.toDomainEntity(orm);
  }

  public async updateMeeting(
    by: { id: string },
    data: {
      startTime?: Date;
      endTime?: Date;
      title?: string;
      description?: string;
    },
  ): Promise<Nullable<{ id: string }>> {
    const meeting = await this.findMeeting(by);
    if (!meeting) return null;

    meeting.edit(data);
    const id = meeting.id;
    await this.context.meeting.update({
      where: { id },
      data: PrismaMeetingMapper.toOrmEntity(meeting),
    });

    return { id };
  }

  public async deleteMeeting(by: {
    id: string;
  }): Promise<Nullable<{ id: string }>> {
    const { id } = by;
    await this.context.meeting.delete({ where: { id } });
    return { id };
  }

  public async deleteMeetings(by: { ids: string[] }): Promise<string[]> {
    const deleteOptions: Prisma.MeetingDeleteManyArgs = {
      where: { id: { in: by.ids } },
    };
    await this.context.meeting.deleteMany(deleteOptions);
    return by.ids;
  }
}
