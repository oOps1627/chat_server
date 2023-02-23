import { Controller, Get, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User } from "./user.schema";
import { AuthService } from "../auth/auth.service";
import { Request } from "express";
import { UsersService } from "./users.service";
import { TokenService } from "../token/token.service";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private _authService: AuthService,
              private _tokenService: TokenService,
              private _usersService: UsersService) {
  }

  @UseGuards(AuthGuard)
  @Get("user-info")
  async getUser(@Req() req: Request): Promise<User> {
    let userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;
    let user: User;

    if (!userId) {
      throw new UnauthorizedException();
    }
    try {
      user = await this._usersService.getUserById(userId);
    } catch (error) {
      console.error(error);
    }

    return user;
  }

  @UseGuards(AuthGuard)
  @Get('online')
  getOnlineUsers(): User[] {
    return this._usersService.getOnlineUsers();
  }
}
