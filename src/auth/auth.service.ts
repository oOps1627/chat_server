import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.schema";
import { IdentifierService } from "../identifier/identifier.service";
import { EventsGateway } from "../events/events.gateway";
import { Socket } from "socket.io";

@Injectable()
export class AuthService {
  constructor(
    private _identifierService: IdentifierService,
    private _usersService: UsersService,
    private _eventsGateway: EventsGateway
  ) {
  }

  isAuthorized(req: Request): boolean {
    return !!this._identifierService.identify(req.headers);
  }

  async authorize(response: Response, loginDto: LoginDto): Promise<User> {
    const user: User = await this._usersService.getUserByUsername(loginDto.username);

    if (!user) {
      throw new HttpException("User with this username not exist", HttpStatus.NOT_FOUND);
    }

    if (!this._isPasswordsMatch(loginDto, user)) {
      throw new HttpException("Password is incorrect", HttpStatus.UNAUTHORIZED);
    }

    this._identifierService.mark(response, user);

    return user;
  }

  logout(response: Response): void {
    this._identifierService.mark(response, null);
    const userId = this._identifierService.identify(response.req.headers);
    const socket: Socket = this._eventsGateway.getSocket(userId);
    socket.disconnect(true);
  }

  async register(body: RegisterDto): Promise<User> {
    return await this._usersService.createUser(body);
  }

  private _isPasswordsMatch(loginDto: LoginDto, user: User): boolean {
    return true;
  }
}
