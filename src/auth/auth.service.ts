import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.schema";
import { ITokenInfo, ITokens, TokenService } from "../token/token.service";
import { EventsGateway } from "../events/events.gateway";
import { Socket } from "socket.io";
import { Hasher } from "../helpers/hasher";

@Injectable()
export class AuthService {
  constructor(
    private _tokenService: TokenService,
    private _usersService: UsersService,
    private _eventsGateway: EventsGateway
  ) {
  }

  isAuthorized(req: Request): boolean {
    return !!this._tokenService.getDecodedAccessToken(req.headers);
  }

  async authorize(response: Response, loginDto: LoginDto): Promise<User> {
    const user: User = await this._usersService.getUserByUsername(loginDto.username);

    if (!user) {
      throw new NotFoundException("User with this username not exist");
    }

    if (!await this._isPasswordsMatch(loginDto, user)) {
      throw new BadRequestException("Password is incorrect");
    }

    const tokens = this._tokenService.generateTokens({ userId: user.id, username: user.username });
    await this._tokenService.saveTokens(response, tokens);

    return user;
  }

  async logout(response: Response): Promise<void> {
    const userId = this._tokenService.getDecodedAccessToken(response.req.headers)?.userId;
    await this._tokenService.deleteTokens(response);
    const socket: Socket = this._eventsGateway.getSocket(userId);
    socket.disconnect(true);
  }

  async register(body: RegisterDto): Promise<User> {
    return await this._usersService.createUser(body);
  }

  async refresh(response: Response): Promise<void> {
    const decodedToken: ITokenInfo = this._tokenService.getDecodedRefreshToken(response.req.headers);
    const isRefreshTokenValid: boolean = await this._tokenService.isRefreshTokenValid(response);
    const canRefresh: boolean = decodedToken && isRefreshTokenValid;

    if (canRefresh) {
      const user: User = await this._usersService.getUserById(decodedToken.userId);
      const tokens: ITokens = this._tokenService.generateTokens({ userId: user.id, username: user.username });
      await this._tokenService.saveTokens(response, tokens);
      response.send(200);
    } else {
      throw new UnauthorizedException();
    }
  }

  private _isPasswordsMatch(loginDto: LoginDto, user: User): Promise<boolean> {
    return Hasher.compare(loginDto.password, user.password);
  }
}
