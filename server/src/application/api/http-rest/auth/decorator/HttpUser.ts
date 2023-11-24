import { HttpUserPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const HttpUser: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (Boolean(user)) return user as HttpUserPayload;
    else throw new Error("User not found");
  },
);
