import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { HydratedDocument, Model } from "mongoose";
import { CreateUserDto } from "./create-user.dto";
import { ConnectionAction, IConnectionEvent, RealtimeEvent } from "../events/types";
import { IdentifierService } from "../identifier/identifier.service";
import { Socket } from "socket.io";
import { EventsGateway } from "../events/events.gateway";
import { concatMap, from, map } from "rxjs";

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
    this._eventsService.connection$.pipe(
      map((event) => ({ ...event, userId: this._getUserIdBySocket(event.socket) })),
      concatMap((event) => {
        return from(this.getUserById(event.userId)).pipe(map((user) => ({ ...event, user: user })));
      })
    ).subscribe((event) => {
      if (event.action === ConnectionAction.Disconnect) {
        this._handleDisconnect(event.user);
      } else {
        this._handleConnection(event.user);
      }
    });
  }

  getOnlineUsers(): User[] {
    return this._connectedUsers.map(i => i.user);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel({ ...dto, id: String(Date.now()), roomsIds: [] });

    return newUser.save();
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne<User>({ username }).exec();
  }

  async getUserById(id: string): Promise<User> {
    return await this.userModel.findOne<User>({ id }).exec();
  }

  private _handleConnection(user: User): void {
    if (!user)
      return;

    const connectedUser: IConnectedUser = this._connectedUsers.find(i => i.user.id === user.id);
    if (connectedUser) {
      connectedUser.connections += 1;
    } else {
      this._connectedUsers.push({ user, connections: 1 });
      this._eventsService.emitEventToAll(RealtimeEvent.UserConnected, user);
    }
  }

  private _handleDisconnect(user: User): void {
    if (!user)
      return;

    const connectedUser: IConnectedUser = this._connectedUsers.find(i => i.user.id === user.id);
    connectedUser.connections -= 1;
    if (!connectedUser.connections) {
      this._connectedUsers = this._connectedUsers.filter((userInfo) => userInfo.connections !== 0);
      this._eventsService.emitEventToAll(RealtimeEvent.UserDisconnected, user);
    }
  }

  private _getUserIdBySocket(socket: Socket): string {
    return this._identifierService.identify(socket.handshake.headers);
  }
}
