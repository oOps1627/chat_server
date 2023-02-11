import { Controller, Get, HttpException, HttpStatus, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User } from "./user.schema";
import { AuthService } from "../auth/auth.service";
import { Request } from "express";
import { UsersService } from "./users.service";
import { IdentifierService } from "../identifier/identifier.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private _authService: AuthService,
              private _identifierService: IdentifierService,
              private _usersService: UsersService) {
  }

  @Get("user-info")
  async getUser(@Req() req: Request): Promise<User> {
    if (!this._authService.isAuthorized(req)) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    let userId = this._identifierService.identify(req.headers);
    let user: User;

    if (!userId) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }
    try {
      user = await this._usersService.getUserById(userId);
    } catch (error) {
      console.error(error);
    }

    return user;
  }

  @Get('online')
  getOnlineUsers(): User[] {
    return this._usersService.getOnlineUsers();
  }
}
