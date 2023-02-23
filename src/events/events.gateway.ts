import { Server, Socket } from "socket.io";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import { IRealtimeEvent, RealtimeAction } from "./types";
import { TokenService } from "../token/token.service";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private _server: Server;

  private _events$ = new Subject<IRealtimeEvent>();

  events$ = this._events$.asObservable();

  static joinSocketToRooms(socket: Socket, roomsIds: string | string[]): void {
    socket.join(roomsIds);
  }

  constructor(private _tokenService: TokenService) {
  }

  handleConnection(socket: Socket): void {
    this._events$.next({socket, action: RealtimeAction.UserConnected});
  }

  handleDisconnect(socket: Socket): void {
    this._events$.next({socket, action: RealtimeAction.UserDisconnected});
  }

  emitEventToAll<T>(event: RealtimeAction, data: T): void {
    this._server.sockets.emit(event, data);
  }

  emitEventToRooms<T>(event: RealtimeAction, data: T, roomsIds: string | string[]): void {
    if (!roomsIds || !roomsIds.length) {
      this.emitEventToAll(event, data);
    } else {
      this._server.sockets.to(roomsIds).emit(event, data);
    }
  }

  getSocket(userId: string): Socket {
    let socket: Socket;
    this._server.sockets.sockets.forEach(iteratedSocket => {
      const socketUserId = this._tokenService.getDecodedAccessToken(iteratedSocket.handshake.headers)?.userId;
      if (socketUserId === userId) {
        socket = iteratedSocket;
      }
    })

    return socket;
  }

  @SubscribeMessage(RealtimeAction.NewMessage)
  private _handleNewMessageEvent(socket: Socket, data: string): void {
    this._events$.next({ action: RealtimeAction.NewMessage, data, socket });
  }
}
