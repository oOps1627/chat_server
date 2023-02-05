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
import { parse } from "cookie";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    this.updateAuthorization(socket);
  }

  handleDisconnect(client: any): any {
  }

  @SubscribeMessage("delete group")
  createGroup(@MessageBody() data: string): any {
    return data;
  }

  public updateAuthorization(socket: Socket): void {
    if (!socket) {
      return;
    }

    const user = this._getUserFromCookies(socket.handshake.headers.cookie);
    socket.emit("check-authorization", user);
  }

  private _getUserFromCookies(cookies: string) {
    let user;

    try {
      user = JSON.parse(parse(cookies)?.user ?? "");
    } catch (e) {
    }

    return { username: user?.username ?? "Гість", authorized: !!user };
  }
}
