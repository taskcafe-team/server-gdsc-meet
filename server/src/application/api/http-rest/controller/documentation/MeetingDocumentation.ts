import { ApiProperty } from "@nestjs/swagger";

import { MeetingType } from "@core/common/enums/MeetingEnums";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinDate,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { IsBiggerThan } from "@core/common/util/class-validator/IsBiggerThan";

export class HttpMeetingParamModel {
  @IsNotEmpty() @IsUUID() public meetingId: string;
}

export class HttpRestApiModelCreateMeetingBody {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public description?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @MinDate(new Date(Date.now() - 5 * 60 * 1000)) // Now - 5 minute
  @ApiProperty({ type: Date, nullable: true, default: null })
  public startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @IsBiggerThan("startDate", {
    message: "End date must be bigger than start date",
  })
  @ApiProperty({ type: Date, nullable: true, default: null })
  public endDate?: Date;

  @ApiProperty({
    enum: MeetingType,
    nullable: true,
    default: MeetingType.PUBLIC,
  })
  @IsEnum(MeetingType)
  public type: MeetingType;
}

export class UpdateMeetingBodyModel {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", nullable: true, default: null })
  public description?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  // @MinDate(new Date(Date.now() - 5 * 60 * 1000)) // Now - 5 minute
  @ApiProperty({ type: Date, nullable: true, default: null })
  public startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @IsBiggerThan("startDate", {
    message: "End date must be bigger than start date",
  })
  @ApiProperty({ type: Date, nullable: true, default: null })
  public endDate?: Date;

  @IsOptional()
  @ApiProperty({
    enum: MeetingType,
    nullable: true,
    default: MeetingType.PUBLIC,
  })
  @IsEnum(MeetingType)
  public type: MeetingType;
}

export class HttpRestApiModelDeleteMeetingsBody {
  @Transform((params: TransformFnParams) => {
    return { ids: params.value.split(",") };
  })
  public ids: string[];
}

export class HttpDeleteMeetingsQueryModel {
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => `${params.value}`.split(","))
  @IsUUID("4", { each: true })
  public ids: string[];
}
