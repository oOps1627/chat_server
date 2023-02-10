import { Server, Socket } from "socket.io";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { parse } from "cookie";
import { distinctUntilChanged, Subject } from "rxjs";
import { AuthService } from "../auth/auth.service";

export enum RealtimeEvent {
  UserConnected = 'UserConnected',
  UserDisconnected = 'UserDisconnected',
}

export enum ConnectionAction {
  Connect,
  Disconnect
}

export interface IConnectionEvent {
  action: ConnectionAction;
  userId: string;
}


@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private _connection$ = new Subject<IConnectionEvent>();

  connection$ = this._connection$.asObservable().pipe(
    distinctUntilChanged((prev, curr) => prev.action === curr.action && prev.userId === curr.userId)
  );

  @WebSocketServer()
  server: Server;

  constructor(private _authService: AuthService) {
  }

  handleConnection(socket: Socket): void {
    const userId = this._getUserIdBySocket(socket);
    this._connection$.next({userId, action: ConnectionAction.Connect});
  }

  handleDisconnect(socket: Socket): void {
    const userId = this._getUserIdBySocket(socket);
    this._connection$.next({userId, action: ConnectionAction.Disconnect});
  }

  @SubscribeMessage("delete group")
  createGroup(@MessageBody() data: string): any {
    return data;
  }

  private _getUserIdBySocket(socket: Socket): string {
    return this._authService.getUserIdFromCookies(parse(socket.handshake.headers.cookie));
  }
}
