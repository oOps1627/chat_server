import { Server, Socket } from "socket.io";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import { ConnectionAction, IConnectionEvent, RealtimeEvent } from "./types";
import { IdentifierService } from "../identifier/identifier.service";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private _server: Server;

  private _connection$ = new Subject<IConnectionEvent>();

  connection$ = this._connection$.asObservable();

  constructor(private _identifierService: IdentifierService) {
  }

  handleConnection(socket: Socket): void {
    this._connection$.next({socket, action: ConnectionAction.Connect});
  }

  handleDisconnect(socket: Socket): void {
    this._connection$.next({socket, action: ConnectionAction.Disconnect});
  }

  emitEventToAll<T>(event: RealtimeEvent, data: T): void {
    this._server.sockets.emit(event, data);
  }

  getSocket(userId: string): Socket {
    let socket: Socket;
    this._server.sockets.sockets.forEach(iteratedSocket => {
      const socketUserId = this._identifierService.identify(iteratedSocket.handshake.headers);
      if (socketUserId === userId) {
        socket = iteratedSocket;
      }
    })

    return socket;
  }

  // @SubscribeMessage("delete group")
  // private _createGroup(@MessageBody() data: string): any {
  //   return data;
  // }
}
