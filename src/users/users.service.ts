import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { HydratedDocument, Model } from "mongoose";
import { CreateUserDto } from "./create-user.dto";
import { IRealtimeEvent, RealtimeAction } from "../events/types";
import { IdentifierService } from "../identifier/identifier.service";
import { Socket } from "socket.io";
import { EventsGateway } from "../events/events.gateway";
import { concatMap, filter, from, map } from "rxjs";
import { PasswordHasher } from "../auth/password-hasher";

interface IConnectedUser {
  connections: number;
  user: User;
}

@Injectable()
export class UsersService {
  private _connectedUsers: IConnectedUser[] = [];

  constructor(@InjectModel(User.name) private userModel: Model<HydratedDocument<User>>,
              private _eventsService: EventsGateway,
              private _identifierService: IdentifierService
  ) {
    this._eventsService.events$.pipe(
      filter(event => [RealtimeAction.UserConnected, RealtimeAction.UserDisconnected].includes(event.action)),
      concatMap((event) => {
        const userId = this._getUserIdBySocket(event.socket);
        return from(this.getUserById(userId)).pipe(map((user) => ({ ...event, user: user })));
      })
    ).subscribe((event: IRealtimeEvent & { user: User }) => {
      if (event.action === RealtimeAction.UserDisconnected) {
        this._handleDisconnect(event.user);
      } else {
        this._handleConnection(event.user, event.socket);
      }
    });
  }

  getOnlineUsers(): User[] {
    return this._connectedUsers.map(i => i.user);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.userModel.create({
      id: String(Date.now()),
      roomsIds: [],
      username: dto.username,
      password: await PasswordHasher.hashPassword(dto.password)
    });
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne<User>({ username }).exec();
  }

  async getUserById(id: string): Promise<User> {
    return await this.userModel.findOne<User>({ id }).exec();
  }

  private _handleConnection(user: User, socket: Socket): void {
    if (!user)
      return;

    const connectedUser: IConnectedUser = this._connectedUsers.find(i => i.user.id === user.id);
    if (connectedUser) {
      connectedUser.connections += 1;
    } else {
      this._connectedUsers.push({ user, connections: 1 });
      this._eventsService.emitEventToAll(RealtimeAction.UserConnected, user);
    }

    EventsGateway.joinSocketToRooms(socket, user.roomsIds);
  }

  private _handleDisconnect(user: User): void {
    if (!user)
      return;

    const connectedUser: IConnectedUser = this._connectedUsers.find(i => i.user.id === user.id);
    connectedUser.connections -= 1;
    if (!connectedUser.connections) {
      this._connectedUsers = this._connectedUsers.filter((userInfo) => userInfo.connections !== 0);
      this._eventsService.emitEventToAll(RealtimeAction.UserDisconnected, user);
    }
  }

  private _getUserIdBySocket(socket: Socket): string {
    return this._identifierService.identify(socket.handshake.headers)?.userId;
  }
}
