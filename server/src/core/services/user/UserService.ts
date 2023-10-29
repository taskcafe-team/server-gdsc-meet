import { Injectable } from "@nestjs/common";
import { UserUsecase } from "@core/domain/user/usecase/UserUsecase";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { GetUserPort } from "../../domain/user/port/GetUserPort";
import { CreateUserPort } from "../../domain/user/port/CreateUserPort";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Exception } from "@core/common/exception/Exception";
import Code from "@core/common/constants/Code";

@Injectable()
export class UserService implements UserUsecase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  public async getUser(payload: GetUserPort): Promise<UserUsecaseDto> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.userId });

    if (!user) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);
    return UserUsecaseDto.newFromEntity(user);
  }

  public async createUser(payload: CreateUserPort): Promise<UserUsecaseDto> {
    throw new Error("Not implemented");
  }
}
